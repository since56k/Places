import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.text}>Single-user testing profile.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { fontSize: 30, fontWeight: '700', color: colors.text },
  text: { marginTop: spacing.md, color: colors.muted, fontSize: 15 },
});
