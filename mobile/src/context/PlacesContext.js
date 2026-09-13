import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { demoLists, demoPlaces } from '../data/demoPlaces';
import * as api from '../services/api';

const PlacesContext = createContext(null);

function normalizePlace(raw) {
  return {
    id: String(raw._id || raw.id),
    name: raw.name || '',
    type: raw.type || '',
    city: raw.city || '',
    country: raw.country || '',
    address: raw.address || '',
    caption: raw.caption || '',
    description: raw.description || '',
    imageUrl: raw.imageUrl || '',
    status: null,
    rating: 0,
    price: 1,
    note: '',
    tags: [],
    lists: [],
    isSaved: false,
  };
}

function normalizeSavedRecord(record) {
  const place = normalizePlace(record.place || {});
  return {
    ...place,
    status: record.status || 'want_to_go',
    rating: Number(record.rating) || 0,
    price: Number(record.price) || 1,
    note: record.note || '',
    tags: record.tags || [],
    lists: (record.lists || []).map((list) => typeof list === 'string' ? list : list.name).filter(Boolean),
    isSaved: true,
  };
}

function localPlaceFromInput(input) {
  return {
    id: `${Date.now()}`,
    name: input.name.trim(),
    type: input.type.trim(),
    city: input.city.trim(),
    country: input.country.trim(),
    address: input.address?.trim() || '',
    caption: input.caption?.trim() || '',
    description: input.description?.trim() || '',
    imageUrl: input.imageUrl?.trim() || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    status: input.status || 'want_to_go',
    rating: Number(input.rating) || 0,
    price: Number(input.price) || 1,
    note: input.note?.trim() || '',
    tags: input.tags || [],
    lists: input.lists || [],
    isSaved: true,
  };
}

function unsavedVersion(place) {
  return {
    ...place,
    status: null,
    rating: 0,
    price: 1,
    note: '',
    tags: [],
    lists: [],
    isSaved: false,
  };
}

function mergeCorePlace(existing, raw) {
  const core = normalizePlace(raw);
  return {
    ...core,
    status: existing.status,
    rating: existing.rating,
    price: existing.price,
    note: existing.note,
    tags: existing.tags,
    lists: existing.lists,
    isSaved: existing.isSaved,
  };
}

export function PlacesProvider({ children }) {
  const [places, setPlaces] = useState(() => demoPlaces.map((place) => ({ ...place, isSaved: true })));
  const [lists, setLists] = useState(demoLists);
  const [loading, setLoading] = useState(api.isApiConfigured);
  const [syncError, setSyncError] = useState('');

  const refresh = useCallback(async () => {
    if (!api.isApiConfigured) return;

    setLoading(true);
    setSyncError('');

    try {
      const [placeRows, savedRows, listRows] = await Promise.all([
        api.getPlaces(),
        api.getSavedPlaces(),
        api.getLists(),
      ]);

      const savedByPlaceId = new Map(
        savedRows
          .filter((record) => record.place)
          .map((record) => [String(record.place._id || record.place.id), normalizeSavedRecord(record)])
      );

      const mergedPlaces = placeRows.map((row) => {
        const base = normalizePlace(row);
        return savedByPlaceId.get(base.id) || base;
      });

      setPlaces(mergedPlaces);
      setLists(listRows.map((list) => list.name).filter(Boolean));
    } catch (error) {
      setSyncError(error.message || 'Unable to sync Places');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPlace = async (input) => {
    setSyncError('');

    if (!api.isApiConfigured) {
      const place = localPlaceFromInput(input);
      setPlaces((current) => [place, ...current]);
      return place;
    }

    try {
      const placeRecord = await api.createPlace({
        name: input.name.trim(),
        type: input.type.trim(),
        city: input.city.trim(),
        country: input.country.trim(),
        address: input.address?.trim() || '',
        caption: input.caption?.trim() || '',
        description: input.description?.trim() || '',
        imageUrl: input.imageUrl?.trim() || '',
      });

      const savedRecord = await api.savePersonalPlace(placeRecord._id, {
        status: input.status || 'want_to_go',
        rating: Number(input.rating) || 0,
        price: Number(input.price) || 1,
        note: input.note?.trim() || '',
        tags: input.tags || [],
        lists: input.lists || [],
      });

      const place = normalizeSavedRecord(savedRecord);
      setPlaces((current) => [place, ...current.filter((item) => item.id !== place.id)]);
      setLists((current) => [...new Set([...current, ...(place.lists || [])])]);
      return place;
    } catch (error) {
      setSyncError(error.message || 'Unable to add place');
      throw error;
    }
  };

  const updatePlace = async (placeId, input) => {
    setSyncError('');

    if (!api.isApiConfigured) {
      let updatedPlace = null;
      setPlaces((current) => current.map((place) => {
        if (place.id !== placeId) return place;
        updatedPlace = {
          ...place,
          name: input.name.trim(),
          type: input.type.trim(),
          city: input.city.trim(),
          country: input.country.trim(),
          address: input.address?.trim() || '',
          caption: input.caption?.trim() || '',
          description: input.description?.trim() || '',
          imageUrl: input.imageUrl?.trim() || '',
        };
        return updatedPlace;
      }));
      return updatedPlace;
    }

    try {
      const record = await api.updatePlace(placeId, {
        name: input.name.trim(),
        type: input.type.trim(),
        city: input.city.trim(),
        country: input.country.trim(),
        address: input.address?.trim() || '',
        caption: input.caption?.trim() || '',
        description: input.description?.trim() || '',
        imageUrl: input.imageUrl?.trim() || '',
      });

      let updatedPlace = null;
      setPlaces((current) => current.map((place) => {
        if (place.id !== placeId) return place;
        updatedPlace = mergeCorePlace(place, record);
        return updatedPlace;
      }));
      return updatedPlace;
    } catch (error) {
      setSyncError(error.message || 'Unable to update place');
      throw error;
    }
  };

  const deletePlace = async (placeId) => {
    setSyncError('');

    try {
      if (api.isApiConfigured) {
        await api.deletePlace(placeId);
      }
      setPlaces((current) => current.filter((place) => place.id !== placeId));
    } catch (error) {
      setSyncError(error.message || 'Unable to delete place');
      throw error;
    }
  };

  const savePlace = async (placeId, personalData) => {
    setSyncError('');

    if (!api.isApiConfigured) {
      setPlaces((current) => current.map((place) => (
        place.id === placeId
          ? {
              ...place,
              status: personalData.status,
              rating: Number(personalData.rating) || 0,
              price: Number(personalData.price) || 1,
              note: personalData.note?.trim() || '',
              tags: personalData.tags || [],
              lists: personalData.lists || [],
              isSaved: true,
            }
          : place
      )));
      setLists((current) => [...new Set([...current, ...(personalData.lists || [])])]);
      return;
    }

    try {
      const savedRecord = await api.savePersonalPlace(placeId, personalData);
      const savedPlace = normalizeSavedRecord(savedRecord);
      setPlaces((current) => current.map((place) => place.id === placeId ? savedPlace : place));
      setLists((current) => [...new Set([...current, ...(savedPlace.lists || [])])]);
    } catch (error) {
      setSyncError(error.message || 'Unable to save place');
      throw error;
    }
  };

  const removeSavedPlace = async (placeId) => {
    setSyncError('');

    if (!api.isApiConfigured) {
      setPlaces((current) => current.map((place) => place.id === placeId ? unsavedVersion(place) : place));
      return;
    }

    try {
      await api.deleteSavedPlace(placeId);
      setPlaces((current) => current.map((place) => place.id === placeId ? unsavedVersion(place) : place));
    } catch (error) {
      setSyncError(error.message || 'Unable to remove saved place');
      throw error;
    }
  };

  const createList = async (name) => {
    const cleanName = name.trim();
    if (!cleanName || lists.includes(cleanName)) return cleanName;

    setSyncError('');

    if (!api.isApiConfigured) {
      setLists((current) => [...current, cleanName]);
      return cleanName;
    }

    try {
      const list = await api.createList(cleanName);
      setLists((current) => [...new Set([...current, list.name])]);
      return list.name;
    } catch (error) {
      setSyncError(error.message || 'Unable to create list');
      throw error;
    }
  };

  const deleteList = async (name) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    setSyncError('');

    try {
      if (api.isApiConfigured) {
        await api.deleteList(cleanName);
      }

      setLists((current) => current.filter((list) => list !== cleanName));
      setPlaces((current) => current.map((place) => ({
        ...place,
        lists: (place.lists || []).filter((list) => list !== cleanName),
      })));
    } catch (error) {
      setSyncError(error.message || 'Unable to delete list');
      throw error;
    }
  };

  const value = useMemo(() => ({
    places,
    lists,
    loading,
    syncError,
    isPersistent: api.isApiConfigured,
    addPlace,
    updatePlace,
    deletePlace,
    savePlace,
    removeSavedPlace,
    createList,
    deleteList,
    refresh,
  }), [places, lists, loading, syncError, refresh]);

  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>;
}

export function usePlaces() {
  const value = useContext(PlacesContext);
  if (!value) throw new Error('usePlaces must be used inside PlacesProvider');
  return value;
}
