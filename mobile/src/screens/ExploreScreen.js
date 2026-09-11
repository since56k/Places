import React from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Explore</Text>
      <TextInput placeholder="Search places, cities, countries..." placeholderTextColor={colors.muted} style={styles.search} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { fontSize: 30, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  search: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, fontSize: 16, color: colors.text },
});
