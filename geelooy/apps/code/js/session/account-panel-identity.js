// B"H
/**
 * @file account-panel-identity.js
 * @description Finds one clean user name from whatever identity garment arrives.
 */
const NAME_KEYS = Object.freeze(['username', 'userName', 'displayName', 'name', 'email', 'userId', 'userid', 'id', '_id', 'sub']);
const NESTED_KEYS = Object.freeze(['identity', 'user', 'profile', 'account', 'session']);

function clean(value) {
  const text = String(value ?? '').trim();
  if (!text || text === '[object Object]' || text.toLowerCase() === 'logged in') return '';
  return text;
}

function findName(identity, seen = new Set()) {
  if (!identity || typeof identity !== 'object' || seen.has(identity)) return '';
  seen.add(identity);
  for (const key of NAME_KEYS) {
    const got = clean(identity[key]);
    if (got) return got.replace(/^@+/, '');
  }
  for (const key of NESTED_KEYS) {
    const got = findName(identity[key], seen);
    if (got) return got;
  }
  return '';
}

export function displayName(identity) {
  return findName(identity) || 'unknown';
}
