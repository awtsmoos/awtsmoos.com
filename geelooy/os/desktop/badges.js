// B"H
/** Badges are tiny crowns: one syllable of system truth above each gate. */
export function badgeForItem(item = {}) {
  if (item.badge) return item.badge;
  if (item.kind === 'remote') return 'remote';
  if (item.kind === 'tool') return 'app';
  if (item.kind === 'shortcut') return 'link';
  if (String(item.path || '').startsWith('awtsmoos://')) return 'vessel';
  return item.kind === 'folder' ? 'folder' : '';
}

/** @param {object} item */
export function ariaForItem(item = {}) {
  const bits = [item.title || 'Desktop item', item.kind, item.path].filter(Boolean);
  return bits.join(', ');
}
