import React, { useMemo, useState } from 'react';
import { FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SavePlaceModal from '../components/SavePlaceModal';
import { usePlaces } from '../context/PlacesContext';
import { colors, radius, spacing, typography } from '../theme';

const categories = ['All', 'Restaurant', 'Café', 'Bar', 'Hotel'];

function FeedCard({ item, onOpen, onSave }) {
  return (
    <TouchableOpacity activeOpacity={0.92} style={styles.card} onPress={onOpen}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.eyebrow}>{item.type} · {item.city}</Text>
          <TouchableOpacity onPress={onSave} hitSlop={12} style={styles.saveButton}>
            <Ionicons name={item.isSaved === false ? 'bookmark-outline' : 'bookmark'} size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {!!item.caption && <Text style={styles.caption}>{item.caption}</Text>}
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

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={visiblePlaces}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
          <View style={styles.headerArea}>
            <View style={styles.headingRow}>
              <View style={styles.headingCopy}>
                <Text style={styles.title}>Places</Text>
                <Text style={styles.subtitle}>Places worth knowing.</Text>
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
                  <TouchableOpacity
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                  >
                    <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
        renderItem={({ item }) => (
          <FeedCard
            item={item}
            onOpen={() => navigation.navigate('PlaceDetails', { placeId: item.id })}
            onSave={() => setSelectedPlace(item)}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No places in this category yet.</Text>}
      />
      <SavePlaceModal visible={!!selectedPlace} place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  headerArea: { paddingTop: spacing.sm, paddingBottom: spacing.md },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headingCopy: { flex: 1, paddingRight: spacing.md },
  title: { fontFamily: typography.fontFamily.display, fontSize: typography.size.display, lineHeight: typography.lineHeight.display, color: colors.text },
  subtitle: { marginTop: 2, fontFamily: typography.fontFamily.body, fontSize: typography.size.sm, color: colors.textSecondary },
  headerIcon: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  searchBar: { marginTop: spacing.lg, height: 48, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchText: { flex: 1, fontFamily: typography.fontFamily.body, fontSize: typography.size.sm, color: colors.textSecondary },
  categories: { gap: 8, paddingTop: spacing.md, paddingBottom: spacing.sm },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  categoryChipSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft },
  categoryText: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.text },
  categoryTextSelected: { color: colors.accentDark },
  card: { marginBottom: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  image: { width: '100%', height: 248, backgroundColor: colors.surfaceSoft },
  cardContent: { padding: spacing.md, paddingBottom: 18 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { flex: 1, fontFamily: typography.fontFamily.medium, fontSize: 11, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.accent },
  saveButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
  cardTitle: { marginTop: 4, fontFamily: typography.fontFamily.display, fontSize: 26, lineHeight: 31, color: colors.text },
  caption: { marginTop: 7, fontFamily: typography.fontFamily.body, fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  emptyText: { paddingVertical: spacing.xl, textAlign: 'center', fontFamily: typography.fontFamily.body, color: colors.textSecondary },
});
