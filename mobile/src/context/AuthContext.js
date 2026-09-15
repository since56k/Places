import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';

const AuthContext = createContext(null);
const SESSION_KEY = '@placebook/session-v1';

async function persistSession(session) {
  if (!session) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return;
  }
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(api.isApiConfigured ? null : {
    id: 'local-demo',
    name: 'Places tester',
    email: '',
    role: 'admin',
  });
  const [ready, setReady] = useState(!api.isApiConfigured);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!api.isApiConfigured) return;

    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (!raw) return;

        const session = JSON.parse(raw);
        if (!session?.token) return;

        api.setAuthToken(session.token);
        const result = await api.getMe();
        if (!active) return;
        setUser(result.user);
        await persistSession({ token: session.token, user: result.user });
      } catch (_error) {
        api.setAuthToken('');
        await persistSession(null);
      } finally {
        if (active) setReady(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const finishAuth = useCallback(async (result) => {
    api.setAuthToken(result.token);
    setUser(result.user);
    setAuthError('');
    await persistSession(result);
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
    await persistSession(null);
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    authError,
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
