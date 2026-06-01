// B"H

/**
 * Resolves the visible garment of a chamber from its living text.
 *
 * Chapter 10: The Awtsmoos, Who has no body or form, let four chambers receive
 * four readable masks. Gevurah became iron judgment, Tiferes became a balanced
 * prism, Chesed became a flooded sanctuary, and Binah became the womb of ruins.
 * This function never touches collision; it only tells the painter which hard
 * shapes must testify on the canvas.
 *
 * @param {object} world Active game world.
 * @returns {string} Stable visual theme key.
 */
export function themeOf(world) {
  const text = `${world?.level?.name || ''} ${world?.level?.law || ''}`.toLowerCase();
  if (/gevurah|force|court|razor|knife|teeth|fortress/.test(text)) return 'gevurahFortress';
  if (/tiferes|balance|prism|beauty|harmony/.test(text)) return 'tiferesPrism';
  if (/chesed|flood|sanctuary|grove|orchard|garden/.test(text)) return 'chesedSanctuary';
  if (/binah|womb|understanding|ruin|cavern|cave|hidden/.test(text)) return 'binahWomb';
  if (/chochmah|void|flash|ayin|gate/.test(text)) return 'void';
  return 'plains';
}

/**
 * Palette scrolls for hard-edged pixel worlds.
 *
 * @param {string} theme Theme key from {@link themeOf}.
 * @returns {object} Colors for background layers and collision vessels.
 */
export function themeSkin(theme) { return SKINS[theme] || SKINS.plains; }

export const SKINS = Object.freeze({
  plains: {
    sky: '#08102a', far: '#111b3f', mid: '#17244e', fore: '#20315b',
    top: '#5e9b42', body: '#513524', bottom: '#23180f', trim: '#ffe28a', fake: '#7a5870'
  },
  gevurahFortress: {
    sky: '#25050c', far: '#080608', mid: '#16080a', fore: '#260c11',
    top: '#5a2a35', body: '#241319', bottom: '#080507', trim: '#9b2028', fake: '#5f3535'
  },
  tiferesPrism: {
    sky: '#120936', far: '#24105f', mid: '#35218a', fore: '#170d37',
    top: '#b88cff', body: '#352060', bottom: '#0c071b', trim: '#ffe0a6', fake: '#6f5aa1'
  },
  chesedSanctuary: {
    sky: '#8bd69b', far: '#3d8a52', mid: '#23633b', fore: '#173d25',
    top: '#79bd59', body: '#5a3b24', bottom: '#20140d', trim: '#d4f080', fake: '#7fb8ac'
  },
  binahWomb: {
    sky: '#06071b', far: '#11103d', mid: '#27195f', fore: '#120d2b',
    top: '#8b62d6', body: '#261b4c', bottom: '#08061a', trim: '#cfa6ff', fake: '#5a4a79'
  },
  void: {
    sky: '#04030d', far: '#13062b', mid: '#24095a', fore: '#10041f',
    top: '#6224b8', body: '#170b35', bottom: '#06020e', trim: '#bd6aff', fake: '#4c3570'
  }
});
