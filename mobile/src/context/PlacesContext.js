import React, { createContext, useContext, useMemo, useState } from 'react';
import { demoLists, demoPlaces } from '../data/demoPlaces';

const PlacesContext = createContext(null);

export function PlacesProvider({ children }) {
  const [places, setPlaces] = useState(demoPlaces);
  const [lists, setLists] = useState(demoLists);

  const addPlace = (input) => {
    const place = {
      id: `${Date.now()}`,
      name: input.name.trim(),
      type: input.type.trim(),
      city: input.city.trim(),
      country: input.country.trim(),
      caption: input.caption?.trim() || '',
      description: input.description?.trim() || '',
      imageUrl: input.imageUrl?.trim() || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
      status: input.status || 'want_to_go',
      rating: Number(input.rating) || 0,
      price: Number(input.price) || 1,
      note: input.note?.trim() || '',
      tags: input.tags || [],
      lists: input.lists || [],
    };

    setPlaces((current) => [place, ...current]);
    return place;
  };

  const savePlace = (placeId, personalData) => {
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
          }
        : place
    )));
  };

  const createList = (name) => {
    const cleanName = name.trim();
    if (!cleanName || lists.includes(cleanName)) return;
    setLists((current) => [...current, cleanName]);
  };

  const value = useMemo(() => ({ places, lists, addPlace, savePlace, createList }), [places, lists]);

  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>;
}

export function usePlaces() {
  const value = useContext(PlacesContext);
  if (!value) throw new Error('usePlaces must be used inside PlacesProvider');
  return value;
}
