// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./CssColorResolver.js'));
  else {
    root.Merkava = root.Merkava || {};
    root.Merkava.CssValueResolver = factory(root.Merkava).CssValueResolver;
  }
})(typeof self !== 'undefined' ? self : this, function(colorMod) {
  const CssColorResolver = colorMod.CssColorResolver;
  const colorProps = new Set(['color', 'background-color', 'border-color', 'border-left-color', 'border-right-color', 'border-top-color', 'border-bottom-color', 'outline-color']);

  /**
   * Chapter 38: The river of values learns arithmetic.
   *
   * Variables, currentColor, min(), max(), clamp(), and color normalization
   * are decided here in MerkavaExecutor. The native host remains blind to CSS
   * language; it obeys already crystallized dimensions and paint tokens.
   */
  class CssValueResolver {
    constructor() { this.colors = new CssColorResolver(); }

    resolveDeclarations(style, inherited = {}) {
      const vars = { ...pickVars(inherited), ...pickVars(style) };
      const out = Object.create(null);
      for (const [key, value] of Object.entries(style || {})) {
        if (key.startsWith('--')) { out[key] = String(value); continue; }
        let resolved = this.resolveValue(String(value ?? ''), vars, 0);
        resolved = this.resolveMath(resolved);
        out[key] = colorProps.has(key) ? this.colors.normalize(resolved, out.color || inherited.color) : resolved;
      }
      return out;
    }

    resolveValue(value, vars, depth) {
      if (depth > 12) return '';
      return String(value || '').replace(/var\(([^)]+)\)/g, (_all, body) => {
        const [name, ...fallbackParts] = splitArgs(body);
        const key = String(name || '').trim();
        if (Object.prototype.hasOwnProperty.call(vars, key)) return this.resolveValue(vars[key], vars, depth + 1);
        return this.resolveValue(fallbackParts.join(',').trim(), vars, depth + 1);
      }).replace(/\b(currentColor)\b/gi, vars.currentColor || vars.color || '#000000');
    }

    resolveMath(value) {
      let out = String(value || '');
      for (let i = 0; i < 6; i++) {
        const next = out.replace(/\b(min|max|clamp)\(([^()]+)\)/g, (_all, fn, body) => mathFn(fn, body));
        if (next === out) break;
        out = next;
      }
      return out;
    }
  }

  function mathFn(fn, body) {
    const args = splitArgs(body).map(x => x.trim()).filter(Boolean);
    const parsed = args.map(parseNumericUnit);
    if (!parsed.length || parsed.some(x => !x)) return `${fn}(${body})`;
    const unit = parsed.find(x => x.unit)?.unit || parsed[0].unit || 'px';
    if (parsed.some(x => x.unit && x.unit !== unit)) return `${fn}(${body})`;
    const vals = parsed.map(x => x.value);
    const n = fn === 'min' ? Math.min(...vals) : fn === 'max' ? Math.max(...vals) : Math.max(vals[0], Math.min(vals[2] ?? vals[1], vals[1]));
    return `${round(n)}${unit}`;
  }

  function parseNumericUnit(value) {
    const m = String(value || '').trim().match(/^(-?\d+(?:\.\d+)?)(px|%|em|rem|vw|vh|vmin|vmax|ch|ex|lh|rlh)?$/);
    return m ? { value: Number.parseFloat(m[1]), unit: m[2] || '' } : null;
  }

  function pickVars(style) {
    const out = Object.create(null);
    for (const [key, value] of Object.entries(style || {})) {
      if (key.startsWith('--')) out[key] = value;
      if (key === 'color') out.color = value;
    }
    return out;
  }

  function splitArgs(value) {
    const out = []; let buf = '', depth = 0, quote = '';
    for (const ch of String(value || '')) {
      if (quote) { buf += ch; if (ch === quote) quote = ''; continue; }
      if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
      if (ch === '(') depth++;
      if (ch === ')') depth = Math.max(0, depth - 1);
      if (ch === ',' && depth === 0) { out.push(buf); buf = ''; continue; }
      buf += ch;
    }
    out.push(buf);
    return out;
  }

  function round(n) { return Number.isInteger(n) ? String(n) : String(+n.toFixed(4)); }

  return { CssValueResolver };
});
