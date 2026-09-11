import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

export default function FeedScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Places</Text>
        <Text style={styles.subtitle}>Discover places worth remembering.</Text>
      </View>
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your feed starts here</Text>
        <Text style={styles.emptyText}>Add your first places to build the visual discovery feed.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg },
  title: { fontSize: 30, fontWeight: '700', color: colors.text },
  subtitle: { marginTop: spacing.xs, fontSize: 15, color: colors.muted },
  empty: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: colors.text },
  emptyText: { marginTop: spacing.sm, fontSize: 15, lineHeight: 22, color: colors.muted },
});
