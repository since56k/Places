import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import { colors, radius, spacing, typography } from '../theme';

export default function SavePlaceModal({ visible, place, onClose }) {
  const { lists, savePlace, createList } = usePlaces();
  const [status, setStatus] = useState('want_to_go');
  const [rating, setRating] = useState(0);
  const [price, setPrice] = useState(1);
  const [note, setNote] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [selectedLists, setSelectedLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!place) return;
    setStatus(place.status || 'want_to_go');
    setRating(place.rating || 0);
    setPrice(place.price || 1);
    setNote(place.note || '');
    setTagsText((place.tags || []).join(', '));
    setSelectedLists(place.lists || []);
    setError('');
  }, [place]);

  if (!place) return null;

  const toggleList = (name) => {
    setSelectedLists((current) => current.includes(name)
      ? current.filter((item) => item !== name)
      : [...current, name]);
  };

  const handleCreateList = async () => {
    const cleanName = newListName.trim();
    if (!cleanName) return;

    try {
      setError('');
      const createdName = await createList(cleanName);
      if (createdName && !selectedLists.includes(createdName)) {
        setSelectedLists((current) => [...current, createdName]);
      }
      setNewListName('');
    } catch (createError) {
      setError(createError.message || 'Unable to create list.');
    }
  };

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    setError('');

    try {
      await savePlace(place.id, {
        status,
        rating,
        price,
        note,
        tags: tagsText.split(',').map((tag) => tag.trim()).filter(Boolean),
        lists: selectedLists,
      });
      onClose();
    } catch (saveError) {
      setError(saveError.message || 'Unable to save this place.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Save place</Text>
          <TouchableOpacity disabled={saving} onPress={handleSave} style={styles.saveHeaderButton}>
            <Text style={[styles.saveText, saving && styles.disabledText]}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>{place.type}</Text>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeMeta}>{place.city}, {place.country}</Text>

          <View style={styles.section}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.segment}>
              {[['visited', 'Visited'], ['want_to_go', 'Want to go']].map(([value, label]) => (
                <Pressable key={value} onPress={() => setStatus(value)} style={[styles.segmentItem, status === value && styles.segmentActive]}>
                  <Text style={[styles.segmentText, status === value && styles.segmentTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Your rating</Text>
            <View style={styles.optionRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity key={value} onPress={() => setRating(value)} style={[styles.ratingButton, rating === value && styles.selectedButton]}>
                  <Text style={[styles.optionText, rating === value && styles.selectedText]}>{value}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Price</Text>
            <View style={styles.optionRow}>
              {[1, 2, 3, 4].map((value) => (
                <TouchableOpacity key={value} onPress={() => setPrice(value)} style={[styles.priceButton, price === value && styles.selectedButton]}>
                  <Text style={[styles.optionText, price === value && styles.selectedText]}>{'€'.repeat(value)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Personal note</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What do you want to remember?"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, styles.noteInput]}
              multiline
            />

            <Text style={styles.label}>Tags</Text>
            <TextInput
              value={tagsText}
              onChangeText={setTagsText}
              placeholder="Wine, Date night, Outdoor"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />

            <Text style={styles.label}>Lists</Text>
            <View style={styles.listWrap}>
              {lists.map((name) => {
                const selected = selectedLists.includes(name);
                return (
                  <TouchableOpacity key={name} onPress={() => toggleList(name)} style={[styles.listChip, selected && styles.listChipSelected]}>
                    <Text style={[styles.listChipText, selected && styles.listChipTextSelected]}>{name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.newListRow}>
              <TextInput value={newListName} onChangeText={setNewListName} placeholder="New list name" placeholderTextColor={colors.textSecondary} style={[styles.input, styles.newListInput]} />
              <TouchableOpacity onPress={handleCreateList} style={styles.addListButton}>
                <Ionicons name="add" size={22} color={colors.surface} />
              </TouchableOpacity>
            </View>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 62, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSoft },
  headerTitle: { fontFamily: typography.fontFamily.display, fontSize: 21, color: colors.text },
  saveHeaderButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.accentSoft },
  saveText: { fontFamily: typography.fontFamily.semibold, fontSize: 12, color: colors.accentDark },
  disabledText: { opacity: 0.45 },
  content: { padding: spacing.md, paddingBottom: 48 },
  eyebrow: { fontFamily: typography.fontFamily.medium, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.accent },
  placeName: { marginTop: 4, fontFamily: typography.fontFamily.display, fontSize: 31, lineHeight: 36, color: colors.text },
  placeMeta: { marginTop: 3, fontFamily: typography.fontFamily.body, color: colors.textSecondary, fontSize: 13 },
  section: { marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  label: { marginTop: spacing.md, marginBottom: spacing.sm, fontFamily: typography.fontFamily.semibold, fontSize: 12, color: colors.text },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceSoft, padding: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.accentSoft },
  segmentText: { color: colors.textSecondary, fontFamily: typography.fontFamily.medium, fontSize: 12 },
  segmentTextActive: { color: colors.accentDark },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ratingButton: { width: 46, height: 46, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  priceButton: { minWidth: 58, height: 46, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  selectedButton: { backgroundColor: colors.accent, borderColor: colors.accent },
  optionText: { color: colors.text, fontFamily: typography.fontFamily.semibold },
  selectedText: { color: colors.surface },
  input: { minHeight: 50, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft, color: colors.text, fontFamily: typography.fontFamily.body, fontSize: 14 },
  noteInput: { minHeight: 116, paddingTop: spacing.md, textAlignVertical: 'top' },
  listWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  listChip: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft },
  listChipSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft },
  listChipText: { fontSize: 12, color: colors.text, fontFamily: typography.fontFamily.medium },
  listChipTextSelected: { color: colors.accentDark },
  newListRow: { marginTop: spacing.md, flexDirection: 'row', gap: 8 },
  newListInput: { flex: 1 },
  addListButton: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
  error: { marginTop: spacing.md, color: colors.error, fontFamily: typography.fontFamily.medium, fontSize: 12 },
});
