import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../theme';

export default function AuthScreen() {
  const { login, signup, authError, canAuthenticate } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  const submit = async () => {
    if (!canAuthenticate || submitting) return;
    if (!email.trim() || !password || (isSignup && !name.trim())) return;
    setSubmitting(true);
    try {
      if (isSignup) {
        await signup(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (_error) {
      // Error is surfaced by AuthContext.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>Placebook</Text>
            <Text style={styles.tagline}>Your private collection of places worth remembering.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{isSignup ? 'Create your account' : 'Welcome back'}</Text>
            <Text style={styles.subtitle}>
              {isSignup ? 'Keep your places, lists and notes separate from everyone else.' : 'Sign in to your personal Placebook.'}
            </Text>

            {isSignup && (
              <>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  textContentType="name"
                  autoCapitalize="words"
                />
              </>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              secureTextEntry
              textContentType={isSignup ? 'newPassword' : 'password'}
              returnKeyType="done"
              onSubmitEditing={submit}
            />

            {!canAuthenticate && (
              <Text style={styles.error}>Sign in is unavailable in this build. Please contact the beta organizer.</Text>
            )}

            {!!authError && <Text style={styles.error}>{authError}</Text>}

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={submit}
              disabled={submitting || !canAuthenticate}
              style={[styles.primaryButton, (submitting || !canAuthenticate) && styles.disabled]}
            >
              {submitting ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.primaryButtonText}>{isSignup ? 'Create account' : 'Sign in'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMode(isSignup ? 'login' : 'signup');
                setPassword('');
              }}
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>
                {isSignup ? 'Already have an account? Sign in' : 'New to Placebook? Create account'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.xl, justifyContent: 'center' },
  brandBlock: { marginBottom: spacing.xl },
  brand: { fontFamily: typography.fontFamily.display, fontSize: 54, lineHeight: 58, color: colors.text },
  tagline: { marginTop: 8, maxWidth: 320, fontFamily: typography.fontFamily.body, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  title: { fontFamily: typography.fontFamily.display, fontSize: 30, color: colors.text },
  subtitle: { marginTop: 6, marginBottom: spacing.lg, fontFamily: typography.fontFamily.body, fontSize: 13, lineHeight: 20, color: colors.textSecondary },
  label: { marginTop: 12, marginBottom: 7, fontFamily: typography.fontFamily.semibold, fontSize: 13, color: colors.text },
  input: { minHeight: 54, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 15, backgroundColor: colors.surfaceSoft, fontFamily: typography.fontFamily.body, fontSize: 15, color: colors.text },
  error: { marginTop: 12, fontFamily: typography.fontFamily.medium, fontSize: 12, lineHeight: 18, color: colors.error },
  primaryButton: { marginTop: spacing.lg, minHeight: 54, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { fontFamily: typography.fontFamily.semibold, fontSize: 15, color: colors.surface },
  disabled: { opacity: 0.65 },
  switchButton: { paddingTop: spacing.md, alignItems: 'center' },
  switchText: { fontFamily: typography.fontFamily.medium, fontSize: 13, color: colors.accentDark },
});
