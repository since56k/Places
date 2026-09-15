import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';

const AuthContext = createContext(null);
const SESSION_KEY = '@placebook/session-v1';

function isValidUser(user) {
  return typeof user?.id === 'string' && Boolean(user.id.trim()) && user.id !== 'local-demo'
    && typeof user.email === 'string' && Boolean(user.email.trim());
}

async function persistSession(session) {
  if (!session) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return;
  }
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!api.isApiConfigured);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    api.setAuthToken('');
    if (!api.isApiConfigured) return;

    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (!active || !raw) return;

        const session = JSON.parse(raw);
        if (typeof session?.token !== 'string' || !session.token.trim()) {
          throw new Error('Invalid saved session');
        }

        api.setAuthToken(session.token);
        const result = await api.getMe();
        if (!active) return;
        if (!isValidUser(result?.user)) throw new Error('Invalid account response');
        // Only trust the user returned by the server, never the cached profile.
        await persistSession({ token: session.token, user: result.user });
        if (active) setUser(result.user);
      } catch (_error) {
        if (!active) return;
        api.setAuthToken('');
        setUser(null);
        try {
          await persistSession(null);
        } catch (_storageError) {
          // A storage failure must still leave the app signed out.
        }
      } finally {
        if (active) setReady(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const finishAuth = useCallback(async (result) => {
    if (typeof result?.token !== 'string' || !result.token.trim() || !isValidUser(result?.user)) {
      throw new Error('Unable to verify your account. Please try again.');
    }
    await persistSession({ token: result.token, user: result.user });
    api.setAuthToken(result.token);
    setUser(result.user);
    setAuthError('');
    return result.user;
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError('');
    try {
      const result = await api.login({ email, password });
      return await finishAuth(result);
    } catch (error) {
      setAuthError(error.message || 'Unable to log in');
      throw error;
    }
  }, [finishAuth]);

  const signup = useCallback(async (name, email, password) => {
    setAuthError('');
    try {
      const result = await api.signup({ name, email, password });
      return await finishAuth(result);
    } catch (error) {
      setAuthError(error.message || 'Unable to create account');
      throw error;
    }
  }, [finishAuth]);

  const logout = useCallback(async () => {
    api.setAuthToken('');
    setUser(null);
    setAuthError('');
    try {
      await persistSession(null);
    } catch (_storageError) {
      setAuthError('Unable to clear the saved session. Please sign in again and retry signing out.');
    }
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    authError,
    canAuthenticate: api.isApiConfigured,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
  }), [user, ready, authError, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
