import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

const filters = ['Type', 'Country', 'City', 'Status', 'Price', 'Rating', 'Tags'];

export default function MyPlacesScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>My Places</Text>
      <TextInput placeholder="Search my places..." placeholderTextColor={colors.muted} style={styles.search} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((filter) => (
          <View key={filter} style={styles.chip}><Text style={styles.chipText}>{filter}</Text></View>
        ))}
      </ScrollView>
      <View style={styles.statusRow}>
        <Text style={styles.status}>All</Text><Text style={styles.status}>Visited</Text><Text style={styles.status}>Want to go</Text>
      </View>
      <Text style={styles.sectionTitle}>My Lists</Text>
      <Text style={styles.empty}>Create lists such as Tokyo, Date Night or Wine Bars, then save the same place to multiple lists.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { fontSize: 30, fontWeight: '700', color: colors.text },
  search: { marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, fontSize: 16 },
  filters: { gap: spacing.sm, paddingVertical: spacing.md },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 13 },
  chipText: { color: colors.text, fontSize: 13 },
  statusRow: { flexDirection: 'row', gap: spacing.lg, paddingBottom: spacing.lg },
  status: { color: colors.text, fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  empty: { marginTop: spacing.sm, color: colors.muted, fontSize: 15, lineHeight: 22 },
});
