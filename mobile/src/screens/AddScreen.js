import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import { colors, radius, spacing } from '../theme';

const defaultImage = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80';

export default function AddScreen({ navigation }) {
  const { addPlace, lists } = usePlaces();
  const [name, setName] = useState('');
  const [type, setType] = useState('Restaurant');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState('want_to_go');
  const [rating, setRating] = useState(0);
  const [price, setPrice] = useState(2);
  const [note, setNote] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [selectedLists, setSelectedLists] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleList = (list) => {
    setSelectedLists((current) => current.includes(list)
      ? current.filter((item) => item !== list)
      : [...current, list]);
  };

  const handleAdd = async () => {
    if (submitting) return;

    if (!name.trim() || !city.trim() || !country.trim()) {
      setError('Name, city and country are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const place = await addPlace({
        name,
        type,
        city,
        country,
        imageUrl: imageUrl || defaultImage,
        caption,
        status,
        rating,
        price,
        note,
        tags: tagsText.split(',').map((tag) => tag.trim()).filter(Boolean),
        lists: selectedLists,
      });

      setName('');
      setCity('');
      setCountry('');
      setImageUrl('');
      setCaption('');
      setNote('');
      setTagsText('');
      setSelectedLists([]);
      setRating(0);

      navigation.navigate('PlaceDetails', { placeId: place.id });
    } catch (saveError) {
      setError(saveError.message || 'Unable to add this place.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Add a place</Text>
          <Text style={styles.subtitle}>Save somewhere you know or somewhere you want to go.</Text>

          <Field label="Name" value={name} onChangeText={setName} placeholder="Place name" />
          <Field label="Type" value={type} onChangeText={setType} placeholder="Restaurant, Café, Hotel..." />
          <View style={styles.twoColumns}>
            <View style={styles.column}><Field label="City" value={city} onChangeText={setCity} placeholder="Florence" /></View>
            <View style={styles.column}><Field label="Country" value={country} onChangeText={setCountry} placeholder="Italy" /></View>
          </View>
          <Field label="Image URL" value={imageUrl} onChangeText={setImageUrl} placeholder="Optional for now" autoCapitalize="none" />
          <Field label="Caption" value={caption} onChangeText={setCaption} placeholder="Why is this place worth remembering?" multiline />

          <Text style={styles.label}>Status</Text>
          <View style={styles.segment}>
            {[['visited', 'Visited'], ['want_to_go', 'Want to go']].map(([value, label]) => (
              <TouchableOpacity key={value} onPress={() => setStatus(value)} style={[styles.segmentItem, status === value && styles.segmentActive]}>
                <Text style={[styles.segmentText, status === value && styles.segmentTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Your rating</Text>
          <View style={styles.optionRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity key={value} onPress={() => setRating(value)} style={[styles.circleButton, rating === value && styles.selectedButton]}>
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

          <Field label="Personal note" value={note} onChangeText={setNote} placeholder="What do you want to remember?" multiline />
          <Field label="Tags" value={tagsText} onChangeText={setTagsText} placeholder="Wine, Date night, Outdoor" />

          <Text style={styles.label}>Lists</Text>
          <View style={styles.listWrap}>
            {lists.map((list) => {
              const selected = selectedLists.includes(list);
              return (
                <TouchableOpacity key={list} onPress={() => toggleList(list)} style={[styles.listChip, selected && styles.selectedButton]}>
                  <Text style={[styles.listChipText, selected && styles.selectedText]}>{list}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity disabled={submitting} onPress={handleAdd} style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}>
            <Ionicons name={submitting ? 'cloud-upload-outline' : 'add'} size={20} color={colors.background} />
            <Text style={styles.primaryButtonText}>{submitting ? 'Saving...' : 'Add place'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, multiline, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.muted}
        style={[styles.input, multiline && styles.multilineInput]}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 60 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -1, color: colors.text },
  subtitle: { marginTop: 5, marginBottom: spacing.md, fontSize: 14, lineHeight: 21, color: colors.muted },
  field: { marginTop: spacing.md },
  label: { marginTop: spacing.md, marginBottom: 8, fontSize: 13, fontWeight: '700', color: colors.text },
  input: { minHeight: 48, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: spacing.md, color: colors.text, fontSize: 15 },
  multilineInput: { minHeight: 104, paddingTop: spacing.md, textAlignVertical: 'top' },
  twoColumns: { flexDirection: 'row', gap: 10 },
  column: { flex: 1 },
  segment: { flexDirection: 'row', backgroundColor: colors.surface, padding: 4, borderRadius: radius.md },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.text },
  segmentText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  segmentTextActive: { color: colors.background },
  optionRow: { flexDirection: 'row', gap: 8 },
  circleButton: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  priceButton: { minWidth: 58, height: 46, paddingHorizontal: 10, borderRadius: 23, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  selectedButton: { backgroundColor: colors.text, borderColor: colors.text },
  optionText: { fontWeight: '700', color: colors.text },
  selectedText: { color: colors.background },
  listWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  listChip: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  listChipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  error: { marginTop: spacing.lg, color: '#B42318', fontSize: 13 },
  primaryButton: { marginTop: spacing.xl, height: 52, borderRadius: radius.md, backgroundColor: colors.text, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  primaryButtonDisabled: { opacity: 0.55 },
  primaryButtonText: { color: colors.background, fontSize: 15, fontWeight: '700' },
});
