import React, { useMemo, useState } from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { demoLists, demoPlaces } from '../data/demoPlaces';
import { colors, radius, spacing } from '../theme';

const filters = ['Type', 'Country', 'City', 'Price', 'Rating', 'Tags'];
const cardGap = 12;
const cardWidth = (Dimensions.get('window').width - 32 - cardGap) / 2;

export default function MyPlacesScreen() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const visiblePlaces = useMemo(() => demoPlaces.filter((place) => {
    const matchesStatus = status === 'all' || place.status === status;
    const text = `${place.name} ${place.city} ${place.country} ${place.tags.join(' ')}`.toLowerCase();
    return matchesStatus && text.includes(query.toLowerCase());
  }), [query, status]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headingRow}>
          <Text style={styles.title}>My Places</Text>
          <Ionicons name="options-outline" size={24} color={colors.text} />
        </View>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search my places..." placeholderTextColor={colors.muted} style={styles.search} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((filter) => <TouchableOpacity key={filter} style={styles.chip}><Text style={styles.chipText}>{filter}</Text></TouchableOpacity>)}
        </ScrollView>

        <View style={styles.segment}>
          {[['all', 'All'], ['visited', 'Visited'], ['want_to_go', 'Want to go']].map(([value, label]) => (
            <TouchableOpacity key={value} onPress={() => setStatus(value)} style={[styles.segmentItem, status === value && styles.segmentActive]}>
              <Text style={[styles.segmentText, status === value && styles.segmentTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>My Lists</Text><Text style={styles.link}>See all</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listRow}>
          {demoLists.map((list) => <TouchableOpacity key={list} style={styles.listCard}><Text style={styles.listName}>{list}</Text><Text style={styles.listCount}>Saved list</Text></TouchableOpacity>)}
          <TouchableOpacity style={[styles.listCard, styles.newList]}><Ionicons name="add" size={24} color={colors.text} /><Text style={styles.listName}>New list</Text></TouchableOpacity>
        </ScrollView>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Saved</Text><Text style={styles.count}>{visiblePlaces.length} places</Text></View>
        <View style={styles.grid}>
          {visiblePlaces.map((place) => (
            <TouchableOpacity key={place.id} style={styles.placeCard} activeOpacity={0.88}>
              <Image source={{ uri: place.imageUrl }} style={styles.placeImage} />
              <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
              <Text style={styles.placeMeta}>{place.city} · {'€'.repeat(place.price)} · ★ {place.rating}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -1, color: colors.text },
  search: { marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 48, fontSize: 15, color: colors.text },
  filters: { gap: spacing.sm, paddingVertical: spacing.md },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 13 },
  chipText: { color: colors.text, fontSize: 13 },
  segment: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, marginBottom: spacing.lg },
  segmentItem: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.background },
  segmentText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  segmentTextActive: { color: colors.text },
  sectionHeader: { marginTop: spacing.sm, marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '750', color: colors.text },
  link: { fontSize: 13, color: colors.muted },
  count: { fontSize: 13, color: colors.muted },
  listRow: { gap: spacing.sm, paddingBottom: spacing.lg },
  listCard: { width: 132, height: 96, borderRadius: radius.md, backgroundColor: colors.surface, padding: spacing.md, justifyContent: 'flex-end' },
  newList: { borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'flex-start' },
  listName: { fontSize: 14, fontWeight: '700', color: colors.text },
  listCount: { marginTop: 3, fontSize: 11, color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: cardGap },
  placeCard: { width: cardWidth, marginBottom: spacing.md },
  placeImage: { width: cardWidth, height: cardWidth, borderRadius: radius.md, backgroundColor: colors.surface },
  placeName: { marginTop: 8, fontSize: 14, fontWeight: '700', color: colors.text },
  placeMeta: { marginTop: 3, fontSize: 11, color: colors.muted },
});
