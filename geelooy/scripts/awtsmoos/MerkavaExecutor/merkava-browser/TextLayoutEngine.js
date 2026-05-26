// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./RuntimeLog.js'));
  else { root.Merkava = root.Merkava || {}; root.Merkava.TextLayoutEngine = factory(root.Merkava).TextLayoutEngine; }
})(typeof self !== 'undefined' ? self : this, function(logMod) {
  const RuntimeLog = logMod.RuntimeLog;
  class TextLayoutEngine {
    constructor(options = {}) { this.log = options.log || new RuntimeLog('text'); this.fonts = options.fonts || ['Segoe UI','Arial','Noto Sans Hebrew','Noto Sans Symbols']; this.atlas = new Map(); }
    resolveFont(family, text = '') { const wanted = String(family || '').split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean); const chain = wanted.concat(this.fonts); const resolved = chain.find(font => canRender(font, text)) || this.fonts[this.fonts.length - 1]; this.log.push('text', 'font resolved', { font: JSON.stringify(resolved) }); for (const ch of text) { const font = chain.find(f => canRender(f, ch)) || resolved; if (font !== resolved) this.log.push('text', 'fallback', { glyph: ch, to: font }); } return resolved; }
    shape(text, style = {}, maxWidth = 400) { const font = this.resolveFont(style['font-family'], text); const size = Number(String(style['font-size'] || '16').replace(/px$/, '')) || 16; const clusters = Array.from(String(text || '')); const charW = size * 0.55; const lines = []; let line = '', width = 0; for (const ch of clusters) { const w = charW * (ch.charCodeAt(0) > 127 ? 1.05 : 1); if (width + w > maxWidth && line) { lines.push({ text: line, width }); this.log.push('text', 'linebreak', { width: Math.round(width) }); line = ''; width = 0; } line += ch; width += w; this.glyph(font, ch, size); } if (line || !lines.length) lines.push({ text: line, width }); this.log.push('text', 'shaped', { clusters: clusters.length, lines: lines.length }); return { font, size, clusters: clusters.length, lines, width: Math.max(...lines.map(l => l.width), 0), height: lines.length * Math.ceil(size * 1.25) }; }
    glyph(font, ch, size) { const key = `${font}:${size}:${ch}`; if (!this.atlas.has(key)) { this.atlas.set(key, { font, ch, size, advance: size * 0.55 }); if (this.atlas.size % 16 === 1) this.log.push('text', 'atlas upload', { glyphs: this.atlas.size }); } return this.atlas.get(key); }
    layoutRuns(text, style, width) { const shaped = this.shape(text, style, width); return shaped.lines.map((line, i) => ({ text: line.text, x: 0, y: i * Math.ceil(shaped.size * 1.25), width: line.width, height: Math.ceil(shaped.size * 1.25), font: shaped.font })); }
  }
  function canRender(font, text) { if (!text) return true; if (/Hebrew/i.test(font)) return /[\u0590-\u05ff]/.test(text); if (/Symbols/i.test(font)) return /[^\u0000-\u00ff\u0590-\u05ff]/.test(text); return !/[\u0590-\u05ff]/.test(text); }
  return { TextLayoutEngine };
});
