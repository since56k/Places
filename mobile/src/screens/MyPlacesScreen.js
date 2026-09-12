import React, { useMemo, useState } from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import { colors, radius, spacing, typography } from '../theme';

const filters = ['Type', 'Country', 'City', 'Price', 'Rating'];
const cardGap = 12;
const cardWidth = (Dimensions.get('window').width - 32 - cardGap) / 2;

export default function MyPlacesScreen({ navigation }) {
  const { places, lists, loading, syncError, isPersistent, refresh } = usePlaces();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const savedPlaces = useMemo(() => places.filter((place) => place.isSaved !== false), [places]);

  const visiblePlaces = useMemo(() => savedPlaces.filter((place) => {
    const matchesStatus = status === 'all' || place.status === status;
    const text = `${place.name} ${place.city} ${place.country} ${(place.tags || []).join(' ')} ${place.note || ''}`.toLowerCase();
    return matchesStatus && text.includes(query.toLowerCase());
  }), [savedPlaces, query, status]);

  const listCounts = useMemo(() => Object.fromEntries(
    lists.map((list) => [list, savedPlaces.filter((place) => (place.lists || []).includes(list)).length])
  ), [lists, savedPlaces]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.title}>My Places</Text>
            <Text style={styles.syncLabel}>{isPersistent ? 'Synced library' : 'Local demo mode'}</Text>
          </View>
          <TouchableOpacity onPress={refresh} disabled={!isPersistent || loading} style={styles.refreshButton}>
            <Ionicons name={loading ? 'cloud-upload-outline' : 'refresh-outline'} size={20} color={isPersistent ? colors.text : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {!!syncError && <Text style={styles.syncError}>{syncError}</Text>}

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search my places"
            placeholderTextColor={colors.textSecondary}
            style={styles.search}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((filter) => (
            <TouchableOpacity key={filter} style={styles.chip}>
              <Text style={styles.chipText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.segment}>
          {[['all', 'All'], ['visited', 'Visited'], ['want_to_go', 'Want to go']].map(([value, label]) => (
            <TouchableOpacity key={value} onPress={() => setStatus(value)} style={[styles.segmentItem, status === value && styles.segmentActive]}>
              <Text style={[styles.segmentText, status === value && styles.segmentTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Lists</Text>
          <Text style={styles.link}>Curated by you</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listRow}>
          {lists.map((list) => (
            <TouchableOpacity key={list} style={styles.listCard}>
              <Text style={styles.listName}>{list}</Text>
              <Text style={styles.listCount}>{listCounts[list]} {listCounts[list] === 1 ? 'place' : 'places'}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.listCard, styles.newList]}>
            <Ionicons name="add" size={20} color={colors.accent} />
            <Text style={styles.newListText}>New list</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved</Text>
          <Text style={styles.count}>{visiblePlaces.length} places</Text>
        </View>
        <View style={styles.grid}>
          {visiblePlaces.map((place) => (
            <TouchableOpacity key={place.id} style={styles.placeCard} activeOpacity={0.9} onPress={() => navigation.navigate('PlaceDetails', { placeId: place.id })}>
              <Image source={{ uri: place.imageUrl }} style={styles.placeImage} />
              <Text style={styles.placeName} numberOfLines={2}>{place.name}</Text>
              <Text style={styles.placeMeta}>{place.city} · {'€'.repeat(place.price || 1)}{place.rating ? ` · ★ ${place.rating}` : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headingCopy: { flex: 1, paddingRight: spacing.md },
  title: { fontFamily: typography.fontFamily.display, fontSize: typography.size.display, lineHeight: typography.lineHeight.display, color: colors.text },
  syncLabel: { marginTop: 2, fontFamily: typography.fontFamily.body, fontSize: 12, color: colors.textSecondary },
  refreshButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  syncError: { marginTop: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: '#FDECEC', color: colors.error, fontFamily: typography.fontFamily.medium, fontSize: 12 },
  searchWrap: { marginTop: spacing.lg, height: 50, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10 },
  search: { flex: 1, height: '100%', fontFamily: typography.fontFamily.body, fontSize: 14, color: colors.text },
  filters: { gap: 8, paddingVertical: spacing.md },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 14, backgroundColor: colors.surface },
  chipText: { fontFamily: typography.fontFamily.medium, color: colors.text, fontSize: 12 },
  segment: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, padding: 4, marginBottom: spacing.xl },
  segmentItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.accentSoft },
  segmentText: { color: colors.textSecondary, fontFamily: typography.fontFamily.medium, fontSize: 12 },
  segmentTextActive: { color: colors.accentDark },
  sectionHeader: { marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { fontFamily: typography.fontFamily.display, fontSize: 27, color: colors.text },
  link: { fontFamily: typography.fontFamily.body, fontSize: 11, color: colors.textSecondary },
  count: { fontFamily: typography.fontFamily.medium, fontSize: 11, color: colors.textSecondary },
  listRow: { gap: spacing.sm, paddingBottom: spacing.xl },
  listCard: { width: 138, height: 104, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md, justifyContent: 'flex-end' },
  newList: { justifyContent: 'center', alignItems: 'flex-start', backgroundColor: colors.accentSoft, borderColor: colors.accentSoft },
  newListText: { marginTop: 4, fontFamily: typography.fontFamily.semibold, fontSize: 12, color: colors.accentDark },
  listName: { fontFamily: typography.fontFamily.display, fontSize: 20, lineHeight: 23, color: colors.text },
  listCount: { marginTop: 5, fontFamily: typography.fontFamily.body, fontSize: 11, color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: cardGap },
  placeCard: { width: cardWidth, marginBottom: spacing.lg },
  placeImage: { width: cardWidth, height: cardWidth * 1.1, borderRadius: radius.lg, backgroundColor: colors.surfaceSoft },
  placeName: { marginTop: 9, fontFamily: typography.fontFamily.display, fontSize: 20, lineHeight: 23, color: colors.text },
  placeMeta: { marginTop: 4, fontFamily: typography.fontFamily.body, fontSize: 11, color: colors.textSecondary },
});
