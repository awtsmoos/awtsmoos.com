// B"H
const RULES = Object.freeze([
  ['permission', /permission|denied|forbidden/i, '⛔'],
  ['remote', /remote|tunnel|drive|vessel/i, '🌐'],
  ['alias', /alias|public|publish|login|sign in|sync/i, '🔗'],
  ['graph', /graph|object|event/i, '🕸️'],
  ['local', /local|indexeddb|saved|blob/i, '💾'],
  ['progress', /progress|publishing|upload/i, '⏳']
]);
export function inferToastTag(text) { return RULES.find(([, rx]) => rx.test(String(text || '')))?.[0] || 'os'; }
export function iconForToast(type = 'info', tag = '') {
  if (type === 'success') return '✅'; if (type === 'error') return '⚠️';
  if (type === 'progress') return '⏳'; return RULES.find(([name]) => name === tag)?.[2] || 'ℹ️';
}
export function taggedToastText(text, tag = '') {
  const clean = String(text || ''); const found = tag || inferToastTag(clean);
  return !found || clean.startsWith('[') ? clean : `[${found}] ${clean}`;
}
/** B"H: each toast receives a tag and icon, sparks clothed for the user's eye. */
