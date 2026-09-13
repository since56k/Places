import React, { useMemo, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SavePlaceModal from '../components/SavePlaceModal';
import { usePlaces } from '../context/PlacesContext';
import { colors, radius, spacing, typography } from '../theme';

const categories = ['All', 'Restaurant', 'Café', 'Bar', 'Hotel'];

function imageHeightFor(item) {
  const seed = String(item.id || item.name || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return seed % 3 === 0 ? 248 : seed % 3 === 1 ? 208 : 228;
}

function FeedCard({ item, onOpen, onSave }) {
  return (
    <TouchableOpacity activeOpacity={0.92} style={styles.card} onPress={onOpen}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.imageUrl }} style={[styles.image, { height: imageHeightFor(item) }]} />
        <TouchableOpacity onPress={onSave} hitSlop={12} style={styles.saveButton}>
          <Ionicons name={item.isSaved === false ? 'bookmark-outline' : 'bookmark'} size={16} color={colors.accent} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
      {!!item.caption && <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>}
      <View style={styles.metaRow}>
        <Text style={styles.meta} numberOfLines={1}>{item.city}</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.meta} numberOfLines={1}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function FeedScreen({ navigation }) {
  const { places } = usePlaces();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [category, setCategory] = useState('All');

  const visiblePlaces = useMemo(() => {
    if (category === 'All') return places;
    return places.filter((place) => place.type === category);
  }, [places, category]);

  const columns = useMemo(() => {
    const left = [];
    const right = [];
    visiblePlaces.forEach((place, index) => (index % 2 === 0 ? left : right).push(place));
    return [left, right];
  }, [visiblePlaces]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.title}>Places</Text>
            <Text style={styles.subtitle}>Discover places worth knowing.</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')} style={styles.headerIcon}>
            <Ionicons name="search-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Explore')} style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.searchText}>Search places, cities, countries</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {categories.map((item) => {
            const selected = item === category;
            return (
              <TouchableOpacity key={item} onPress={() => setCategory(item)} style={[styles.categoryChip, selected && styles.categoryChipSelected]}>
                <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.masonry}>
          {columns.map((column, columnIndex) => (
            <View key={columnIndex} style={styles.column}>
              {column.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  onOpen={() => navigation.navigate('PlaceDetails', { placeId: item.id })}
                  onSave={() => setSelectedPlace(item)}
                />
              ))}
            </View>
          ))}
        </View>

        {!visiblePlaces.length && <Text style={styles.emptyText}>No places in this category yet.</Text>}
      </ScrollView>

      <SavePlaceModal visible={!!selectedPlace} place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headingCopy: { flex: 1, paddingRight: spacing.md },
  title: { fontFamily: typography.fontFamily.display, fontSize: typography.size.display, lineHeight: typography.lineHeight.display, color: colors.text },
  subtitle: { marginTop: 2, fontFamily: typography.fontFamily.body, fontSize: 14, color: colors.textSecondary },
  headerIcon: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  searchBar: { marginTop: spacing.lg, height: 48, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchText: { flex: 1, fontFamily: typography.fontFamily.body, fontSize: 13, color: colors.textSecondary },
  categories: { gap: 8, paddingTop: spacing.md, paddingBottom: spacing.lg },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  categoryChipSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft },
  categoryText: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.text },
  categoryTextSelected: { color: colors.accentDark },
  masonry: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  column: { flex: 1 },
  card: { marginBottom: 18 },
  imageWrap: { position: 'relative' },
  image: { width: '100%', borderRadius: radius.lg, backgroundColor: colors.surfaceSoft },
  saveButton: { position: 'absolute', right: 8, bottom: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { marginTop: 8, fontFamily: typography.fontFamily.semibold, fontSize: 15, lineHeight: 19, color: colors.text },
  caption: { marginTop: 3, fontFamily: typography.fontFamily.body, fontSize: 12, lineHeight: 17, color: colors.textSecondary },
  metaRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center' },
  meta: { maxWidth: '44%', fontFamily: typography.fontFamily.body, fontSize: 10, color: colors.textSecondary },
  dot: { marginHorizontal: 4, fontFamily: typography.fontFamily.body, fontSize: 10, color: colors.textSecondary },
  emptyText: { paddingVertical: spacing.xl, textAlign: 'center', fontFamily: typography.fontFamily.body, color: colors.textSecondary },
});
