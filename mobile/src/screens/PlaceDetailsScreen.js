import React, { useMemo, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SavePlaceModal from '../components/SavePlaceModal';
import { usePlaces } from '../context/PlacesContext';
import { colors, radius, spacing, typography } from '../theme';

export default function PlaceDetailsScreen({ route, navigation }) {
  const { placeId } = route.params;
  const { places, removeSavedPlace } = usePlaces();
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

  const confirmRemove = () => {
    Alert.alert(
      'Remove saved place?',
      `${place.name} will be removed from My Places.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeSavedPlace(place.id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: place.imageUrl }} style={styles.hero} />
          <View style={styles.heroShade} />
          <TouchableOpacity style={[styles.floatingButton, styles.backButton]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.floatingButton, styles.saveButton]} onPress={() => setSaveVisible(true)}>
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>{place.type}</Text>
          <Text style={styles.title}>{place.name}</Text>
          <Text style={styles.location}>{place.city}, {place.country}</Text>
          {!!place.address && (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.address}>{place.address}</Text>
            </View>
          )}
          {!!place.caption && <Text style={styles.caption}>{place.caption}</Text>}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <InfoBlock label="Status" value={isSaved ? (place.status === 'visited' ? 'Visited' : 'Want to go') : 'Not saved'} />
            <InfoBlock label="Rating" value={isSaved && place.rating ? `★ ${place.rating}` : 'Not rated'} />
            <InfoBlock label="Price" value={isSaved ? '€'.repeat(place.price || 1) : 'Not set'} />
          </View>

          {isSaved && !!place.note && (
            <View style={styles.section}>
              <Text style={styles.sectionEyebrow}>Your note</Text>
              <Text style={styles.noteText}>“{place.note}”</Text>
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
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={19} color={colors.surface} />
            <Text style={styles.primaryButtonText}>{isSaved ? 'Edit saved place' : 'Save place'}</Text>
          </TouchableOpacity>

          {isSaved && (
            <TouchableOpacity style={styles.removeButton} onPress={confirmRemove}>
              <Ionicons name="trash-outline" size={17} color={colors.error} />
              <Text style={styles.removeButtonText}>Remove from My Places</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <SavePlaceModal visible={saveVisible} place={place} onClose={() => setSaveVisible(false)} />
    </SafeAreaView>
  );
}

function InfoBlock({ label, value }) {
  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  imageWrap: { position: 'relative', marginHorizontal: spacing.md, marginTop: spacing.sm, borderRadius: radius.xl, overflow: 'hidden' },
  hero: { width: '100%', height: 390, backgroundColor: colors.surfaceSoft },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(23,23,23,0.06)' },
  floatingButton: { position: 'absolute', top: spacing.md, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' },
  backButton: { left: spacing.md },
  saveButton: { right: spacing.md },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: 60 },
  eyebrow: { fontFamily: typography.fontFamily.medium, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.9, color: colors.accent },
  title: { marginTop: 5, fontFamily: typography.fontFamily.display, fontSize: 38, lineHeight: 43, color: colors.text },
  location: { marginTop: 6, fontFamily: typography.fontFamily.body, fontSize: 14, color: colors.textSecondary },
  addressRow: { marginTop: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  address: { flex: 1, fontFamily: typography.fontFamily.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  caption: { marginTop: spacing.lg, fontFamily: typography.fontFamily.body, fontSize: 17, lineHeight: 26, color: colors.text },
  divider: { marginTop: spacing.xl, height: 1, backgroundColor: colors.border },
  infoRow: { marginTop: spacing.md, flexDirection: 'row', gap: 8 },
  infoBlock: { flex: 1, minHeight: 82, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: 'flex-end' },
  infoLabel: { fontFamily: typography.fontFamily.medium, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: colors.textSecondary, marginBottom: 6 },
  infoValue: { fontFamily: typography.fontFamily.semibold, fontSize: 13, color: colors.text },
  section: { marginTop: spacing.xl },
  sectionEyebrow: { fontFamily: typography.fontFamily.medium, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.accent },
  sectionTitle: { marginBottom: spacing.sm, fontFamily: typography.fontFamily.display, fontSize: 24, color: colors.text },
  noteText: { marginTop: 8, fontFamily: typography.fontFamily.display, fontSize: 23, lineHeight: 32, color: colors.text },
  body: { fontFamily: typography.fontFamily.body, fontSize: 14, lineHeight: 22, color: colors.textSecondary },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.accentSoft, borderRadius: radius.pill },
  tagText: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.accentDark },
  primaryButton: { marginTop: spacing.xl, height: 56, borderRadius: radius.pill, backgroundColor: colors.accent, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: colors.surface, fontFamily: typography.fontFamily.semibold, fontSize: 14 },
  removeButton: { marginTop: 12, height: 50, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  removeButtonText: { fontFamily: typography.fontFamily.medium, fontSize: 13, color: colors.error },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  backLink: { marginTop: spacing.md, fontFamily: typography.fontFamily.medium, color: colors.accent },
});
