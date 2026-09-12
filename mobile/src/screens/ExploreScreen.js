import React, { useMemo, useState } from 'react';
import { FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import { colors, radius, spacing, typography } from '../theme';

const categories = ['All', 'Restaurant', 'Café', 'Bar', 'Hotel'];

export default function ExploreScreen({ navigation }) {
  const { places } = usePlaces();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return places.filter((place) => {
      const matchesCategory = category === 'All' || place.type === category;
      const searchable = `${place.name} ${place.city} ${place.country} ${place.type} ${place.caption || ''}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [places, query, category]);

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
            <Text style={styles.subtitle}>Find somewhere worth remembering.</Text>

            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={19} color={colors.textSecondary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Search places, cities, countries"
                placeholderTextColor={colors.textSecondary}
                style={styles.search}
              />
              {!!query && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
              {categories.map((item) => {
                const selected = item === category;
                return (
                  <TouchableOpacity key={item} onPress={() => setCategory(item)} style={[styles.chip, selected && styles.chipSelected]}>
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Places</Text>
              <Text style={styles.resultsCount}>{results.length}</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9} style={styles.resultCard} onPress={() => navigation.navigate('PlaceDetails', { placeId: item.id })}>
            <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />
            <View style={styles.resultCopy}>
              <Text style={styles.resultEyebrow}>{item.type}</Text>
              <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.resultMeta}>{item.city}, {item.country}</Text>
              {!!item.caption && <Text style={styles.resultCaption} numberOfLines={2}>{item.caption}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No places match this search yet.</Text>}
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
  categories: { gap: 8, paddingVertical: spacing.md },
  chip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft },
  chipText: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.text },
  chipTextSelected: { color: colors.accentDark },
  resultsHeader: { marginTop: spacing.sm, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  resultsTitle: { fontFamily: typography.fontFamily.display, fontSize: 26, color: colors.text },
  resultsCount: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  resultCard: { marginBottom: spacing.sm, minHeight: 126, padding: 10, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultImage: { width: 104, height: 104, borderRadius: radius.md, backgroundColor: colors.surfaceSoft },
  resultCopy: { flex: 1 },
  resultEyebrow: { fontFamily: typography.fontFamily.medium, fontSize: 10, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.accent },
  resultName: { marginTop: 3, fontFamily: typography.fontFamily.display, fontSize: 21, lineHeight: 25, color: colors.text },
  resultMeta: { marginTop: 2, fontFamily: typography.fontFamily.body, fontSize: 12, color: colors.textSecondary },
  resultCaption: { marginTop: 5, fontFamily: typography.fontFamily.body, fontSize: 12, lineHeight: 17, color: colors.textSecondary },
  empty: { paddingVertical: spacing.xl, textAlign: 'center', fontFamily: typography.fontFamily.body, color: colors.textSecondary },
});
