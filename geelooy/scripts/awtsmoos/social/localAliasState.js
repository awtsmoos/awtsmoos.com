// B"H
export const ALIAS_KEYS = Object.freeze([
  'awtsmoosAlias',
  'awtsmoos_social_inbox_alias',
  'BH_PROFILE_VIEWER_ALIAS'
]);

export function isValidAlias(value) {
  const alias = String(value || '').trim();
  return !!alias && !['null', 'undefined', 'false', '0'].includes(alias.toLowerCase());
}

export function cleanAlias(value) {
  return isValidAlias(value) ? String(value).trim().replace(/^@+/, '') : '';
}

export function readRememberedAlias() {
  const direct = cleanAlias(window.curAlias || window.currentAlias || window.awtsmoosAlias);
  if (direct) return direct;
  for (const key of ALIAS_KEYS) {
    const alias = cleanAlias(localStorage.getItem(key));
    if (alias) return alias;
  }
  return '';
}

export function rememberAlias(alias) {
  const clean = cleanAlias(alias);
  if (!clean) return '';
  window.curAlias = clean;
  window.currentAlias = clean;
  window.awtsmoosAlias = clean;
  for (const key of ALIAS_KEYS) localStorage.setItem(key, clean);
  return clean;
}

export function aliasDisplay(value) {
  const alias = cleanAlias(value);
  return alias ? `@${alias}` : 'Local mode';
}

/**
 * B"H
 * Alias memory is a small wick, not the flame itself. When the server is quiet,
 * the browser still remembers enough identity to keep the local OS graceful.
 */
