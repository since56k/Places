import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import { colors, radius, spacing, typography } from '../theme';

export default function ProfileScreen() {
  const { places, lists, isPersistent } = usePlaces();

  const stats = useMemo(() => {
    const saved = places.filter((place) => place.isSaved !== false);
    const visited = saved.filter((place) => place.status === 'visited');
    const wantToGo = saved.filter((place) => place.status === 'want_to_go');
    return { saved: saved.length, visited: visited.length, wantToGo: wantToGo.length };
  }, [places]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your private collection of good places.</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={30} color={colors.accent} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>Places tester</Text>
            <Text style={styles.profileMeta}>{isPersistent ? 'Synced with Railway' : 'Local demo mode'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat value={stats.saved} label="Saved" />
          <Stat value={stats.visited} label="Visited" />
          <Stat value={stats.wantToGo} label="Want to go" />
        </View>

        <Text style={styles.sectionTitle}>Your library</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}><Ionicons name="bookmark-outline" size={18} color={colors.accent} /></View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>{lists.length} lists</Text>
              <Text style={styles.infoText}>Small collections for cities, moods and occasions.</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}><Ionicons name="leaf-outline" size={18} color={colors.success} /></View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>Private by design</Text>
              <Text style={styles.infoText}>This testing profile is currently for your use only.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  title: { fontFamily: typography.fontFamily.display, fontSize: typography.size.display, lineHeight: typography.lineHeight.display, color: colors.text },
  subtitle: { marginTop: 2, fontFamily: typography.fontFamily.body, fontSize: 14, color: colors.textSecondary },
  profileCard: { marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  profileCopy: { flex: 1, marginLeft: spacing.md },
  profileName: { fontFamily: typography.fontFamily.display, fontSize: 23, color: colors.text },
  profileMeta: { marginTop: 3, fontFamily: typography.fontFamily.body, fontSize: 12, color: colors.textSecondary },
  statsRow: { marginTop: spacing.md, flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, minHeight: 96, padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: 'flex-end' },
  statValue: { fontFamily: typography.fontFamily.display, fontSize: 30, color: colors.accent },
  statLabel: { marginTop: 3, fontFamily: typography.fontFamily.medium, fontSize: 11, color: colors.textSecondary },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.md, fontFamily: typography.fontFamily.display, fontSize: 27, color: colors.text },
  infoCard: { paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  infoRow: { paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'flex-start' },
  infoIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  infoCopy: { flex: 1, marginLeft: 12 },
  infoTitle: { fontFamily: typography.fontFamily.semibold, fontSize: 14, color: colors.text },
  infoText: { marginTop: 4, fontFamily: typography.fontFamily.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.border },
});
