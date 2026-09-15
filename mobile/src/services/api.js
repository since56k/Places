const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
let authToken = '';

export const isApiConfigured = Boolean(API_URL);

export function setAuthToken(token) {
  authToken = token || '';
}

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error('Sign in is unavailable in this build. Please contact the beta organizer.');
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch (_error) {
      // Keep the fallback HTTP error message.
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export function signup(input) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function login(input) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getMe() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    return await request('/api/auth/me', { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export function getPlaces() {
  return request('/api/places');
}

export function createPlace(input) {
  return request('/api/places', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updatePlace(placeId, input) {
  return request(`/api/places/${placeId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deletePlace(placeId) {
  return request(`/api/places/${placeId}`, {
    method: 'DELETE',
  });
}

export function getSavedPlaces() {
  return request('/api/saved-places');
}

export function savePersonalPlace(placeId, input) {
  return request(`/api/saved-places/${placeId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteSavedPlace(placeId) {
  return request(`/api/saved-places/${placeId}`, {
    method: 'DELETE',
  });
}

export function getLists() {
  return request('/api/lists');
}

export function createList(name) {
  return request('/api/lists', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function renameList(currentName, nextName) {
  return request(`/api/lists/by-name/${encodeURIComponent(currentName)}`, {
    method: 'PATCH',
    body: JSON.stringify({ name: nextName }),
  });
}

export function deleteList(name) {
  return request(`/api/lists/by-name/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
}
