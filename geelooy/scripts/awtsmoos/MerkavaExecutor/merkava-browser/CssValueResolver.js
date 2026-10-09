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
   *
   * Chapter 39: var() learns to nest. Substitution uses a balanced-paren
   * scanner instead of a flat regex, so var(--a, var(--b, #fff)) and deeply
   * chained custom properties resolve per CSS Custom Properties L1.
   * Cyclic references resolve to the empty string (invalid at computed-value
   * time). Custom property names stay case-sensitive.
   */
  class CssValueResolver {
    constructor() { this.colors = new CssColorResolver(); }

    resolveDeclarations(style, inherited = {}) {
      const vars = { ...pickVars(inherited), ...pickVars(style) };
      const out = Object.create(null);
      for (const [key, value] of Object.entries(style || {})) {
        if (key.startsWith('--')) { out[key] = String(value); continue; }
        let resolved = this.resolveValue(String(value ?? ''), vars, 0, new Set());
        if (resolved === INVALID) resolved = '';
        resolved = this.resolveMath(resolved);
        out[key] = colorProps.has(key) ? this.colors.normalize(resolved, out.color || inherited.color) : resolved;
      }
      return out;
    }

    resolveValue(value, vars, depth, seen) {
      if (depth > 64) return INVALID;
      const chain = seen || new Set();
      const text = String(value || '');
      let out = '', at = 0;
      while (at < text.length) {
        const found = findVarFunction(text, at);
        if (found < 0) { out += text.slice(at); break; }
        out += text.slice(at, found);
        const open = found + 3; // index of '(' after 'var'
        const close = balancedParenEnd(text, open);
        if (close < 0) { out += text.slice(found); break; }
        const body = text.slice(open + 1, close);
        const [name, ...fallbackParts] = splitArgs(body);
        const key = String(name || '').trim();
        const hasFallback = fallbackParts.length > 0;
        const fallback = fallbackParts.join(',').trim();
        let replacement = INVALID;
        if (key.startsWith('--') && Object.prototype.hasOwnProperty.call(vars, key) && !chain.has(key)) {
          const next = new Set(chain);
          next.add(key);
          replacement = this.resolveValue(String(vars[key]), vars, depth + 1, next);
        }
        if (replacement === INVALID && hasFallback) {
          replacement = this.resolveValue(fallback, vars, depth + 1, chain);
        }
        if (replacement === INVALID) return INVALID;
        out += replacement;
        at = close + 1;
      }
      return out.replace(/\b(currentColor)\b/gi, vars.currentColor || vars.color || '#000000');
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

  /** Marker for values invalid at computed-value time (cycles, missing refs). */
  const INVALID = Symbol('merkava-css-invalid');

  /** Finds the index of a case-insensitive `var(` outside strings, or -1. */
  function findVarFunction(text, from) {
    let quote = '';
    for (let at = from; at + 3 < text.length; at++) {
      const ch = text[at];
      if (quote) { if (ch === quote) quote = ''; continue; }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if ((ch === 'v' || ch === 'V') && text.slice(at, at + 4).toLowerCase() === 'var(') return at;
    }
    return -1;
  }

  /** Returns the index of the ')' balancing the '(' at openAt, or -1. */
  function balancedParenEnd(text, openAt) {
    let depth = 0, quote = '';
    for (let at = openAt; at < text.length; at++) {
      const ch = text[at];
      if (quote) { if (ch === quote) quote = ''; continue; }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) return at;
      }
    }
    return -1;
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
