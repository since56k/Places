import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import * as api from '../services/api';
import { colors, radius, spacing, typography } from '../theme';

const filterDefinitions = [
  { key: 'type', label: 'Type' },
  { key: 'country', label: 'Country' },
  { key: 'city', label: 'City' },
  { key: 'price', label: 'Price' },
  { key: 'rating', label: 'Rating' },
];
const sortOptions = [
  { key: 'recent', label: 'Recent' },
  { key: 'rating', label: 'Rating' },
  { key: 'name', label: 'Name' },
  { key: 'city', label: 'City' },
];
const emptyFilters = { type: null, country: null, city: null, price: null, rating: null };
const cardGap = 12;
const cardWidth = (Dimensions.get('window').width - 32 - cardGap) / 2;

export default function MyPlacesScreen({ navigation, route }) {
  const {
    places,
    lists,
    loading,
    syncError,
    isPersistent,
    refresh,
    createList,
    deleteList,
    removeSavedPlace,
    savePlace,
  } = usePlaces();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedList, setSelectedList] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState('recent');
  const [activeFilter, setActiveFilter] = useState(null);
  const [newListVisible, setNewListVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [listSaving, setListSaving] = useState(false);
  const [renameListVisible, setRenameListVisible] = useState(false);
  const [renameSource, setRenameSource] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [managePlace, setManagePlace] = useState(null);
  const [manageSaving, setManageSaving] = useState(false);

  useEffect(() => {
    if (!route?.params?.nonce) return;
    setQuery('');
    setFilters(emptyFilters);
    setSort('recent');
    setStatus(route.params.status || 'all');
    setSelectedList(route.params.listName || null);
  }, [route?.params?.nonce, route?.params?.status, route?.params?.listName]);

  const savedPlaces = useMemo(() => places.filter((place) => place.isSaved !== false), [places]);

  const filterOptions = useMemo(() => {
    if (!activeFilter) return [];
    if (activeFilter === 'price') return [1, 2, 3, 4];
    if (activeFilter === 'rating') return [1, 2, 3, 4, 5];
    return [...new Set(savedPlaces.map((place) => place[activeFilter]).filter(Boolean))].sort();
  }, [activeFilter, savedPlaces]);

  const visiblePlaces = useMemo(() => {
    const filtered = savedPlaces.filter((place) => {
      const matchesStatus = status === 'all' || place.status === status;
      const matchesList = !selectedList || (place.lists || []).includes(selectedList);
      const matchesFilters = (!filters.type || place.type === filters.type)
        && (!filters.country || place.country === filters.country)
        && (!filters.city || place.city === filters.city)
        && (!filters.price || Number(place.price) === Number(filters.price))
        && (!filters.rating || Number(place.rating) === Number(filters.rating));
      const text = `${place.name} ${place.city} ${place.country} ${place.type} ${(place.tags || []).join(' ')} ${place.note || ''}`.toLowerCase();
      return matchesStatus && matchesList && matchesFilters && text.includes(query.trim().toLowerCase());
    });

    if (sort === 'rating') return [...filtered].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    if (sort === 'name') return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'city') return [...filtered].sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
    return filtered;
  }, [savedPlaces, query, status, selectedList, filters, sort]);

  const listCounts = useMemo(() => Object.fromEntries(
    lists.map((list) => [list, savedPlaces.filter((place) => (place.lists || []).includes(list)).length])
  ), [lists, savedPlaces]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const hasLibraryFilters = activeFilterCount > 0 || status !== 'all' || !!selectedList || !!query;

  const displayFilterValue = (key) => {
    const value = filters[key];
    if (!value) return null;
    if (key === 'price') return '€'.repeat(Number(value));
    if (key === 'rating') return `★ ${value}`;
    return String(value);
  };

  const resetLibrary = () => {
    setQuery('');
    setStatus('all');
    setSelectedList(null);
    setFilters(emptyFilters);
    setSort('recent');
  };

  const handleCreateList = async () => {
    const cleanName = newListName.trim();
    if (!cleanName || listSaving) return;
    setListSaving(true);
    try {
      const created = await createList(cleanName);
      setSelectedList(created);
      setNewListName('');
      setNewListVisible(false);
    } finally {
      setListSaving(false);
    }
  };

  const openRenameList = (list) => {
    setRenameSource(list);
    setRenameValue(list);
    setRenameListVisible(true);
  };

  const handleRenameList = async () => {
    const cleanName = renameValue.trim();
    if (!cleanName || cleanName === renameSource || renaming) {
      setRenameListVisible(false);
      return;
    }
    if (!isPersistent) {
      Alert.alert('Synced mode required', 'List renaming is available when the app is connected to the Places API.');
      return;
    }

    setRenaming(true);
    try {
      await api.renameList(renameSource, cleanName);
      await refresh();
      if (selectedList === renameSource) setSelectedList(cleanName);
      setRenameListVisible(false);
    } catch (error) {
      Alert.alert('Unable to rename list', error.message || 'Please try again.');
    } finally {
      setRenaming(false);
    }
  };

  const confirmDeleteList = (list) => {
    Alert.alert(
      'Delete list?',
      `“${list}” will be removed. The places inside it will stay saved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteList(list);
            if (selectedList === list) setSelectedList(null);
          },
        },
      ]
    );
  };

  const confirmRemovePlace = (place) => {
    Alert.alert(
      'Remove saved place?',
      `${place.name} will be removed from My Places.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeSavedPlace(place.id) },
      ]
    );
  };

  const removeFromSelectedList = async (place) => {
    if (!selectedList) return;
    await savePlace(place.id, {
      status: place.status,
      rating: place.rating,
      price: place.price,
      note: place.note,
      tags: place.tags || [],
      lists: (place.lists || []).filter((list) => list !== selectedList),
    });
  };

  const togglePlaceList = async (list) => {
    if (!managePlace || manageSaving) return;
    const currentLists = managePlace.lists || [];
    const nextLists = currentLists.includes(list)
      ? currentLists.filter((item) => item !== list)
      : [...currentLists, list];

    setManageSaving(true);
    try {
      await savePlace(managePlace.id, {
        status: managePlace.status,
        rating: managePlace.rating,
        price: managePlace.price,
        note: managePlace.note,
        tags: managePlace.tags || [],
        lists: nextLists,
      });
      setManagePlace((current) => current ? { ...current, lists: nextLists } : current);
    } finally {
      setManageSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.title}>My Places</Text>
            <Text style={styles.syncLabel}>{savedPlaces.length} saved · {lists.length} {lists.length === 1 ? 'list' : 'lists'}</Text>
          </View>
          <TouchableOpacity onPress={refresh} disabled={!isPersistent || loading} style={styles.refreshButton}>
            <Ionicons name={loading ? 'cloud-upload-outline' : 'refresh-outline'} size={20} color={isPersistent ? colors.text : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {!!syncError && <Text style={styles.syncError}>{syncError}</Text>}

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search my places" placeholderTextColor={colors.textSecondary} style={styles.search} />
          {!!query && <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={colors.textSecondary} /></TouchableOpacity>}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {filterDefinitions.map((filter) => {
            const value = displayFilterValue(filter.key);
            return (
              <TouchableOpacity key={filter.key} onPress={() => setActiveFilter(filter.key)} style={[styles.chip, value && styles.chipActive]}>
                <Text style={[styles.chipText, value && styles.chipTextActive]}>{value || filter.label}</Text>
                <Ionicons name="chevron-down" size={13} color={value ? colors.accentDark : colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.segment}>
          {[['all', 'All'], ['visited', 'Visited'], ['want_to_go', 'Want to go']].map(([value, label]) => (
            <TouchableOpacity key={value} onPress={() => setStatus(value)} style={[styles.segmentItem, status === value && styles.segmentActive]}>
              <Text style={[styles.segmentText, status === value && styles.segmentTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.libraryTools}>
          <Text style={styles.toolLabel}>Sort</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
            {sortOptions.map((item) => (
              <TouchableOpacity key={item.key} onPress={() => setSort(item.key)} style={styles.sortButton}>
                <Text style={[styles.sortText, sort === item.key && styles.sortTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {hasLibraryFilters && (
            <TouchableOpacity onPress={resetLibrary} style={styles.resetButton}>
              <Ionicons name="refresh-outline" size={14} color={colors.accent} />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {activeFilterCount > 0 && (
          <View style={styles.activeSummary}>
            <Text style={styles.activeSummaryText}>{activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active</Text>
            <TouchableOpacity onPress={() => setFilters(emptyFilters)}><Text style={styles.clearText}>Clear filters</Text></TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Lists</Text>
          <TouchableOpacity onPress={() => setNewListVisible(true)}><Text style={styles.link}>+ New list</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listRow}>
          {lists.map((list) => (
            <View key={list} style={[styles.listCard, selectedList === list && styles.listCardSelected]}>
              <TouchableOpacity style={styles.listCardMain} onPress={() => setSelectedList(selectedList === list ? null : list)}>
                <Text style={styles.listName} numberOfLines={2}>{list}</Text>
                <Text style={styles.listCount}>{listCounts[list]} {listCounts[list] === 1 ? 'place' : 'places'}</Text>
              </TouchableOpacity>
              <View style={styles.listActions}>
                <TouchableOpacity onPress={() => openRenameList(list)} style={styles.listIconButton} hitSlop={8}>
                  <Ionicons name="pencil-outline" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDeleteList(list)} style={styles.listIconButton} hitSlop={8}>
                  <Ionicons name="trash-outline" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={() => setNewListVisible(true)} style={[styles.listCard, styles.newList]}>
            <Ionicons name="add" size={20} color={colors.accent} />
            <Text style={styles.newListText}>New list</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View style={styles.savedHeading}>
            <Text style={styles.sectionTitle}>{selectedList || 'Saved'}</Text>
            {selectedList && (
              <TouchableOpacity onPress={() => setSelectedList(null)} style={styles.closeListButton}>
                <Ionicons name="close" size={14} color={colors.accentDark} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.count}>{visiblePlaces.length} {visiblePlaces.length === 1 ? 'place' : 'places'}</Text>
        </View>

        <View style={styles.grid}>
          {visiblePlaces.map((place) => (
            <TouchableOpacity key={place.id} style={styles.placeCard} activeOpacity={0.9} onPress={() => navigation.navigate('PlaceDetails', { placeId: place.id })}>
              <View style={styles.placeImageWrap}>
                <Image source={{ uri: place.imageUrl }} style={styles.placeImage} />
                <TouchableOpacity onPress={() => setManagePlace(place)} style={[styles.cardAction, styles.manageListsButton]} hitSlop={8}>
                  <Ionicons name="albums-outline" size={16} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => selectedList ? removeFromSelectedList(place) : confirmRemovePlace(place)}
                  style={[styles.cardAction, styles.removePlaceButton]}
                  hitSlop={8}
                >
                  <Ionicons name={selectedList ? 'remove' : 'bookmark'} size={16} color={selectedList ? colors.error : colors.accent} />
                </TouchableOpacity>
              </View>
              <Text style={styles.placeName} numberOfLines={2}>{place.name}</Text>
              <Text style={styles.placeMeta}>{place.city} · {'€'.repeat(place.price || 1)}{place.rating ? ` · ★ ${place.rating}` : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!visiblePlaces.length && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}><Ionicons name="bookmark-outline" size={24} color={colors.accent} /></View>
            <Text style={styles.emptyTitle}>{selectedList ? 'This list is empty' : 'No places found'}</Text>
            <Text style={styles.emptyText}>{hasLibraryFilters ? 'Try changing or resetting your filters.' : 'Saved places will appear here.'}</Text>
            {hasLibraryFilters && <TouchableOpacity onPress={resetLibrary} style={styles.emptyButton}><Text style={styles.emptyButtonText}>Reset library</Text></TouchableOpacity>}
          </View>
        )}
      </ScrollView>

      <Modal transparent visible={!!activeFilter} animationType="fade" onRequestClose={() => setActiveFilter(null)}>
        <TouchableOpacity activeOpacity={1} style={styles.modalBackdrop} onPress={() => setActiveFilter(null)}>
          <View style={styles.filterSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{filterDefinitions.find((item) => item.key === activeFilter)?.label}</Text>
            <TouchableOpacity onPress={() => { setFilters((current) => ({ ...current, [activeFilter]: null })); setActiveFilter(null); }} style={styles.filterOption}>
              <Text style={styles.filterOptionText}>Any</Text>
              {!filters[activeFilter] && <Ionicons name="checkmark" size={18} color={colors.accent} />}
            </TouchableOpacity>
            {filterOptions.map((option) => {
              const selected = String(filters[activeFilter]) === String(option);
              const label = activeFilter === 'price' ? '€'.repeat(Number(option)) : activeFilter === 'rating' ? `★ ${option}` : String(option);
              return (
                <TouchableOpacity key={String(option)} onPress={() => { setFilters((current) => ({ ...current, [activeFilter]: option })); setActiveFilter(null); }} style={styles.filterOption}>
                  <Text style={styles.filterOptionText}>{label}</Text>
                  {selected && <Ionicons name="checkmark" size={18} color={colors.accent} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={newListVisible} animationType="fade" onRequestClose={() => setNewListVisible(false)}>
        <KeyboardAvoidingView style={styles.keyboardAvoider} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={12}>
          <View style={styles.modalBackdrop}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Create a list</Text>
              <TextInput
                autoFocus
                value={newListName}
                onChangeText={setNewListName}
                placeholder="e.g. Tuscany weekends"
                placeholderTextColor={colors.textSecondary}
                style={styles.sheetInput}
                returnKeyType="done"
                onSubmitEditing={handleCreateList}
              />
              <View style={styles.sheetActions}>
                <TouchableOpacity onPress={() => setNewListVisible(false)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleCreateList} disabled={!newListName.trim() || listSaving} style={[styles.primaryButton, (!newListName.trim() || listSaving) && styles.disabledButton]}><Text style={styles.primaryButtonText}>{listSaving ? 'Creating...' : 'Create list'}</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal transparent visible={renameListVisible} animationType="fade" onRequestClose={() => setRenameListVisible(false)}>
        <KeyboardAvoidingView style={styles.keyboardAvoider} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={12}>
          <View style={styles.modalBackdrop}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Rename list</Text>
              <TextInput
                autoFocus
                selectTextOnFocus
                value={renameValue}
                onChangeText={setRenameValue}
                placeholder="List name"
                placeholderTextColor={colors.textSecondary}
                style={styles.sheetInput}
                returnKeyType="done"
                onSubmitEditing={handleRenameList}
              />
              <View style={styles.sheetActions}>
                <TouchableOpacity onPress={() => setRenameListVisible(false)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleRenameList} disabled={!renameValue.trim() || renaming} style={[styles.primaryButton, (!renameValue.trim() || renaming) && styles.disabledButton]}><Text style={styles.primaryButtonText}>{renaming ? 'Renaming...' : 'Rename'}</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal transparent visible={!!managePlace} animationType="fade" onRequestClose={() => setManagePlace(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.manageSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Manage lists</Text>
            <Text style={styles.managePlaceName}>{managePlace?.name}</Text>
            <ScrollView style={styles.manageListScroll}>
              {lists.map((list) => {
                const selected = (managePlace?.lists || []).includes(list);
                return (
                  <TouchableOpacity key={list} disabled={manageSaving} onPress={() => togglePlaceList(list)} style={styles.filterOption}>
                    <Text style={styles.filterOptionText}>{list}</Text>
                    <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={selected ? colors.accent : colors.textSecondary} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity onPress={() => setManagePlace(null)} style={[styles.primaryButton, styles.doneButton]}><Text style={styles.primaryButtonText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 44 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headingCopy: { flex: 1, paddingRight: spacing.md },
  title: { fontFamily: typography.fontFamily.display, fontSize: typography.size.display, lineHeight: typography.lineHeight.display, color: colors.text },
  syncLabel: { marginTop: 2, fontFamily: typography.fontFamily.body, fontSize: 12, color: colors.textSecondary },
  refreshButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  syncError: { marginTop: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: '#FDECEC', color: colors.error, fontFamily: typography.fontFamily.medium, fontSize: 12 },
  searchWrap: { marginTop: spacing.lg, height: 50, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10 },
  search: { flex: 1, height: '100%', fontFamily: typography.fontFamily.body, fontSize: 14, color: colors.text },
  filtersRow: { gap: 8, paddingVertical: spacing.md },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 13, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 5 },
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft },
  chipText: { fontFamily: typography.fontFamily.medium, color: colors.text, fontSize: 12 },
  chipTextActive: { color: colors.accentDark },
  segment: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, padding: 4 },
  segmentItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.accentSoft },
  segmentText: { color: colors.textSecondary, fontFamily: typography.fontFamily.medium, fontSize: 12 },
  segmentTextActive: { color: colors.accentDark },
  libraryTools: { marginTop: 12, minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 10 },
  toolLabel: { fontFamily: typography.fontFamily.medium, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.7, color: colors.textSecondary },
  sortRow: { gap: 12, alignItems: 'center', paddingRight: 8 },
  sortButton: { paddingVertical: 7 },
  sortText: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  sortTextActive: { color: colors.accentDark },
  resetButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 32, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  resetText: { fontFamily: typography.fontFamily.medium, fontSize: 11, color: colors.accent },
  activeSummary: { marginTop: 8, padding: 10, borderRadius: radius.md, backgroundColor: colors.accentSoft, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeSummaryText: { fontFamily: typography.fontFamily.medium, fontSize: 11, color: colors.accentDark },
  clearText: { fontFamily: typography.fontFamily.semibold, fontSize: 11, color: colors.accentDark },
  sectionHeader: { marginTop: spacing.xl, marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: typography.fontFamily.display, fontSize: 27, color: colors.text },
  link: { fontFamily: typography.fontFamily.semibold, fontSize: 12, color: colors.accent },
  count: { fontFamily: typography.fontFamily.medium, fontSize: 11, color: colors.textSecondary },
  listRow: { gap: spacing.sm, paddingBottom: 2 },
  listCard: { width: 146, height: 108, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  listCardSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  listCardMain: { flex: 1, padding: spacing.md, justifyContent: 'flex-end' },
  listActions: { position: 'absolute', top: 7, right: 7, flexDirection: 'row', gap: 4 },
  listIconButton: { width: 27, height: 27, borderRadius: 14, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  newList: { padding: spacing.md, justifyContent: 'center', alignItems: 'flex-start', backgroundColor: colors.accentSoft, borderColor: colors.accentSoft },
  newListText: { marginTop: 4, fontFamily: typography.fontFamily.semibold, fontSize: 12, color: colors.accentDark },
  listName: { fontFamily: typography.fontFamily.display, fontSize: 20, lineHeight: 23, color: colors.text },
  listCount: { marginTop: 5, fontFamily: typography.fontFamily.body, fontSize: 11, color: colors.textSecondary },
  savedHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  closeListButton: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: cardGap },
  placeCard: { width: cardWidth, marginBottom: spacing.lg },
  placeImageWrap: { position: 'relative' },
  placeImage: { width: cardWidth, height: cardWidth * 1.1, borderRadius: radius.lg, backgroundColor: colors.surfaceSoft },
  cardAction: { position: 'absolute', bottom: 8, width: 31, height: 31, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  manageListsButton: { left: 8 },
  removePlaceButton: { right: 8 },
  placeName: { marginTop: 9, fontFamily: typography.fontFamily.display, fontSize: 20, lineHeight: 23, color: colors.text },
  placeMeta: { marginTop: 4, fontFamily: typography.fontFamily.body, fontSize: 11, color: colors.textSecondary },
  emptyState: { marginTop: spacing.lg, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, alignItems: 'center', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  emptyIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 12, fontFamily: typography.fontFamily.display, fontSize: 24, color: colors.text },
  emptyText: { marginTop: 5, textAlign: 'center', fontFamily: typography.fontFamily.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  emptyButton: { marginTop: 14, paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.accentSoft },
  emptyButtonText: { fontFamily: typography.fontFamily.semibold, fontSize: 12, color: colors.accentDark },
  keyboardAvoider: { flex: 1 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(23,23,23,0.32)', justifyContent: 'flex-end' },
  filterSheet: { maxHeight: '72%', paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: 34, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background },
  sheet: { paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: 34, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background },
  manageSheet: { maxHeight: '76%', paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: 34, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background },
  sheetHandle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.lg },
  sheetTitle: { marginBottom: spacing.md, fontFamily: typography.fontFamily.display, fontSize: 28, color: colors.text },
  managePlaceName: { marginTop: -8, marginBottom: 8, fontFamily: typography.fontFamily.body, fontSize: 13, color: colors.textSecondary },
  manageListScroll: { maxHeight: 360 },
  filterOption: { minHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterOptionText: { fontFamily: typography.fontFamily.body, fontSize: 15, color: colors.text },
  sheetInput: { height: 52, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, fontFamily: typography.fontFamily.body, fontSize: 15, color: colors.text },
  sheetActions: { marginTop: spacing.md, flexDirection: 'row', gap: 10 },
  secondaryButton: { flex: 1, height: 50, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontFamily: typography.fontFamily.semibold, fontSize: 13, color: colors.text },
  primaryButton: { flex: 1, height: 50, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { fontFamily: typography.fontFamily.semibold, fontSize: 13, color: colors.surface },
  doneButton: { flex: 0, marginTop: spacing.md },
  disabledButton: { opacity: 0.45 },
});