import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePlaces } from '../context/PlacesContext';
import { colors, radius, spacing, typography } from '../theme';

const defaultImage = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80';
const categories = ['Restaurant', 'Café', 'Bar', 'Cocktail Bar', 'Wine Bar', 'Hotel', 'Bakery', 'Other'];

function normalize(value = '') {
  return value.trim().toLocaleLowerCase();
}

function assetToDataUri(asset) {
  if (!asset?.base64) return '';
  return `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
}

export default function AddScreen({ navigation }) {
  const { addPlace, createList, lists, places } = usePlaces();
  const [name, setName] = useState('');
  const [type, setType] = useState('Restaurant');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [photoData, setPhotoData] = useState('');
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState('want_to_go');
  const [rating, setRating] = useState(0);
  const [price, setPrice] = useState(2);
  const [note, setNote] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [selectedLists, setSelectedLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [creatingList, setCreatingList] = useState(false);

  const applyPhotoResult = (result) => {
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const dataUri = assetToDataUri(asset);

    if (!dataUri) {
      setError('Unable to read that photo. Please choose another image.');
      return;
    }

    setPhotoUri(asset.uri);
    setPhotoData(dataUri);
    setError('');
  };

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to choose an image for this place.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.45,
      base64: true,
      allowsEditing: false,
    });
    applyPhotoResult(result);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to photograph this place.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.45,
      base64: true,
      allowsEditing: false,
      cameraType: 'back',
    });
    applyPhotoResult(result);
  };

  const removePhoto = () => {
    setPhotoUri('');
    setPhotoData('');
  };

  const toggleList = (list) => {
    setSelectedLists((current) => current.includes(list)
      ? current.filter((item) => item !== list)
      : [...current, list]);
  };

  const handleCreateList = async () => {
    const cleanName = newListName.trim();
    if (!cleanName || creatingList) return;

    setCreatingList(true);
    setError('');
    try {
      const created = await createList(cleanName);
      if (created) {
        setSelectedLists((current) => current.includes(created) ? current : [...current, created]);
      }
      setNewListName('');
    } catch (createError) {
      setError(createError.message || 'Unable to create this list.');
    } finally {
      setCreatingList(false);
    }
  };

  const resetForm = () => {
    setName('');
    setType('Restaurant');
    setCity('');
    setCountry('');
    setAddress('');
    setPhotoUri('');
    setPhotoData('');
    setCaption('');
    setStatus('want_to_go');
    setRating(0);
    setPrice(2);
    setNote('');
    setTagsText('');
    setSelectedLists([]);
    setNewListName('');
  };

  const handleAdd = async () => {
    if (submitting) return;

    if (!name.trim() || !city.trim() || !country.trim()) {
      setError('Name, city and country are required.');
      return;
    }

    const duplicate = places.find((place) => (
      normalize(place.name) === normalize(name)
      && normalize(place.city) === normalize(city)
      && normalize(place.country) === normalize(country)
    ));

    if (duplicate) {
      Alert.alert(
        'Place already exists',
        `${duplicate.name} in ${duplicate.city} is already in Places.`,
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Open place', onPress: () => navigation.navigate('PlaceDetails', { placeId: duplicate.id }) },
        ]
      );
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
        address,
        imageUrl: photoData || defaultImage,
        caption,
        status,
        rating,
        price,
        note,
        tags: tagsText.split(',').map((tag) => tag.trim()).filter(Boolean),
        lists: selectedLists,
      });

      resetForm();
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
          <Text style={styles.subtitle}>Save a place in a few details. You can refine it later.</Text>

          <View style={styles.photoCard}>
            {photoUri ? (
              <View style={styles.photoPreviewWrap}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <TouchableOpacity onPress={removePhoto} style={styles.removePhotoButton}>
                  <Ionicons name="close" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoEmpty}>
                <View style={styles.photoIcon}>
                  <Ionicons name="image-outline" size={28} color={colors.accent} />
                </View>
                <Text style={styles.photoTitle}>Add a photo</Text>
                <Text style={styles.photoHint}>Use a photo from your library or take one now.</Text>
              </View>
            )}
            <View style={styles.photoActions}>
              <TouchableOpacity onPress={choosePhoto} style={styles.secondaryButton}>
                <Ionicons name="images-outline" size={17} color={colors.accent} />
                <Text style={styles.secondaryButtonText}>Library</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={takePhoto} style={styles.secondaryButton}>
                <Ionicons name="camera-outline" size={17} color={colors.accent} />
                <Text style={styles.secondaryButtonText}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>The place</Text>
            <Field label="Name *" value={name} onChangeText={setName} placeholder="Place name" autoCapitalize="words" />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryWrap}>
              {categories.map((category) => {
                const selected = type === category;
                return (
                  <TouchableOpacity key={category} onPress={() => setType(category)} style={[styles.categoryChip, selected && styles.categoryChipSelected]}>
                    <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>{category}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.twoColumns}>
              <View style={styles.column}><Field label="City *" value={city} onChangeText={setCity} placeholder="Florence" autoCapitalize="words" /></View>
              <View style={styles.column}><Field label="Country *" value={country} onChangeText={setCountry} placeholder="Italy" autoCapitalize="words" /></View>
            </View>
            <Field label="Address" value={address} onChangeText={setAddress} placeholder="Street and number" autoCapitalize="words" />
            <Field label="Caption" value={caption} onChangeText={setCaption} placeholder="Why is this place worth remembering?" multiline />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>Your memory</Text>
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
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>Lists</Text>
            <Text style={styles.sectionIntro}>Add this place to one or more collections.</Text>
            <View style={styles.listWrap}>
              {lists.map((list) => {
                const selected = selectedLists.includes(list);
                return (
                  <TouchableOpacity key={list} onPress={() => toggleList(list)} style={[styles.listChip, selected && styles.listChipSelected]}>
                    <Ionicons name={selected ? 'checkmark' : 'add'} size={14} color={selected ? colors.accentDark : colors.textSecondary} />
                    <Text style={[styles.listChipText, selected && styles.listChipTextSelected]}>{list}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.newListRow}>
              <TextInput
                value={newListName}
                onChangeText={setNewListName}
                placeholder="New list name"
                placeholderTextColor={colors.textSecondary}
                style={styles.newListInput}
                returnKeyType="done"
                onSubmitEditing={handleCreateList}
              />
              <TouchableOpacity disabled={!newListName.trim() || creatingList} onPress={handleCreateList} style={[styles.addListButton, (!newListName.trim() || creatingList) && styles.buttonDisabled]}>
                <Ionicons name="add" size={20} color={colors.surface} />
              </TouchableOpacity>
            </View>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity disabled={submitting} onPress={handleAdd} style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}>
            <Ionicons name={submitting ? 'cloud-upload-outline' : 'add'} size={20} color={colors.surface} />
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
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, multiline && styles.multilineInput]}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 110 },
  title: { fontFamily: typography.fontFamily.display, fontSize: typography.size.display, lineHeight: typography.lineHeight.display, color: colors.text },
  subtitle: { marginTop: 3, marginBottom: spacing.lg, maxWidth: 330, fontFamily: typography.fontFamily.body, fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  photoCard: { marginBottom: spacing.lg, padding: spacing.sm, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  photoPreviewWrap: { position: 'relative' },
  photoPreview: { width: '100%', height: 230, borderRadius: radius.lg, backgroundColor: colors.surfaceSoft },
  removePhotoButton: { position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.94)' },
  photoEmpty: { minHeight: 176, padding: spacing.lg, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, backgroundColor: colors.surfaceSoft },
  photoIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  photoTitle: { marginTop: 12, fontFamily: typography.fontFamily.display, fontSize: 22, color: colors.text },
  photoHint: { marginTop: 5, maxWidth: 260, textAlign: 'center', fontFamily: typography.fontFamily.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  photoActions: { marginTop: spacing.sm, flexDirection: 'row', gap: 8 },
  secondaryButton: { flex: 1, height: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: colors.surface },
  secondaryButtonText: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.accentDark },
  section: { marginBottom: spacing.lg, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  sectionEyebrow: { marginBottom: 2, fontFamily: typography.fontFamily.medium, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.accent },
  sectionIntro: { marginTop: 5, marginBottom: 4, fontFamily: typography.fontFamily.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  field: { marginTop: spacing.md },
  label: { marginTop: spacing.md, marginBottom: 8, fontFamily: typography.fontFamily.semibold, fontSize: 12, color: colors.text },
  input: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft, paddingHorizontal: spacing.md, color: colors.text, fontFamily: typography.fontFamily.body, fontSize: 14 },
  multilineInput: { minHeight: 112, paddingTop: spacing.md, textAlignVertical: 'top' },
  twoColumns: { flexDirection: 'row', gap: 10 },
  column: { flex: 1 },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft },
  categoryChipSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft },
  categoryChipText: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  categoryChipTextSelected: { color: colors.accentDark },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceSoft, padding: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.accentSoft },
  segmentText: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  segmentTextActive: { color: colors.accentDark },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  circleButton: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  priceButton: { minWidth: 58, height: 46, paddingHorizontal: 10, borderRadius: 23, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  selectedButton: { backgroundColor: colors.accent, borderColor: colors.accent },
  optionText: { fontFamily: typography.fontFamily.semibold, color: colors.text },
  selectedText: { color: colors.surface },
  listWrap: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  listChip: { minHeight: 38, paddingVertical: 9, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft, flexDirection: 'row', alignItems: 'center', gap: 5 },
  listChipSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft },
  listChipText: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.text },
  listChipTextSelected: { color: colors.accentDark },
  newListRow: { marginTop: spacing.md, flexDirection: 'row', gap: 8 },
  newListInput: { flex: 1, height: 48, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, backgroundColor: colors.surfaceSoft, color: colors.text, fontFamily: typography.fontFamily.body, fontSize: 13 },
  addListButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.4 },
  error: { marginBottom: spacing.md, color: colors.error, fontFamily: typography.fontFamily.medium, fontSize: 12 },
  primaryButton: { height: 56, borderRadius: radius.pill, backgroundColor: colors.accent, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  primaryButtonDisabled: { opacity: 0.55 },
  primaryButtonText: { color: colors.surface, fontFamily: typography.fontFamily.semibold, fontSize: 14 },
});
