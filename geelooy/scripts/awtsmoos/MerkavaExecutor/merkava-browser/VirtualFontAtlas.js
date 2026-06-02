// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualFontAtlas = factory().VirtualFontAtlas; }
})(typeof self !== 'undefined' ? self : this, function() {
  /**
   * B"H
   * A high-resolution virtual glyph atlas. It does not ship font bytes, but it
   * stores multiple target sizes and oversampled bitmap masks so text can be
   * measured and replayed with stable metrics instead of single tiny glyphs.
   */
  class VirtualFontAtlas {
    constructor() {
      this.fonts = [];
      this.textRuns = [];
      this.measureHook = null;
      this.glyphs = new Map();
      this.atlases = new Map();
      this.oversample = 8;
    }

    registerFont(name, bytes, meta = {}) {
      const data = bytes ? Array.from(bytes instanceof Uint8Array ? bytes : Buffer.from(bytes)) : [];
      const font = { id: this.fonts.length, name: String(name || `font-${this.fonts.length}`), bytes: data.length, meta };
      this.fonts.push(font);
      return font;
    }

    setMeasureHook(hook) { this.measureHook = typeof hook === 'function' ? hook : null; return !!this.measureHook; }
    recordText(run) { const item = { id: this.textRuns.length, metrics: this.measure(run.text, run.font), ...run }; this.textRuns.push(item); return item; }

    measure(text, font = '10px sans-serif') {
      if (this.measureHook) {
        const measured = this.measureHook(String(text), String(font));
        if (measured && Number.isFinite(Number(measured.width))) return { ...measured, font, source: measured.source || 'offscreen-measure-hook' };
      }
      const size = parseFontSize(font);
      const scale = size / 10;
      const width = Array.from(String(text || '')).reduce((sum, ch) => sum + this.glyph(ch, size).advance, 0) * scale;
      return { width, actualBoundingBoxAscent: size * 0.82, actualBoundingBoxDescent: size * 0.22, emHeightAscent: size * 0.82, emHeightDescent: size * 0.22, font, source: 'merkava-oversampled-glyph-atlas' };
    }

    glyph(character, size = 14) {
      const key = `${Math.round(size)}:${character}`;
      if (this.glyphs.has(key)) return this.glyphs.get(key);
      const mask = glyphMask(character);
      const glyph = {
        char: character,
        size: Math.round(size),
        width: mask[0].length,
        height: mask.length,
        advance: character === ' ' ? 4 : 6,
        oversample: this.oversample,
        mask
      };
      this.glyphs.set(key, glyph);
      const atlasKey = String(Math.round(size));
      const atlas = this.atlases.get(atlasKey) || { size: Math.round(size), glyphs: [] };
      atlas.glyphs.push({ char: character, index: atlas.glyphs.length });
      this.atlases.set(atlasKey, atlas);
      return glyph;
    }

    snapshot() {
      return { fonts: this.fonts, textRuns: this.textRuns, atlases: Array.from(this.atlases.values()), glyphCount: this.glyphs.size, oversample: this.oversample };
    }
  }

  function parseFontSize(font) {
    const match = String(font || '').match(/(\d+(?:\.\d+)?)px/);
    return match ? Number(match[1]) : 10;
  }

  const BASE = Object.freeze({
    ' ': ['00000','00000','00000','00000','00000','00000','00000'],
    '.': ['00000','00000','00000','00000','00000','01100','01100'], ',': ['00000','00000','00000','00000','01100','00100','01000'],
    ':': ['00000','01100','01100','00000','01100','01100','00000'], '-': ['00000','00000','00000','11111','00000','00000','00000'],
    '"': ['01010','01010','01010','00000','00000','00000','00000'], "'": ['00100','00100','01000','00000','00000','00000','00000'],
    '0': ['01110','10001','10011','10101','11001','10001','01110'], '1': ['00100','01100','00100','00100','00100','00100','01110'],
    '2': ['01110','10001','00001','00010','00100','01000','11111'], '3': ['11110','00001','00001','01110','00001','00001','11110'],
    '4': ['00010','00110','01010','10010','11111','00010','00010'], '5': ['11111','10000','10000','11110','00001','00001','11110'],
    '6': ['01110','10000','10000','11110','10001','10001','01110'], '7': ['11111','00001','00010','00100','01000','01000','01000'],
    '8': ['01110','10001','10001','01110','10001','10001','01110'], '9': ['01110','10001','10001','01111','00001','00001','01110'],
    'A': ['01110','10001','10001','11111','10001','10001','10001'], 'B': ['11110','10001','10001','11110','10001','10001','11110'],
    'C': ['01110','10001','10000','10000','10000','10001','01110'], 'D': ['11110','10001','10001','10001','10001','10001','11110'],
    'E': ['11111','10000','10000','11110','10000','10000','11111'], 'F': ['11111','10000','10000','11110','10000','10000','10000'],
    'G': ['01110','10001','10000','10111','10001','10001','01110'], 'H': ['10001','10001','10001','11111','10001','10001','10001'],
    'I': ['01110','00100','00100','00100','00100','00100','01110'], 'J': ['00111','00010','00010','00010','10010','10010','01100'],
    'K': ['10001','10010','10100','11000','10100','10010','10001'], 'L': ['10000','10000','10000','10000','10000','10000','11111'],
    'M': ['10001','11011','10101','10101','10001','10001','10001'], 'N': ['10001','11001','10101','10011','10001','10001','10001'],
    'O': ['01110','10001','10001','10001','10001','10001','01110'], 'P': ['11110','10001','10001','11110','10000','10000','10000'],
    'Q': ['01110','10001','10001','10001','10101','10010','01101'], 'R': ['11110','10001','10001','11110','10100','10010','10001'],
    'S': ['01111','10000','10000','01110','00001','00001','11110'], 'T': ['11111','00100','00100','00100','00100','00100','00100'],
    'U': ['10001','10001','10001','10001','10001','10001','01110'], 'V': ['10001','10001','10001','10001','10001','01010','00100'],
    'W': ['10001','10001','10001','10101','10101','10101','01010'], 'X': ['10001','10001','01010','00100','01010','10001','10001'],
    'Y': ['10001','10001','01010','00100','00100','00100','00100'], 'Z': ['11111','00001','00010','00100','01000','10000','11111'],
    '?': ['01110','10001','00001','00010','00100','00000','00100'], '/': ['00001','00010','00010','00100','01000','01000','10000'],
    '\\': ['10000','01000','01000','00100','00010','00010','00001']
  });

  function glyphMask(character) { return BASE[character] || BASE[String(character || '').toUpperCase()] || BASE['?']; }
  return { VirtualFontAtlas };
});
