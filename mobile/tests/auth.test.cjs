const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const vm = require('node:vm');
const { transformFileSync } = require('@babel/core');
const React = require('react');
const { create, act } = require('react-test-renderer');

global.IS_REACT_ACT_ENVIRONMENT = true;
const user = { id: 'account-1', name: 'Gabriele', email: 'gabriele@example.com', role: 'user' };
const saved = JSON.stringify({ token: 'saved-token', user: { ...user, role: 'admin' } });
const compiled = new Map();
function load(file, mocks = {}, globals = {}) {
  if (!compiled.has(file)) {
    compiled.set(file, transformFileSync(path.join(__dirname, '..', file), {
      babelrc: false, configFile: false,
      plugins: ['@babel/plugin-transform-modules-commonjs', '@babel/plugin-transform-react-jsx'],
    }).code);
  }
  const module = { exports: {} };
  vm.runInNewContext(compiled.get(file), {
    module, exports: module.exports,
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    setTimeout, clearTimeout, AbortController, ...globals,
  }, { filename: file });
  return module.exports;
}

async function mount(t, options = {}) {
  const { raw = null, fetcher, storageFailure } = options;
  const url = Object.hasOwn(options, 'url') ? options.url : 'https://api.example.com';
  let stored = raw;
  const calls = [];
  const storage = {
    getItem: async () => { if (storageFailure === 'read') throw Error('Storage failed'); return stored; },
    setItem: async (_key, value) => { if (storageFailure === 'write') throw Error('Storage failed'); stored = value; },
    removeItem: async () => { if (storageFailure === 'remove') throw Error('Storage failed'); stored = null; },
  };
  const api = load('src/services/api.js', {}, {
    process: { env: { EXPO_PUBLIC_API_URL: url } },
    fetch: async (...args) => {
      calls.push(args);
      return fetcher ? fetcher(...args) : { ok: true, status: 200, json: async () => ({ user }) };
    },
  });
  const auth = load('src/context/AuthContext.js', {
    '@react-native-async-storage/async-storage': storage, '../services/api': api,
  });
  let state;
  function Probe() { state = auth.useAuth(); return null; }
  const native = Object.fromEntries(['View', 'Text', 'SafeAreaView', 'ScrollView', 'TextInput',
    'TouchableOpacity', 'ActivityIndicator', 'KeyboardAvoidingView'].map((name) => [name, name]));
  native.StyleSheet = { create: (styles) => styles };
  native.Platform = { OS: 'ios' };
  const theme = load('src/theme.js');
  const AuthScreen = load('src/screens/AuthScreen.js', {
    'react-native': native, '../context/AuthContext': auth, '../theme': theme,
  }).default;
  const mocks = {
    'react-native': native,
    '@react-navigation/native': { NavigationContainer: 'NavigationContainer' },
    '@react-navigation/bottom-tabs': { createBottomTabNavigator: () => ({ Navigator: 'Tabs', Screen: 'Tab' }) },
    '@react-navigation/native-stack': { createNativeStackNavigator: () => ({ Navigator: 'Stack', Screen: 'Screen' }) },
    '@expo/vector-icons': { Ionicons: 'Icon' }, 'expo-status-bar': { StatusBar: 'StatusBar' },
    'expo-font': { useFonts: () => [true] },
    '@expo-google-fonts/dm-serif-display': {}, '@expo-google-fonts/inter': {},
    './src/theme': theme,
    './src/context/AuthContext': { ...auth, AuthProvider: ({ children }) => React.createElement(auth.AuthProvider, null, React.createElement(Probe), children) },
    './src/context/PlacesContext': { PlacesProvider: 'PlacesProvider' },
    './src/screens/AuthScreen': AuthScreen,
  };
  for (const screen of ['Feed', 'Explore', 'Add', 'MyPlaces', 'Profile', 'PlaceDetails', 'EditPlace']) {
    mocks[`./src/screens/${screen}Screen`] = `${screen}Screen`;
  }
  const App = load('App.js', mocks).default;
  let tree;
  await act(async () => { tree = create(React.createElement(App)); });
  t.after(async () => { await act(async () => tree.unmount()); });
  return { api, tree, calls, get state() { return state; }, get stored() { return stored; } };
}
function signedOut(h) {
  assert.equal(h.state.ready, true);
  assert.equal(h.state.isAuthenticated, false);
  assert.equal(h.state.user, null);
  assert.equal(h.tree.root.findAllByType('PlacesProvider').length, 0);
  assert.match(JSON.stringify(h.tree.toJSON()), /Sign in/);
}

for (const url of [undefined, '', '  ']) {
  test(`missing/blank API never auto-authenticates, even with saved session (${String(url)})`, async (t) => {
    const h = await mount(t, { url, raw: saved });
    signedOut(h);
    assert.equal(h.calls.length, 0);
    assert.equal(h.state.canAuthenticate, false);
    assert.match(JSON.stringify(h.tree.toJSON()), /Sign in is unavailable/);
    assert.equal(h.tree.root.findAllByType('TouchableOpacity')[0].props.disabled, true);
  });
}
test('configured API without session displays AuthScreen', async (t) => signedOut(await mount(t)));
for (const raw of ['{broken', '{}', '{"token":42}', '{"token":"  "}', 'null']) {
  test(`malformed saved session is removed: ${raw}`, async (t) => {
    const h = await mount(t, { raw });
    signedOut(h); assert.equal(h.stored, null); assert.equal(h.calls.length, 0);
  });
}
test('cached account is blocked until server validation finishes', async (t) => {
  let resolve;
  const pending = new Promise((done) => { resolve = done; });
  const h = await mount(t, { raw: saved, fetcher: () => pending });
  assert.equal(h.state.ready, false); assert.equal(h.state.user, null);
  assert.equal(h.tree.root.findAllByType('PlacesProvider').length, 0);
  await act(async () => resolve({ ok: true, status: 200, json: async () => ({ user }) }));
  assert.equal(h.state.isAuthenticated, true);
  assert.equal(h.state.user.role, 'user');
  assert.equal(h.tree.root.findAllByType('PlacesProvider').length, 1);
  assert.equal(h.calls[0][1].headers.Authorization, 'Bearer saved-token');
  assert.equal(JSON.parse(h.stored).user.role, 'user');
});
for (const status of [401, 403, 404, 500]) {
  test(`session validation HTTP ${status} leaves app signed out`, async (t) => {
    const h = await mount(t, { raw: saved, fetcher: async () => ({ ok: false, status, json: async () => ({}) }) });
    signedOut(h); assert.equal(h.stored, null);
    await assert.rejects(h.api.getPlaces());
    assert.equal(h.calls.at(-1)[1].headers.Authorization, undefined);
  });
}
test('offline startup rejects cached session and clears the bearer token', async (t) => {
  let offline = true;
  const h = await mount(t, { raw: saved, fetcher: async () => {
    if (offline) throw Error('Network unavailable');
    return { ok: true, status: 200, json: async () => [] };
  } });
  signedOut(h); assert.equal(h.stored, null);
  offline = false;
  await h.api.getPlaces();
  assert.equal(h.calls[1][1].headers.Authorization, undefined);
});
for (const invalidUser of [null, {}, { id: 'local-demo', email: 'test@example.com' }]) {
  test(`invalid server account cannot enter main app: ${JSON.stringify(invalidUser)}`, async (t) => {
    const h = await mount(t, { raw: saved, fetcher: async () => ({ ok: true, status: 200, json: async () => ({ user: invalidUser }) }) });
    signedOut(h);
  });
}
for (const storageFailure of ['read', 'write', 'remove']) {
  test(`storage ${storageFailure} failure still completes signed out`, async (t) => {
    const h = await mount(t, { storageFailure, raw: storageFailure === 'remove' ? '{broken' : saved });
    signedOut(h);
  });
}
for (const action of ['login', 'signup']) {
  test(`${action} persists a valid account, logout clears it and returns to AuthScreen`, async (t) => {
    const h = await mount(t, { fetcher: async () => ({ ok: true, status: 200, json: async () => ({ token: 'new-token', user }) }) });
    await act(async () => h.state[action](...(action === 'login' ? [user.email, 'test-password'] : [user.name, user.email, 'test-password'])));
    assert.equal(h.state.isAuthenticated, true); assert.equal(JSON.parse(h.stored).token, 'new-token');
    await act(async () => h.state.logout());
    signedOut(h); assert.equal(h.stored, null);
    await h.api.getPlaces();
    assert.equal(h.calls.at(-1)[1].headers.Authorization, undefined);
  });
}
test('failed session persistence during login does not grant access', async (t) => {
  const h = await mount(t, { storageFailure: 'write', fetcher: async () => ({ ok: true, status: 200, json: async () => ({ token: 'new-token', user }) }) });
  await act(async () => { await assert.rejects(h.state.login(user.email, 'test-password')); });
  signedOut(h);
});
test('API URL is trimmed and normalized', async (t) => {
  const h = await mount(t, { url: ' https://api.example.com/// ', raw: saved });
  assert.equal(h.calls[0][0], 'https://api.example.com/api/auth/me');
});
test('session validation times out and cancels the request', async () => {
  let timeoutCallback; let cleared = false;
  const api = load('src/services/api.js', {}, {
    process: { env: { EXPO_PUBLIC_API_URL: 'https://api.example.com' } },
    setTimeout: (callback, ms) => { assert.equal(ms, 15000); timeoutCallback = callback; return 1; },
    clearTimeout: () => { cleared = true; },
    fetch: (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(Error('Aborted')))),
  });
  const pending = api.getMe();
  timeoutCallback();
  await assert.rejects(pending, /Aborted/);
  assert.equal(cleared, true);
});

for (const result of [{ user }, { token: 'new-token', user: null }]) {
  test(`malformed login response cannot grant access: ${JSON.stringify(result)}`, async (t) => {
    const h = await mount(t, { fetcher: async () => ({ ok: true, status: 200, json: async () => result }) });
    await act(async () => { await assert.rejects(h.state.login(user.email, 'test-password')); });
    signedOut(h); assert.equal(h.stored, null);
  });
}
