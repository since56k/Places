import React, { useMemo, useState } from 'react';
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
import { compressPickedPhoto, formatCompressedPhotoInfo } from '../utils/photo';
import { colors, radius, spacing, typography } from '../theme';

const categories = ['Restaurant', 'Café', 'Bar', 'Cocktail Bar', 'Wine Bar', 'Hotel', 'Bakery', 'Other'];

function normalize(value = '') {
  return value.trim().toLocaleLowerCase();
}

export default function EditPlaceScreen({ route, navigation }) {
  const { placeId } = route.params;
  const { places, updatePlace } = usePlaces();
  const place = useMemo(() => places.find((item) => item.id === placeId), [places, placeId]);

  const [name, setName] = useState(place?.name || '');
  const [type, setType] = useState(place?.type || 'Restaurant');
  const [city, setCity] = useState(place?.city || '');
  const [country, setCountry] = useState(place?.country || '');
  const [address, setAddress] = useState(place?.address || '');
  const [caption, setCaption] = useState(place?.caption || '');
  const [imageUrl, setImageUrl] = useState(place?.imageUrl || '');
  const [previewUri, setPreviewUri] = useState(place?.imageUrl || '');
  const [photoInfo, setPhotoInfo] = useState('');
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!place) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.missing}>
          <Text style={styles.title}>Place not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const applyPhotoResult = async (result) => {
    if (result.canceled || !result.assets?.[0]) return;

    setProcessingPhoto(true);
    setError('');

    try {
      const compressed = await compressPickedPhoto(result.assets[0]);
      setPreviewUri(compressed.uri);
      setImageUrl(compressed.dataUri);
      setPhotoInfo(formatCompressedPhotoInfo(compressed));
    } catch (photoError) {
      setError(photoError.message || 'Unable to compress that photo.');
    } finally {
      setProcessingPhoto(false);
    }
  };

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to choose a new image for this place.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      base64: false,
      allowsEditing: false,
    });

    await applyPhotoResult(result);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to photograph this place.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
      base64: false,
      allowsEditing: false,
      cameraType: 'back',
    });

    await applyPhotoResult(result);
  };

  const handleSave = async () => {
    if (saving || processingPhoto) return;

    if (!name.trim() || !city.trim() || !country.trim()) {
      setError('Name, city and country are required.');
      return;
    }

    const duplicate = places.find((candidate) => (
      candidate.id !== placeId
      && normalize(candidate.name) === normalize(name)
      && normalize(candidate.city) === normalize(city)
      && normalize(candidate.country) === normalize(country)
    ));

    if (duplicate) {
      setError('This place already exists in Places.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updatePlace(placeId, {
        name,
        type,
        city,
        country,
        address,
        caption,
        description: place.description || '',
        imageUrl,
      });
      navigation.goBack();
    } catch (saveError) {
      setError(saveError.message || 'Unable to update this place.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit place</Text>
          <TouchableOpacity disabled={saving || processingPhoto} onPress={handleSave} style={styles.saveHeaderButton}>
            <Text style={[styles.saveHeaderText, (saving || processingPhoto) && styles.disabledText]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.photoCard}>
            {!!previewUri && <Image source={{ uri: previewUri }} style={styles.photoPreview} />}
            {!!photoInfo && (
              <View style={styles.photoInfoRow}>
                <Ionicons name="checkmark-circle-outline" size={15} color={colors.success} />
                <Text style={styles.photoInfo}>Compressed · {photoInfo}</Text>
              </View>
            )}
            <View style={styles.photoActions}>
              <TouchableOpacity disabled={processingPhoto} onPress={choosePhoto} style={[styles.secondaryButton, processingPhoto && styles.buttonDisabled]}>
                <Ionicons name="images-outline" size={17} color={colors.accent} />
                <Text style={styles.secondaryButtonText}>Replace from library</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={processingPhoto} onPress={takePhoto} style={[styles.secondaryIconButton, processingPhoto && styles.buttonDisabled]}>
                <Ionicons name="camera-outline" size={18} color={colors.accent} />
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

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity disabled={saving || processingPhoto} onPress={handleSave} style={[styles.primaryButton, (saving || processingPhoto) && styles.buttonDisabled]}>
            <Ionicons name={processingPhoto ? 'hourglass-outline' : 'checkmark'} size={20} color={colors.surface} />
            <Text style={styles.primaryButtonText}>{processingPhoto ? 'Compressing photo...' : saving ? 'Saving...' : 'Save changes'}</Text>
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
  header: { minHeight: 62, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSoft },
  headerTitle: { fontFamily: typography.fontFamily.display, fontSize: 21, color: colors.text },
  saveHeaderButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.accentSoft },
  saveHeaderText: { fontFamily: typography.fontFamily.semibold, fontSize: 12, color: colors.accentDark },
  disabledText: { opacity: 0.45 },
  content: { padding: spacing.md, paddingBottom: 60 },
  photoCard: { padding: spacing.sm, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  photoPreview: { width: '100%', height: 250, borderRadius: radius.lg, backgroundColor: colors.surfaceSoft },
  photoInfoRow: { paddingTop: 9, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 5 },
  photoInfo: { fontFamily: typography.fontFamily.medium, fontSize: 11, color: colors.textSecondary },
  photoActions: { marginTop: spacing.sm, flexDirection: 'row', gap: 8 },
  secondaryButton: { flex: 1, height: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: colors.surface },
  secondaryIconButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  secondaryButtonText: { fontFamily: typography.fontFamily.medium, fontSize: 12, color: colors.accentDark },
  section: { marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  sectionEyebrow: { marginBottom: 2, fontFamily: typography.fontFamily.medium, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.accent },
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
  error: { marginTop: spacing.md, color: colors.error, fontFamily: typography.fontFamily.medium, fontSize: 12 },
  primaryButton: { marginTop: spacing.lg, height: 56, borderRadius: radius.pill, backgroundColor: colors.accent, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: colors.surface, fontFamily: typography.fontFamily.semibold, fontSize: 14 },
  buttonDisabled: { opacity: 0.45 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { fontFamily: typography.fontFamily.display, fontSize: 34, color: colors.text },
  backLink: { marginTop: spacing.md, fontFamily: typography.fontFamily.medium, color: colors.accent },
});
