import React, { useMemo, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SavePlaceModal from '../components/SavePlaceModal';
import { usePlaces } from '../context/PlacesContext';
import { colors, radius, spacing } from '../theme';

export default function PlaceDetailsScreen({ route, navigation }) {
  const { placeId } = route.params;
  const { places } = usePlaces();
  const [saveVisible, setSaveVisible] = useState(false);

  const place = useMemo(() => places.find((item) => item.id === placeId), [places, placeId]);

  if (!place) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.missing}>
          <Text style={styles.title}>Place not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backLink}>Go back</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isSaved = place.isSaved !== false;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: place.imageUrl }} style={styles.hero} />
          <TouchableOpacity style={[styles.floatingButton, styles.backButton]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.floatingButton, styles.saveButton]} onPress={() => setSaveVisible(true)}>
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>{place.type}</Text>
          <Text style={styles.title}>{place.name}</Text>
          <Text style={styles.location}>{place.city}, {place.country}</Text>
          {!!place.caption && <Text style={styles.caption}>{place.caption}</Text>}

          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{isSaved ? (place.status === 'visited' ? 'Visited' : 'Want to go') : 'Not saved'}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Rating</Text>
              <Text style={styles.infoValue}>{isSaved && place.rating ? `★ ${place.rating}` : 'Not rated'}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>{isSaved ? '€'.repeat(place.price || 1) : 'Not set'}</Text>
            </View>
          </View>

          {isSaved && !!place.note && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your note</Text>
              <Text style={styles.body}>{place.note}</Text>
            </View>
          )}

          {isSaved && !!place.tags?.length && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tags}>
                {place.tags.map((tag) => <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}
              </View>
            </View>
          )}

          {isSaved && !!place.lists?.length && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lists</Text>
              <Text style={styles.body}>{place.lists.join(' · ')}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={() => setSaveVisible(true)}>
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={colors.background} />
            <Text style={styles.primaryButtonText}>{isSaved ? 'Edit saved place' : 'Save place'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SavePlaceModal visible={saveVisible} place={place} onClose={() => setSaveVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  imageWrap: { position: 'relative' },
  hero: { width: '100%', height: 390, backgroundColor: colors.surface },
  floatingButton: { position: 'absolute', top: spacing.md, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' },
  backButton: { left: spacing.md },
  saveButton: { right: spacing.md },
  content: { padding: spacing.lg, paddingBottom: 50 },
  eyebrow: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, color: colors.muted },
  title: { marginTop: 6, fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.8, color: colors.text },
  location: { marginTop: 6, fontSize: 15, color: colors.muted },
  caption: { marginTop: spacing.lg, fontSize: 17, lineHeight: 25, color: colors.text },
  infoRow: { marginTop: spacing.lg, flexDirection: 'row', gap: 8 },
  infoBlock: { flex: 1, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md },
  infoLabel: { fontSize: 11, color: colors.muted, marginBottom: 6 },
  infoValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  section: { marginTop: spacing.lg },
  sectionTitle: { marginBottom: spacing.sm, fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, lineHeight: 23, color: colors.text },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.surface, borderRadius: 18 },
  tagText: { fontSize: 13, color: colors.text },
  primaryButton: { marginTop: spacing.xl, height: 52, borderRadius: radius.md, backgroundColor: colors.text, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: colors.background, fontSize: 15, fontWeight: '700' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  backLink: { marginTop: spacing.md, color: colors.muted },
});
