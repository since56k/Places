import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import { colors, radius, spacing, typography } from '../theme';

const statusOptions = [
  { key: 'all', label: 'All' },
  { key: 'saved', label: 'Saved' },
  { key: 'visited', label: 'Visited' },
  { key: 'want_to_go', label: 'Want to go' },
];

const sortOptions = [
  { key: 'default', label: 'Default' },
  { key: 'rating', label: 'Top rated' },
  { key: 'name', label: 'A–Z' },
];

function normalize(value = '') {
  return String(value).trim().toLowerCase();
}

export default function ExploreScreen({ navigation }) {
  const { places } = usePlaces();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('default');

  const categories = useMemo(() => [
    'All',
    ...[...new Set(places.map((place) => place.type).filter(Boolean))].sort(),
  ], [places]);

  const results = useMemo(() => {
    const normalizedQuery = normalize(query);

    const filtered = places.filter((place) => {
      const matchesCategory = category === 'All' || place.type === category;
      const matchesStatus = status === 'all'
        || (status === 'saved' && place.isSaved !== false)
        || place.status === status;

      const searchable = [
        place.name,
        place.type,
        place.city,
        place.country,
        place.address,
        place.caption,
        place.description,
        place.note,
        ...(place.tags || []),
        ...(place.lists || []),
      ].filter(Boolean).join(' ').toLowerCase();

      return matchesCategory
        && matchesStatus
        && (!normalizedQuery || searchable.includes(normalizedQuery));
    });

    if (sort === 'rating') {
      return [...filtered].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    }

    if (sort === 'name') {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [places, query, category, status, sort]);

  const resetFilters = () => {
    setQuery('');
    setCategory('All');
    setStatus('all');
    setSort('default');
  };

  const hasActiveFilters = !!query || category !== 'All' || status !== 'all' || sort !== 'default';

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={(
          <View>
            <Text style={styles.title}>Explore</Text>
            <Text style={styles.subtitle}>Search every place you know, saved or not.</Text>

            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={19} color={colors.textSecondary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Name, city, country, tag, list..."
                placeholderTextColor={colors.textSecondary}
                style={styles.search}
              />
              {!!query && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.filterLabel}>Library</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {statusOptions.map((item) => {
                const selected = item.key === status;
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => setStatus(item.key)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.filterLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {categories.map((item) => {
                const selected = item === category;
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.sortRow}>
              <Text style={styles.filterLabelInline}>Sort</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortOptions}>
                {sortOptions.map((item) => {
                  const selected = item.key === sort;
                  return (
                    <TouchableOpacity key={item.key} onPress={() => setSort(item.key)} style={styles.sortButton}>
                      <Text style={[styles.sortText, selected && styles.sortTextActive]}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.resultsHeader}>
              <View>
                <Text style={styles.resultsTitle}>Places</Text>
                <Text style={styles.resultsCount}>{results.length} {results.length === 1 ? 'result' : 'results'}</Text>
              </View>
              {hasActiveFilters && (
                <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
                  <Ionicons name="refresh-outline" size={15} color={colors.accent} />
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          const isSaved = item.isSaved !== false;
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.resultCard}
              onPress={() => navigation.navigate('PlaceDetails', { placeId: item.id })}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />
              <View style={styles.resultCopy}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.resultEyebrow}>{item.type}</Text>
                  {isSaved && <Ionicons name="bookmark" size={14} color={colors.accent} />}
                </View>
                <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.resultMeta}>{item.city}, {item.country}</Text>
                <View style={styles.metaRow}>
                  {item.rating ? <Text style={styles.metaPill}>★ {item.rating}</Text> : null}
                  {item.price ? <Text style={styles.metaPill}>{'€'.repeat(item.price)}</Text> : null}
                  {item.status === 'visited' ? <Text style={styles.metaPill}>Visited</Text> : null}
                  {item.status === 'want_to_go' ? <Text style={styles.metaPill}>Want to go</Text> : null}
                </View>
                {!!item.caption && <Text style={styles.resultCaption} numberOfLines={2}>{item.caption}</Text>}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search-outline" size={24} color={colors.accent} />
            </View>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.empty}>Try another search or reset the filters.</Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={resetFilters} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Reset filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  title: { fontFamily: typography.fontFamily.display, fontSize: typography.size.display, lineHeight: typography.lineHeight.display, color: colors.text },
  subtitle: { marginTop: 2, fontFamily: typography.fontFamily.body, fontSize: typography.size.sm, color: colors.textSecondary },
  searchWrap: { marginTop: spacing.lg, height: 50, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10 },
  search: { flex: 1, height: '100%', fontFamily: typography.fontFamily.body, fontSize: 14, color: colors.text },
  filterLabel: { marginTop: spacing.md, marginBottom: 8, fontFamily: typography.fontFamily.medium, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textSecondary },
  filterLabelInline: { fontFamily: typography.fontFamily.medium, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textSecondary },
  chipRow: { gap: 8, paddingRight: spacing.md },
  chip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft },
  chipText: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.text },
  chipTextSelected: { color: colors.accentDark },
  sortRow: { marginTop: spacing.md, minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 12 },
  sortOptions: { alignItems: 'center', gap: 14, paddingRight: spacing.md },
  sortButton: { paddingVertical: 7 },
  sortText: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  sortTextActive: { color: colors.accentDark },
  resultsHeader: { marginTop: spacing.lg, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  resultsTitle: { fontFamily: typography.fontFamily.display, fontSize: 28, color: colors.text },
  resultsCount: { marginTop: 2, fontFamily: typography.fontFamily.body, fontSize: 11, color: colors.textSecondary },
  resetButton: { minHeight: 36, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface },
  resetText: { fontFamily: typography.fontFamily.medium, fontSize: 11, color: colors.accent },
  resultCard: { marginBottom: spacing.sm, minHeight: 126, padding: 10, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultImage: { width: 104, height: 104, borderRadius: radius.md, backgroundColor: colors.surfaceSoft },
  resultCopy: { flex: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  resultEyebrow: { flex: 1, fontFamily: typography.fontFamily.medium, fontSize: 10, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.accent },
  resultName: { marginTop: 3, fontFamily: typography.fontFamily.display, fontSize: 21, lineHeight: 25, color: colors.text },
  resultMeta: { marginTop: 2, fontFamily: typography.fontFamily.body, fontSize: 12, color: colors.textSecondary },
  metaRow: { marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  metaPill: { paddingVertical: 3, paddingHorizontal: 7, borderRadius: radius.pill, backgroundColor: colors.surfaceSoft, fontFamily: typography.fontFamily.medium, fontSize: 10, color: colors.textSecondary },
  resultCaption: { marginTop: 6, fontFamily: typography.fontFamily.body, fontSize: 12, lineHeight: 17, color: colors.textSecondary },
  emptyState: { paddingVertical: 54, alignItems: 'center' },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 12, fontFamily: typography.fontFamily.display, fontSize: 24, color: colors.text },
  empty: { marginTop: 4, textAlign: 'center', fontFamily: typography.fontFamily.body, fontSize: 13, color: colors.textSecondary },
  emptyButton: { marginTop: spacing.md, paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.accentSoft },
  emptyButtonText: { fontFamily: typography.fontFamily.semibold, fontSize: 12, color: colors.accentDark },
});
