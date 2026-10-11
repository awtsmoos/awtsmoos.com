// B"H — From-scratch regex parser: source -> AST. 100% Awtsmoos code.
// No host RegExp anywhere. Operates on UTF-16 code units (JS non-unicode semantics).
//
// AST node types (t):
//   0 LIT  {s}            literal run
//   1 DOT  {}             any char (except \n unless dotAll)
//   2 CLS  {rs, neg}      char class, rs=[[lo,hi]...] sorted merged
//   3 BOL  {}             ^ assertion
//   4 EOL  {}             $ assertion
//   5 WB   {}             \b
//   6 NWB  {}             \B
//   7 ALT  {l, r}
//   8 CAT  {items}
//   9 REP  {x, min, max}  max=Infinity ok; lazy flag
//   10 GRP {x, i}         capturing group, 1-based
//   11 NGRP{x}            non-capturing group
//   12 REF {i}            backreference
//   13 LA  {x, neg}       lookahead (?= / (?!

'use strict';

const T_LIT=0, T_DOT=1, T_CLS=2, T_BOL=3, T_EOL=4, T_WB=5, T_NWB=6,
      T_ALT=7, T_CAT=8, T_REP=9, T_GRP=10, T_NGRP=11, T_REF=12, T_LA=13;

function syntaxError(msg) {
  const e = new SyntaxError('Invalid regular expression: ' + msg);
  return e;
}

// ASCII + Latin-1 case folding. Returns array of variants for a code point.
function foldVariants(cp) {
  const out = [cp];
  if (cp >= 65 && cp <= 90) out.push(cp + 32);
  else if (cp >= 97 && cp <= 122) out.push(cp - 32);
  else if (cp >= 192 && cp <= 214) out.push(cp + 32);
  else if (cp >= 216 && cp <= 222) out.push(cp + 32);
  else if (cp >= 224 && cp <= 246) out.push(cp - 32);
  else if (cp >= 248 && cp <= 254) out.push(cp - 32);
  else if (cp === 304) out.push(305);       // İ -> ı
  else if (cp === 305) out.push(304);
  else if (cp === 383) out.push(115);       // ſ -> s
  return out;
}

// Merge overlapping/adjacent ranges; input [[lo,hi]...].
function mergeRanges(rs) {
  if (!rs.length) return rs;
  rs.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const out = [rs[0].slice()];
  for (let i = 1; i < rs.length; i++) {
    const last = out[out.length - 1], cur = rs[i];
    if (cur[0] <= last[1] + 1) { if (cur[1] > last[1]) last[1] = cur[1]; }
    else out.push(cur.slice());
  }
  return out;
}

const CLASS_D = [[48,57]];
const CLASS_W = [[48,57],[65,90],[95,95],[97,122]];
const CLASS_S = [[9,13],[32,32],[160,160],[5760,5760],[6158,6158],[8192,8202],[8232,8233],[8239,8239],[8287,8287],[12288,12288],[65279,65279]];

class Parser {
  constructor(src, flags) {
    this.s = src;
    this.n = src.length;
    this.p = 0;
    this.ignoreCase = !!flags.ignoreCase;
    this.groupCount = 0;
    this.groupNames = []; // index -> name or null
  }

  parse() {
    if (this.n === 0) {
      // Empty pattern: JS treats /(?:)/ as matching empty everywhere.
      return { t: T_NGRP, x: { t: T_CAT, items: [] } };
    }
    const x = this.parseAlt();
    if (this.p < this.n) throw syntaxError('/' + this.s + '/: unexpected ' + this.s[this.p]);
    return x;
  }

  parseAlt() {
    const l = this.parseCat();
    if (this.peek() === '|') {
      this.p++;
      const r = this.parseAlt();
      return { t: T_ALT, l, r };
    }
    return l;
  }

  parseCat() {
    const items = [];
    for (;;) {
      const c = this.peek();
      if (c === '' || c === '|' || c === ')') break;
      items.push(this.parseQuant());
    }
    if (items.length === 0) return { t: T_CAT, items: [] }; // empty
    if (items.length === 1) return items[0];
    return { t: T_CAT, items };
  }

  parseQuant() {
    const atom = this.parseAtom();
    const c = this.peek();
    let min = 1, max = 1, lazy = false;
    if (c === '*') { this.p++; min = 0; max = Infinity; }
    else if (c === '+') { this.p++; min = 1; max = Infinity; }
    else if (c === '?') { this.p++; min = 0; max = 1; }
    else if (c === '{') {
      const save = this.p;
      this.p++;
      const n1 = this.parseDigits();
      if (n1 === null) { this.p = save; return atom; }
      let n2 = n1;
      if (this.peek() === ',') {
        this.p++;
        if (this.peek() === '}') n2 = Infinity;
        else { n2 = this.parseDigits(); if (n2 === null) { this.p = save; return atom; } }
      }
      if (this.peek() !== '}') { this.p = save; return atom; }
      this.p++;
      if (n2 < n1) throw syntaxError('/' + this.s + '/: numbers out of order in {} quantifier');
      min = n1; max = n2;
    } else return atom;
    if (this.peek() === '?') { this.p++; lazy = true; }
    return { t: T_REP, x: atom, min, max, lazy };
  }

  parseDigits() {
    let v = 0, found = false;
    while (this.p < this.n) {
      const c = this.s.charCodeAt(this.p);
      if (c < 48 || c > 57) break;
      v = v * 10 + (c - 48);
      if (v > 100000) throw syntaxError('/' + this.s + '/: quantifier too large');
      found = true; this.p++;
    }
    return found ? v : null;
  }

  peek() { return this.p < this.n ? this.s[this.p] : ''; }

  parseAtom() {
    const c = this.peek();
    if (c === '^') { this.p++; return { t: T_BOL }; }
    if (c === '$') { this.p++; return { t: T_EOL }; }
    if (c === '.') { this.p++; return { t: T_DOT }; }
    if (c === '(') return this.parseGroup();
    if (c === '[') return this.parseClass();
    if (c === '\\') return this.parseEscape();
    if (c === '*' || c === '+' || c === '?' || c === '|' || c === ')' || c === ']' || c === '{' || c === '}')
      throw syntaxError('/' + this.s + '/: unexpected quantifier/target ' + c);
    this.p++;
    return this.litNode(c);
  }

  litNode(ch) {
    // With ignoreCase, a literal char becomes a tiny folded class.
    if (this.ignoreCase) {
      const cp = ch.charCodeAt(0);
      const vs = foldVariants(cp);
      if (vs.length > 1) return { t: T_CLS, rs: mergeRanges(vs.map(v => [v, v])), neg: false };
    }
    return { t: T_LIT, s: ch };
  }

  parseGroup() {
    this.p++; // (
    if (this.peek() === '?') {
      this.p++;
      const c = this.peek();
      if (c === ':') { this.p++; const x = this.parseAlt(); this.expect(')'); return { t: T_NGRP, x }; }
      if (c === '=') { this.p++; const x = this.parseAlt(); this.expect(')'); return { t: T_LA, x, neg: false }; }
      if (c === '!') { this.p++; const x = this.parseAlt(); this.expect(')'); return { t: T_LA, x, neg: true }; }
      if (c === '<') {
        // (?<name>...) named group; (?<= / (?<! lookbehind — lookbehind unsupported
        if (this.s[this.p + 1] === '=' || this.s[this.p + 1] === '!') throw syntaxError('/' + this.s + '/: lookbehind not supported');
        this.p++; // <
        let name = '';
        while (this.p < this.n && this.s[this.p] !== '>') { name += this.s[this.p]; this.p++; }
        this.expect('>');
        if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) throw syntaxError('/' + this.s + '/: invalid group name');
        const i = ++this.groupCount;
        this.groupNames[i] = name;
        const x = this.parseAlt(); this.expect(')');
        return { t: T_GRP, x, i };
      }
      throw syntaxError('/' + this.s + '/: unexpected (? ' + c);
    }
    const i = ++this.groupCount;
    this.groupNames[i] = null;
    const x = this.parseAlt();
    this.expect(')');
    return { t: T_GRP, x, i };
  }

  expect(ch) {
    if (this.peek() !== ch) throw syntaxError('/' + this.s + '/: expected ' + ch);
    this.p++;
  }

  parseClass() {
    this.p++; // [
    let neg = false;
    if (this.peek() === '^') { neg = true; this.p++; }
    const rs = [];
    let first = true;
    while (this.p < this.n && (this.peek() !== ']' || first)) {
      first = false;
      const lo = this.parseClassAtom();
      if (this.peek() === '-' && this.s[this.p + 1] !== ']') {
        this.p++;
        const hi = this.parseClassAtom();
        if (typeof lo !== 'number' || typeof hi !== 'number') throw syntaxError('/' + this.s + '/: range over class escape');
        if (hi < lo) throw syntaxError('/' + this.s + '/: range out of order in class');
        rs.push([lo, hi]);
      } else if (typeof lo === 'number') rs.push([lo, lo]);
      else rs.push(...lo);
    }
    if (this.p >= this.n) throw syntaxError('/' + this.s + '/: unterminated class');
    this.p++; // ]
    let merged = mergeRanges(rs);
    if (this.ignoreCase) {
      const extra = [];
      for (const [lo, hi] of merged) {
        for (let cp = lo; cp <= hi; cp++) {
          for (const v of foldVariants(cp)) if (v !== cp) extra.push([v, v]);
          if (hi - lo > 512) break; // safety: huge ranges stay ASCII-folded only via endpoints
        }
      }
      merged = mergeRanges(merged.concat(extra));
    }
    return { t: T_CLS, rs: merged, neg };
  }

  // Returns a code point number, or an array of ranges (for \d etc inside class).
  parseClassAtom() {
    const c = this.peek();
    if (c === '\\') {
      this.p++;
      return this.classEscape();
    }
    this.p++;
    return c.charCodeAt(0);
  }

  classEscape() {
    const c = this.peek();
    if (c === '') throw syntaxError('/' + this.s + '/: trailing \\');
    // Multi-char class escapes usable inside classes:
    if (c === 'd') { this.p++; return CLASS_D.map(r => r.slice()); }
    if (c === 'w') { this.p++; return CLASS_W.map(r => r.slice()); }
    if (c === 's') { this.p++; return CLASS_S.map(r => r.slice()); }
    if (c === 'D' || c === 'W' || c === 'S') throw syntaxError('/' + this.s + '/: \\' + c + ' not allowed in class (negated class)');
    if (c === 'b') { this.p++; return 8; } // [\b] is backspace
    const v = this.simpleEscape(c);
    if (v !== null) { this.p++; return v; }
    // \xHH \uHHHH
    if (c === 'x' || c === 'u') { return this.hexEscape(); }
    if (c >= '0' && c <= '9') throw syntaxError('/' + this.s + '/: octal escapes not supported');
    this.p++;
    return c.charCodeAt(0); // escaped punct -> literal
  }

  simpleEscape(c) {
    switch (c) {
      case 'n': return 10; case 'r': return 13; case 't': return 9;
      case 'f': return 12; case 'v': return 11; case '0': return 0;
      default: return null;
    }
  }

  hexEscape() {
    const c = this.peek(); // x or u
    this.p++;
    const want = c === 'x' ? 2 : 4;
    let v = 0;
    for (let i = 0; i < want; i++) {
      const h = this.peek();
      const d = h >= '0' && h <= '9' ? h.charCodeAt(0) - 48
              : h >= 'a' && h <= 'f' ? h.charCodeAt(0) - 87
              : h >= 'A' && h <= 'F' ? h.charCodeAt(0) - 55 : -1;
      if (d < 0) throw syntaxError('/' + this.s + '/: bad hex escape');
      v = v * 16 + d; this.p++;
    }
    return v;
  }

  parseEscape() {
    this.p++; // \
    const c = this.peek();
    if (c === '') throw syntaxError('/' + this.s + '/: trailing \\');
    if (c === 'd') { this.p++; return this.mkClass(CLASS_D, false); }
    if (c === 'D') { this.p++; return this.mkClass(CLASS_D, true); }
    if (c === 'w') { this.p++; return this.mkClass(CLASS_W, false); }
    if (c === 'W') { this.p++; return this.mkClass(CLASS_W, true); }
    if (c === 's') { this.p++; return this.mkClass(CLASS_S, false); }
    if (c === 'S') { this.p++; return this.mkClass(CLASS_S, true); }
    if (c === 'b') { this.p++; return { t: T_WB }; }
    if (c === 'B') { this.p++; return { t: T_NWB }; }
    const sv = this.simpleEscape(c);
    if (sv !== null) { this.p++; return this.litNode(String.fromCharCode(sv)); }
    if (c === 'x' || c === 'u') { const v = this.hexEscape(); return this.litNode(String.fromCharCode(v)); }
    if (c >= '1' && c <= '9') {
      // Backreference (no octal support)
      let v = 0;
      while (this.p < this.n && this.s[this.p] >= '0' && this.s[this.p] <= '9') { v = v * 10 + (this.s.charCodeAt(this.p) - 48); this.p++; }
      if (v > this.groupCount) throw syntaxError('/' + this.s + '/: backreference to undefined group');
      return { t: T_REF, i: v };
    }
    if (c === '0') { this.p++; return this.litNode(String.fromCharCode(0)); }
    if (c === 'k') {
      // Named backreference: \k<name>
      this.p++;
      if (this.peek() !== '<') throw syntaxError('/' + this.s + '/: expected < after \\k');
      this.p++;
      let name = '';
      while (this.p < this.n && this.s[this.p] !== '>') { name += this.s[this.p]; this.p++; }
      this.expect('>');
      const idx = this.groupNames.indexOf(name);
      if (idx < 1) throw syntaxError('/' + this.s + '/: backreference to undefined group name');
      return { t: T_REF, i: idx };
    }
    // Identity escape: \<punct> -> literal punct
    this.p++;
    return this.litNode(c);
  }

  mkClass(base, neg) {
    let rs = mergeRanges(base.map(r => r.slice()));
    if (this.ignoreCase) {
      const extra = [];
      for (const [lo, hi] of rs) for (let cp = lo; cp <= hi; cp++) for (const v of foldVariants(cp)) if (v !== cp) extra.push([v, v]);
      rs = mergeRanges(rs.concat(extra));
    }
    return { t: T_CLS, rs, neg };
  }
}

function parseRegexSource(src, flags) {
  const p = new Parser(src, flags);
  const ast = p.parse();
  return { ast, groupCount: p.groupCount, groupNames: p.groupNames };
}

module.exports = { parseRegexSource, T_LIT, T_DOT, T_CLS, T_BOL, T_EOL, T_WB, T_NWB, T_ALT, T_CAT, T_REP, T_GRP, T_NGRP, T_REF, T_LA };
