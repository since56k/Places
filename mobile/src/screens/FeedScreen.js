import React from 'react';
import { Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { demoPlaces } from '../data/demoPlaces';
import { colors, radius, spacing } from '../theme';

const gap = 12;
const horizontalPadding = 16;
const cardWidth = (Dimensions.get('window').width - horizontalPadding * 2 - gap) / 2;

function FeedCard({ item }) {
  return (
    <TouchableOpacity activeOpacity={0.88} style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={[styles.image, { height: item.id === '2' || item.id === '3' ? 230 : 190 }]} />
      <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.location} numberOfLines={1}>{item.city}</Text>
        <Ionicons name="bookmark-outline" size={18} color={colors.text} />
      </View>
    </TouchableOpacity>
  );
}

export default function FeedScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Places</Text>
          <Text style={styles.subtitle}>Discover</Text>
        </View>
        <Ionicons name="search-outline" size={24} color={colors.text} />
      </View>
      <FlatList
        data={demoPlaces}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <FeedCard item={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: horizontalPadding, paddingTop: spacing.sm, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -1, color: colors.text },
  subtitle: { marginTop: 2, fontSize: 13, color: colors.muted },
  grid: { paddingHorizontal: horizontalPadding, paddingBottom: spacing.xl },
  row: { gap, alignItems: 'flex-start' },
  card: { width: cardWidth, marginBottom: spacing.lg },
  image: { width: '100%', borderRadius: radius.md, backgroundColor: colors.surface },
  cardTitle: { marginTop: 9, fontSize: 15, lineHeight: 19, fontWeight: '700', color: colors.text },
  caption: { marginTop: 4, fontSize: 12, lineHeight: 17, color: colors.muted },
  metaRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  location: { flex: 1, marginRight: spacing.sm, fontSize: 12, color: colors.muted },
});
