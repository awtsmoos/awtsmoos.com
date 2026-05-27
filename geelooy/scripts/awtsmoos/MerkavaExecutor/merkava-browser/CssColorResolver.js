// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.Merkava = root.Merkava || {}; root.Merkava.CssColorResolver = factory().CssColorResolver; }
})(typeof self !== 'undefined' ? self : this, function() {
  const names = { black:'#000000', silver:'#c0c0c0', gray:'#808080', grey:'#808080', white:'#ffffff', maroon:'#800000', red:'#ff0000', purple:'#800080', fuchsia:'#ff00ff', green:'#008000', lime:'#00ff00', olive:'#808000', yellow:'#ffff00', navy:'#000080', blue:'#0000ff', teal:'#008080', aqua:'#00ffff', orange:'#ffa500', pink:'#ffc0cb', brown:'#a52a2a', transparent:'rgba(0,0,0,0)' };

  /**
   * Chapter 37: Color becomes a vessel of measured fire.
   *
   * MerkavaExecutor resolves named, hex, rgb, rgba, hsl, hsla, transparent,
   * and currentColor before native rendering. C receives only stable paint
   * values and never learns the grammar of CSS color speech.
   */
  class CssColorResolver {
    normalize(value, current = '#000000') {
      const text = String(value || '').trim().toLowerCase();
      if (!text) return '';
      if (text === 'currentcolor') return this.normalize(current);
      if (names[text]) return names[text];
      if (/^#[0-9a-f]{8}$/i.test(text)) return rgbaFromHex8(text);
      if (/^#[0-9a-f]{6}$/i.test(text)) return text;
      if (/^#[0-9a-f]{4}$/i.test(text)) return rgbaFromHex8('#' + text.slice(1).split('').map(x => x + x).join(''));
      if (/^#[0-9a-f]{3}$/i.test(text)) return '#' + text.slice(1).split('').map(x => x + x).join('');
      const rgb = text.match(/^rgba?\(([^)]+)\)$/);
      if (rgb) return rgbColor(rgb[1]);
      const hsl = text.match(/^hsla?\(([^)]+)\)$/);
      if (hsl) return hslColor(hsl[1]);
      return value;
    }
  }

  function rgbColor(body) {
    const parts = body.split(/[,/\s]+/).filter(Boolean);
    const r = channel(parts[0]), g = channel(parts[1]), b = channel(parts[2]);
    const a = parts[3] == null ? 1 : alpha(parts[3]);
    return a >= 1 ? hex(r, g, b) : `rgba(${r},${g},${b},${a})`;
  }

  function hslColor(body) {
    const parts = body.split(/[,/\s]+/).filter(Boolean);
    let h = ((Number.parseFloat(parts[0]) || 0) % 360 + 360) % 360;
    const s = pct(parts[1]), l = pct(parts[2]), a = parts[3] == null ? 1 : alpha(parts[3]);
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) [r,g,b] = [c,x,0]; else if (h < 120) [r,g,b] = [x,c,0]; else if (h < 180) [r,g,b] = [0,c,x];
    else if (h < 240) [r,g,b] = [0,x,c]; else if (h < 300) [r,g,b] = [x,0,c]; else [r,g,b] = [c,0,x];
    r = Math.round((r + m) * 255); g = Math.round((g + m) * 255); b = Math.round((b + m) * 255);
    return a >= 1 ? hex(r, g, b) : `rgba(${r},${g},${b},${a})`;
  }

  function rgbaFromHex8(text) {
    const r = parseInt(text.slice(1, 3), 16), g = parseInt(text.slice(3, 5), 16), b = parseInt(text.slice(5, 7), 16), a = +(parseInt(text.slice(7, 9), 16) / 255).toFixed(3);
    return a >= 1 ? hex(r, g, b) : `rgba(${r},${g},${b},${a})`;
  }
  function channel(v) { return clamp(String(v).endsWith('%') ? Number.parseFloat(v) * 2.55 : Number.parseFloat(v)); }
  function pct(v) { return Math.max(0, Math.min(1, Number.parseFloat(v) / 100)); }
  function alpha(v) { return Math.max(0, Math.min(1, String(v).endsWith('%') ? Number.parseFloat(v) / 100 : Number.parseFloat(v))); }
  function clamp(n) { return Math.max(0, Math.min(255, Math.round(Number.isFinite(n) ? n : 0))); }
  function hex(r,g,b) { return '#' + [r,g,b].map(v => clamp(v).toString(16).padStart(2, '0')).join(''); }

  return { CssColorResolver };
});
