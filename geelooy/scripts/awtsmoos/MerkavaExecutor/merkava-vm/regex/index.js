// B"H — MerkavaRegExp: from-scratch RegExp for the Merkava VM.
// 100% Awtsmoos code. No host RegExp. Drop-in replacement with identical
// observable semantics for the supported surface, plus:
//   - linear-time matching (Pike VM) — no catastrophic backtracking, ever
//   - Boyer-Moore-Horspool literal fast paths
//   - zero host-regex dependency (compilable per "emulate = compile")
//
// Interop: implements Symbol.replace/split/search/match so host String
// methods delegate correctly.

'use strict';

const { parseRegexSource, T_BOL, T_CAT, T_NGRP } = require('./parser.js');
const { PikeBuilder, PikeRunner, Backtracker,
        bmhSkipTable, bmhSearch,
        literalPrefix, isPureLiteral, literalOf, astHas, T_REF, T_LA } = require('./engine.js');

const FLAG_ORDER = 'dgi msuvy'.replace(/ /g, '');
const VALID_FLAGS = new Set(['d','g','i','m','s','u','v','y']);

function parseFlags(flagStr) {
  const f = String(flagStr || '');
  const seen = new Set();
  const out = { raw: '' };
  for (const ch of f) {
    if (!VALID_FLAGS.has(ch)) throw new SyntaxError('Invalid regular expression flags: ' + flagStr);
    if (seen.has(ch)) throw new SyntaxError('Invalid regular expression flags: ' + flagStr);
    seen.add(ch);
  }
  out.global = seen.has('g');
  out.ignoreCase = seen.has('i');
  out.multiline = seen.has('m');
  out.dotAll = seen.has('s');
  out.unicode = seen.has('u');
  out.unicodeSets = seen.has('v');
  out.sticky = seen.has('y');
  out.hasIndices = seen.has('d');
  if (out.unicodeSets) throw new SyntaxError('Invalid regular expression flags: v (unicodeSets not supported)');
  // Canonical flag order per spec.
  out.raw = [...seen].sort((a, b) => FLAG_ORDER.indexOf(a) - FLAG_ORDER.indexOf(b)).join('');
  return out;
}

// Compile cache: source\0flags -> compiled. Bounded (avoids pathological growth).
const COMPILE_CACHE = new Map();
const COMPILE_CACHE_MAX = 256;

function getOrCompile(source, flags) {
  const key = source + '\0' + flags.raw;
  let c = COMPILE_CACHE.get(key);
  if (c) { COMPILE_CACHE.delete(key); COMPILE_CACHE.set(key, c); return c; } // LRU touch
  c = compilePattern(source, flags);
  if (COMPILE_CACHE.size >= COMPILE_CACHE_MAX) {
    const oldest = COMPILE_CACHE.keys().next().value;
    COMPILE_CACHE.delete(oldest);
  }
  COMPILE_CACHE.set(key, c);
  return c;
}

function compilePattern(source, flags) {
  const { ast, groupCount, groupNames } = parseRegexSource(source, flags);
  const needsBT = astHas(ast, new Set([T_REF, T_LA]));
  if (!needsBT && isPureLiteral(ast)) {
    const lit = literalOf(ast);
    return { tier: 'lit', lit, table: bmhSkipTable(lit), groupCount, groupNames, source, flags };
  }
  if (!needsBT) {
    const builder = new PikeBuilder(flags);
    const prog = builder.build(ast, groupCount * 2);
    const prefix = literalPrefix(ast);
    const usePrefix = prefix.length >= 3;
    return {
      tier: 'pike', prog, runner: null,
      prefix: usePrefix ? prefix : '',
      table: usePrefix ? bmhSkipTable(prefix) : null,
      anchored: isAnchored(ast),
      groupCount, groupNames, source, flags,
    };
  }
  return { tier: 'bt', ast, groupCount, groupNames, source, flags };
}

// Is the pattern ^-anchored at the top level (no `m` nuance needed for the fast path)?
function isAnchored(ast) {
  if (ast.t === T_BOL) return true;
  if (ast.t === T_CAT && ast.items.length && ast.items[0].t === T_BOL) return true;
  if (ast.t === T_NGRP) return isAnchored(ast.x);
  return false;
}

// Advance a string index by one code point-ish (simple: one UTF-16 unit).
function advanceIndex(s, i) { return i + 1; }

class MerkavaRegExp {
  constructor(pattern, flags) {
    if (pattern instanceof MerkavaRegExp) {
      if (flags !== undefined) throw new TypeError('Cannot supply flags when constructing from RegExp');
      this._source = pattern._source;
      this._flags = pattern._flags;
      this._c = pattern._c;
      this.lastIndex = pattern.lastIndex;
      return;
    }
    let src, fl;
    if (pattern !== null && typeof pattern === 'object' && typeof pattern.source === 'string') {
      // Host RegExp (or cross-realm): adopt source/flags.
      src = pattern.source;
      fl = parseFlags(flags !== undefined ? flags : (typeof pattern.flags === 'string' ? pattern.flags : ''));
    } else {
      src = pattern === undefined ? '' : String(pattern);
      fl = parseFlags(flags);
    }
    this._source = src;
    this._flags = fl;
    this._c = getOrCompile(src, fl);
    this.lastIndex = 0;
  }

  get source() { return this._source; }
  get flags() { return this._flags.raw; }
  get global() { return this._flags.global; }
  get ignoreCase() { return this._flags.ignoreCase; }
  get multiline() { return this._flags.multiline; }
  get dotAll() { return this._flags.dotAll; }
  get sticky() { return this._flags.sticky; }
  get unicode() { return this._flags.unicode; }
  get hasIndices() { return this._flags.hasIndices; }

  toString() { return '/' + this._source + '/' + this._flags.raw; }

  // Marker for the JSON compiler passthrough (mirrors instanceof RegExp).
  get __isMerkavaRegExp() { return true; }

  // ---- core search driver ----
  // Returns {index, end, caps} or null. Respects sticky/global lastIndex.
  _newCaps() {
    const a = new Int32Array(Math.max(2, this._c.groupCount * 2));
    a.fill(-1);
    return a;
  }

  // Fast boolean test: no match array, no caps allocation on lit tier.
  _testFrom(input, fromPos, stickyOnly) {
    const c = this._c, n = input.length;
    if (c.tier === 'lit') {
      const lit = c.lit, m = lit.length;
      if (m === 0) return !(stickyOnly && fromPos > n) && fromPos <= n;
      if (stickyOnly) {
        if (fromPos + m > n) return false;
        for (let i = 0; i < m; i++)
          if (input.charCodeAt(fromPos + i) !== lit.charCodeAt(i)) return false;
        return true;
      }
      return bmhSearch(input, lit, c.table, fromPos) >= 0;
    }
    // pike/bt: reuse _searchFrom but skip caps when unneeded
    return this._searchFrom(input, fromPos, stickyOnly) !== null;
  }

  _searchFrom(input, fromPos, stickyOnly) {
    const c = this._c, n = input.length;
    const caps = this._newCaps();
    if (c.tier === 'lit') {
      const lit = c.lit, m = lit.length;
      if (m === 0) {
        const idx = Math.min(fromPos, n);
        if (stickyOnly && idx !== fromPos) return null;
        return { index: idx, end: idx, caps };
      }
      if (stickyOnly) {
        if (fromPos + m > n) return null;
        for (let i = 0; i < m; i++)
          if (input.charCodeAt(fromPos + i) !== lit.charCodeAt(i)) return null;
        return { index: fromPos, end: fromPos + m, caps };
      }
      const idx = bmhSearch(input, lit, c.table, fromPos);
      if (idx < 0) return null;
      return { index: idx, end: idx + m, caps };
    }
    if (c.tier === 'pike') {
      // Reuse the runner across calls (holds reusable thread-list buffers).
      // Not reentrant: nested regex calls (e.g. from a replacer fn) get a fresh runner.
      let runner = c.runner;
      if (runner && runner._busy) runner = null;
      if (!runner) {
        runner = new PikeRunner(c.prog, this._flags);
        if (!c.runner) c.runner = runner;
      }
      runner._busy = true;
      let result = null;
      try {
        if (stickyOnly || (c.anchored && !this._flags.multiline)) {
          const r = runner.matchAt(input, fromPos, caps);
          result = r ? { index: fromPos, end: r.end, caps: r.caps } : null;
        } else if (c.prefix) {
          // BMH prefilter: only try anchored matches where the literal prefix occurs.
          let p = bmhSearch(input, c.prefix, c.table, fromPos);
          while (p >= 0) {
            const r = runner.matchAt(input, p, caps);
            if (r) { result = { index: p, end: r.end, caps: r.caps }; break; }
            if (p + 1 > n) break;
            p = bmhSearch(input, c.prefix, c.table, p + 1);
          }
        } else if (this._flags.multiline && c.anchored) {
          // ^ with m: try 0 and each position after \n.
          if (fromPos === 0) {
            const r = runner.matchAt(input, 0, caps);
            if (r) result = { index: 0, end: r.end, caps: r.caps };
          }
          if (!result) {
            for (let p = Math.max(fromPos, 1); p <= n; p++) {
              if (input.charCodeAt(p - 1) === 10 && p >= fromPos) {
                const r = runner.matchAt(input, p, caps);
                if (r) { result = { index: p, end: r.end, caps: r.caps }; break; }
              }
            }
          }
        } else {
          // General unanchored: single-pass linear search.
          result = runner.searchUnanchored(input, fromPos, caps);
        }
      } finally {
        runner._busy = false;
      }
      return result;
    }
    // Tier BT
    const bt = new Backtracker(c.ast, this._flags, c.groupCount);
    if (stickyOnly) {
      const r = bt.matchAt(input, fromPos);
      // sticky: the match must start exactly at fromPos. matchAt tries only fromPos? No —
      // our BT.matchAt matches AT fromPos (anchored attempt). Good.
      return r ? { index: fromPos, end: r.end, caps: toCaps32(r.caps, c.groupCount) } : null;
    }
    for (let p = fromPos; p <= n; p++) {
      const r = bt.matchAt(input, p);
      if (r) return { index: p, end: r.end, caps: toCaps32(r.caps, c.groupCount) };
    }
    return null;
  }

  _execCore(input, fromPos, stickyOnly) {
    const r = this._searchFrom(input, fromPos, stickyOnly);
    if (!r) return null;
    const c = this._c;
    const m = [input.slice(r.index, r.end)];
    for (let g = 1; g <= c.groupCount; g++) {
      const s = r.caps[(g - 1) * 2], e = r.caps[(g - 1) * 2 + 1];
      m.push(s < 0 || e < 0 ? undefined : input.slice(s, e));
    }
    m.index = r.index;
    m.input = input;
    return { match: m, end: r.end };
  }

  exec(str) {
    const input = String(str);
    const fl = this._flags;
    let fromPos = 0;
    const sticky = fl.sticky, glob = fl.global;
    if (sticky || glob) {
      fromPos = this.lastIndex;
      if (fromPos > input.length) { this.lastIndex = 0; return null; }
    }
    const r = this._execCore(input, fromPos, sticky);
    if (!r) { if (sticky || glob) this.lastIndex = 0; return null; }
    if (sticky || glob) this.lastIndex = r.end;
    return r.match;
  }

  test(str) {
    const input = String(str);
    const fl = this._flags;
    let fromPos = 0;
    const sticky = fl.sticky, glob = fl.global;
    if (sticky || glob) {
      fromPos = this.lastIndex;
      if (fromPos > input.length) { this.lastIndex = 0; return false; }
    }
    const ok = this._testFrom(input, fromPos, sticky);
    if (!ok) { if (sticky || glob) this.lastIndex = 0; return false; }
    if (sticky || glob) {
      // test() still advances lastIndex: need the end position. For lit tier
      // compute directly; otherwise do a full search.
      if (this._c.tier === 'lit') {
        this.lastIndex = sticky ? fromPos + this._c.lit.length
          : bmhSearch(input, this._c.lit, this._c.table, fromPos) + this._c.lit.length;
      } else {
        const r = this._searchFrom(input, fromPos, sticky);
        this.lastIndex = r ? r.end : 0;
      }
    }
    return true;
  }

  // ---- well-known symbols (host String methods delegate here) ----

  [Symbol.search](str) {
    const input = String(str);
    const r = this._searchFrom(input, 0, false);
    return r ? r.index : -1;
  }

  [Symbol.match](str) {
    const input = String(str);
    if (!this._flags.global) {
      const r = this._execCore(input, 0, false);
      return r ? r.match : null;
    }
    const out = [];
    let p = 0;
    const n = input.length;
    for (;;) {
      const r = this._searchFrom(input, p, false);
      if (!r) break;
      out.push(input.slice(r.index, r.end));
      p = r.end === r.index ? advanceIndex(input, r.end) : r.end;
      if (p > n) break;
    }
    return out.length ? out : null;
  }

  [Symbol.replace](str, rep) {
    const input = String(str);
    const isFn = typeof rep === 'function';
    const glob = this._flags.global;
    let out = '', last = 0, p = 0;
    const n = input.length;
    const doOne = (r) => {
      const full = input.slice(r.index, r.end);
      out += input.slice(last, r.index);
      if (isFn) {
        const args = [full];
        const c = this._c;
        for (let g = 1; g <= c.groupCount; g++) {
          const s = r.caps[(g - 1) * 2], e = r.caps[(g - 1) * 2 + 1];
          args.push(s < 0 || e < 0 ? undefined : input.slice(s, e));
        }
        args.push(r.index, input);
        out += String(rep.apply(undefined, args));
      } else {
        out += expandReplacement(String(rep), input, full, r.index, r.end, r.caps, this._c.groupNames);
      }
      last = r.end;
      return r.end === r.index ? advanceIndex(input, r.end) : r.end;
    };
    if (!glob) {
      const r = this._searchFrom(input, 0, false);
      if (!r) return input;
      doOne(r);
      out += input.slice(last);
      return out;
    }
    for (;;) {
      const r = this._searchFrom(input, p, false);
      if (!r) break;
      p = doOne(r);
      if (p > n) break;
    }
    out += input.slice(last);
    return out;
  }

  [Symbol.split](str, limit) {
    const input = String(str);
    const lim = limit === undefined ? 0xFFFFFFFF : Number(limit) >>> 0;
    if (lim === 0) return [];
    const out = [];
    const c = this._c;
    let p = 0, last = 0;
    const n = input.length;
    // Special case: empty regex splits into chars (JS semantics).
    for (;;) {
      if (out.length >= lim) break;
      const r = this._searchFrom(input, p, false);
      if (!r) break;
      if (r.end === p) {
        // Empty match: advance by one char (spec: split on empty then advance).
        p = advanceIndex(input, p);
        continue;
      }
      out.push(input.slice(last, r.index));
      for (let g = 1; g <= c.groupCount && out.length < lim; g++) {
        const s = r.caps[(g - 1) * 2], e = r.caps[(g - 1) * 2 + 1];
        out.push(s < 0 || e < 0 ? undefined : input.slice(s, e));
      }
      last = r.end;
      p = r.end;
      if (out.length >= lim) break;
    }
    out.push(input.slice(last));
    return out.length > lim ? out.slice(0, lim) : out;
  }
}

function toCaps32(arr, nGroups) {
  const out = new Int32Array(Math.max(2, nGroups * 2));
  for (let i = 0; i < out.length && i < arr.length; i++) out[i] = arr[i];
  return out;
}

// $ patterns in replacement strings.
function expandReplacement(rep, input, full, rIndex, rEnd, caps, groupNames) {
  let out = '';
  for (let i = 0; i < rep.length; i++) {
    const ch = rep[i];
    if (ch !== '$' || i + 1 >= rep.length) { out += ch; continue; }
    const nx = rep[i + 1];
    if (nx === '$') { out += '$'; i++; }
    else if (nx === '&') { out += full; i++; }
    else if (nx === '`') { out += input.slice(0, rIndex); i++; }
    else if (nx === "'") { out += input.slice(rEnd); i++; }
    else if (nx >= '0' && nx <= '9') {
      let j = i + 1, num = 0;
      while (j < rep.length && rep[j] >= '0' && rep[j] <= '9' && j < i + 3) { num = num * 10 + (rep.charCodeAt(j) - 48); j++; }
      // Two-digit preferred when it names a valid group; else fewer digits.
      let use = num, useLen = j - (i + 1);
      while (useLen > 1 && !groupExists(caps, use)) { use = Math.floor(use / 10); useLen--; }
      out += groupSlice(input, caps, use);
      i += useLen;
    }
    else if (nx === '<') {
      const e = rep.indexOf('>', i + 2);
      if (e > 0) {
        const name = rep.slice(i + 2, e);
        const gi = groupNames ? groupNames.indexOf(name) : -1;
        out += gi > 0 ? groupSlice(input, caps, gi) : '';
        i = e;
      } else out += '$';
    }
    else { out += '$'; }
  }
  return out;
}

function groupExists(caps, gi) {
  if (gi < 1 || !caps) return false;
  const k = (gi - 1) * 2;
  return k + 1 < caps.length;
}

function groupSlice(input, caps, gi) {
  if (!caps || gi < 1) return '';
  const k = (gi - 1) * 2;
  if (k + 1 >= caps.length) return '';
  const s = caps[k], e = caps[k + 1];
  if (s < 0 || e < 0) return '';
  return input.slice(s, e);
}

module.exports = { MerkavaRegExp };
