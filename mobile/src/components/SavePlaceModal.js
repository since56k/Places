import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import { colors, radius, spacing } from '../theme';

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
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color={colors.text} /></TouchableOpacity>
          <Text style={styles.title}>Save place</Text>
          <TouchableOpacity disabled={saving} onPress={handleSave}><Text style={[styles.saveText, saving && styles.disabledText]}>{saving ? 'Saving...' : 'Save'}</Text></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeMeta}>{place.city}, {place.country}</Text>

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

          <Text style={styles.label}>Personal note</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What do you want to remember?"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.noteInput]}
            multiline
          />

          <Text style={styles.label}>Tags</Text>
          <TextInput
            value={tagsText}
            onChangeText={setTagsText}
            placeholder="Wine, Date night, Outdoor"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          <Text style={styles.label}>Lists</Text>
          <View style={styles.listWrap}>
            {lists.map((name) => {
              const selected = selectedLists.includes(name);
              return (
                <TouchableOpacity key={name} onPress={() => toggleList(name)} style={[styles.listChip, selected && styles.selectedButton]}>
                  <Text style={[styles.listChipText, selected && styles.selectedText]}>{name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.newListRow}>
            <TextInput value={newListName} onChangeText={setNewListName} placeholder="New list name" placeholderTextColor={colors.muted} style={[styles.input, styles.newListInput]} />
            <TouchableOpacity onPress={handleCreateList} style={styles.addListButton}><Ionicons name="add" size={22} color={colors.background} /></TouchableOpacity>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { height: 60, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  saveText: { fontSize: 16, fontWeight: '700', color: colors.text },
  disabledText: { opacity: 0.45 },
  content: { padding: spacing.lg, paddingBottom: 48 },
  placeName: { fontSize: 24, fontWeight: '800', color: colors.text },
  placeMeta: { marginTop: 4, color: colors.muted, fontSize: 14 },
  label: { marginTop: spacing.lg, marginBottom: spacing.sm, fontSize: 14, fontWeight: '700', color: colors.text },
  segment: { flexDirection: 'row', backgroundColor: colors.surface, padding: 4, borderRadius: radius.md },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.text },
  segmentText: { color: colors.muted, fontWeight: '600' },
  segmentTextActive: { color: colors.background },
  optionRow: { flexDirection: 'row', gap: 8 },
  ratingButton: { width: 46, height: 46, borderWidth: 1, borderColor: colors.border, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  priceButton: { minWidth: 58, height: 46, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  selectedButton: { backgroundColor: colors.text, borderColor: colors.text },
  optionText: { color: colors.text, fontWeight: '700' },
  selectedText: { color: colors.background },
  input: { minHeight: 48, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, color: colors.text, fontSize: 15 },
  noteInput: { minHeight: 110, paddingTop: spacing.md, textAlignVertical: 'top' },
  listWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  listChip: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  listChipText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  newListRow: { marginTop: spacing.md, flexDirection: 'row', gap: 8 },
  newListInput: { flex: 1 },
  addListButton: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.text },
  error: { marginTop: spacing.md, color: '#B42318', fontSize: 13 },
});
