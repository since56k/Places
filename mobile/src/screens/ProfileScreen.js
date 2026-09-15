import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../theme';

export default function ProfileScreen({ navigation }) {
  const { places, lists, isPersistent } = usePlaces();
  const { user, logout } = useAuth();

  const stats = useMemo(() => {
    const saved = places.filter((place) => place.isSaved !== false);
    const visited = saved.filter((place) => place.status === 'visited');
    const wantToGo = saved.filter((place) => place.status === 'want_to_go');
    return { saved: saved.length, visited: visited.length, wantToGo: wantToGo.length };
  }, [places]);

  const openLibrary = (params = {}) => {
    navigation.navigate('My Places', { ...params, nonce: Date.now() });
  };

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
            <Text style={styles.profileName}>{user?.name || 'Placebook'}</Text>
            <Text style={styles.profileMeta}>{user?.email || (isPersistent ? 'Synced with Railway' : 'Local demo mode')}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat value={stats.saved} label="Saved" onPress={() => openLibrary({ status: 'all' })} />
          <Stat value={stats.visited} label="Visited" onPress={() => openLibrary({ status: 'visited' })} />
          <Stat value={stats.wantToGo} label="Want to go" onPress={() => openLibrary({ status: 'want_to_go' })} />
        </View>

        <Text style={styles.sectionTitle}>Your library</Text>
        <View style={styles.infoCard}>
          <TouchableOpacity style={styles.infoRow} onPress={() => openLibrary()}>
            <View style={styles.infoIcon}><Ionicons name="bookmark-outline" size={18} color={colors.accent} /></View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>{lists.length} lists</Text>
              <Text style={styles.infoText}>Open your lists and manage the places inside them.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {!!lists.length && (
            <View style={styles.listChips}>
              {lists.slice(0, 6).map((list) => (
                <TouchableOpacity key={list} onPress={() => openLibrary({ listName: list, status: 'all' })} style={styles.listChip}>
                  <Text style={styles.listChipText} numberOfLines={1}>{list}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}><Ionicons name="shield-checkmark-outline" size={18} color={colors.success} /></View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>Private by design</Text>
              <Text style={styles.infoText}>Your lists, ratings, notes and saved places belong to your account.</Text>
            </View>
          </View>
        </View>

        {isPersistent && (
          <TouchableOpacity activeOpacity={0.82} onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statLabelRow}>
        <Text style={styles.statLabel}>{label}</Text>
        <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
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
  statLabelRow: { marginTop: 3, flexDirection: 'row', alignItems: 'center', gap: 2 },
  statLabel: { flexShrink: 1, fontFamily: typography.fontFamily.medium, fontSize: 11, color: colors.textSecondary },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.md, fontFamily: typography.fontFamily.display, fontSize: 27, color: colors.text },
  infoCard: { paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  infoRow: { paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center' },
  infoIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  infoCopy: { flex: 1, marginLeft: 12, marginRight: 8 },
  infoTitle: { fontFamily: typography.fontFamily.semibold, fontSize: 14, color: colors.text },
  infoText: { marginTop: 4, fontFamily: typography.fontFamily.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  listChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: spacing.md },
  listChip: { maxWidth: '48%', paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.accentSoft },
  listChipText: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.accentDark },
  divider: { height: 1, backgroundColor: colors.border },
  logoutButton: { marginTop: spacing.lg, minHeight: 50, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoutText: { fontFamily: typography.fontFamily.semibold, fontSize: 14, color: colors.error },
});
