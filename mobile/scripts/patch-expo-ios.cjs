// Xcode 26.3 / Swift 6.2 compatibility for expo-modules-jsi 57.1.0.
// Fail closed when upstream changes; never silently patch another version.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.dirname(require.resolve('expo-modules-jsi/package.json'));
const version = require(path.join(root, 'package.json')).version;
if (version !== '57.1.0') throw new Error(`Review the Expo iOS patch for ${version}`);
const entries = require('./expo-modules-jsi-57.1.0.json');
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex');
const states = entries.map(e => hash(e.path));
if (entries.every((e, i) => states[i] === e.after)) {
  console.log('Expo iOS compatibility patch already applied.');
} else {
  if (!entries.every((e, i) => states[i] === e.before)) {
    throw new Error('Unexpected Expo source changes. Reinstall with npm ci before applying the iOS patch.');
  }
  execFileSync('patch', ['--batch', '--forward', '-p1', '-i', path.join(__dirname, 'expo-modules-jsi-57.1.0.patch')], { cwd: root, stdio: 'inherit' });
  if (!entries.every(e => hash(e.path) === e.after)) throw new Error('Expo patch verification failed');
  console.log('Expo iOS compatibility patch applied and verified.');
}
