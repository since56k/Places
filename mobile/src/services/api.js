const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const USER_KEY = 'test-user';

export const isApiConfigured = Boolean(API_URL);

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
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
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
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
  return request(`/api/saved-places?userKey=${encodeURIComponent(USER_KEY)}`);
}

export function savePersonalPlace(placeId, input) {
  return request(`/api/saved-places/${placeId}`, {
    method: 'PUT',
    body: JSON.stringify({ ...input, userKey: USER_KEY }),
  });
}

export function deleteSavedPlace(placeId) {
  return request(`/api/saved-places/${placeId}?userKey=${encodeURIComponent(USER_KEY)}`, {
    method: 'DELETE',
  });
}

export function getLists() {
  return request(`/api/lists?userKey=${encodeURIComponent(USER_KEY)}`);
}

export function createList(name) {
  return request('/api/lists', {
    method: 'POST',
    body: JSON.stringify({ name, userKey: USER_KEY }),
  });
}

export function deleteList(name) {
  return request(`/api/lists/by-name/${encodeURIComponent(name)}?userKey=${encodeURIComponent(USER_KEY)}`, {
    method: 'DELETE',
  });
}
