// B"H

/**
 * Resolves the visible mask of a chamber.
 *
 * Chapter 1: The Awtsmoos, without body or form, lets a name become a place.
 * Gevurah becomes iron. Tiferes becomes sky. Chesed becomes forest. Binah
 * becomes crystal. Chochmah becomes void. This helper never changes collision;
 * it only names the garment worn by the canvas.
 *
 * @param {object} world Active game world.
 * @returns {string} Stable visual theme key.
 */
export function themeOf(world) {
  const text = `${world?.level?.name || ''} ${world?.level?.law || ''}`.toLowerCase();
  if (/gevurah|force|court|razor|knife|teeth/.test(text)) return 'fortress';
  if (/tiferes|sky|crown|heights/.test(text)) return 'sky';
  if (/chesed|forest|grove|flood|orchard|garden/.test(text)) return 'forest';
  if (/binah|crystal|cavern|womb|mine|cave/.test(text)) return 'crystal';
  if (/chochmah|void|flash|ayin|gate/.test(text)) return 'void';
  return 'plains';
}

/**
 * Palette scrolls for hard-edged pixel worlds.
 *
 * @param {string} theme Theme key from {@link themeOf}.
 * @returns {object} Colors for sky, distant, mid, fore, top, body, bottom.
 */
export function themeSkin(theme) {
  return SKINS[theme] || SKINS.plains;
}

export const SKINS = Object.freeze({
  plains: { sky: '#08102a', far: '#111b3f', mid: '#17244e', fore: '#20315b', top: '#5e9b42', body: '#513524', bottom: '#23180f', trim: '#ffe28a' },
  fortress: { sky: '#2a0710', far: '#090608', mid: '#16080a', fore: '#260c11', top: '#4d2734', body: '#201218', bottom: '#090609', trim: '#8f1c22' },
  sky: { sky: '#f0a09b', far: '#c77e93', mid: '#815579', fore: '#48344f', top: '#8b6a91', body: '#4b344f', bottom: '#251b2a', trim: '#ffd6b0' },
  forest: { sky: '#7bc68a', far: '#2f7142', mid: '#1f4f2f', fore: '#16351f', top: '#4b8f3b', body: '#4a2f21', bottom: '#1f140d', trim: '#a2e36e' },
  crystal: { sky: '#070b24', far: '#10154a', mid: '#20156a', fore: '#0e0c2b', top: '#7742c8', body: '#241b4f', bottom: '#0a0820', trim: '#d98cff' },
  void: { sky: '#04030d', far: '#13062b', mid: '#24095a', fore: '#10041f', top: '#6224b8', body: '#170b35', bottom: '#06020e', trim: '#bd6aff' }
});
