import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';

export default function AddScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Add a place</Text>
      <Text style={styles.text}>Name, type, city, country, photo and a short description will live here.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { fontSize: 30, fontWeight: '700', color: colors.text },
  text: { marginTop: spacing.md, fontSize: 15, lineHeight: 22, color: colors.muted },
});
