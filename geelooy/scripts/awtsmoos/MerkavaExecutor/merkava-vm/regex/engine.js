// B"H — Tiered regex matching engine. 100% Awtsmoos code, no host RegExp.
// Tiers:
//   LIT  — pure literal pattern: Boyer-Moore-Horspool (or direct compare)
//   PIKE — Thompson NFA via Pike VM: linear-time, immune to catastrophic
//          backtracking. Literal-prefix BMH filter when profitable.
//   BT   — guarded backtracker for backrefs/lookaround, with step budget.
//
// All matching operates on UTF-16 code units. Case folding is baked into the
// AST at parse time (parser.js), so the matcher is case-blind.

'use strict';

const { T_LIT, T_DOT, T_CLS, T_BOL, T_EOL, T_WB, T_NWB,
        T_ALT, T_CAT, T_REP, T_GRP, T_NGRP, T_REF, T_LA } = require('./parser.js');

// Pike instruction ops. Operands packed as [op, a, b].
const OP_CHAR=0, OP_CLS=1, OP_ANY=2, OP_MATCH=3, OP_JMP=4, OP_SPLIT=5,
      OP_SAVE=6, OP_BOL=7, OP_EOL=8, OP_WB=9, OP_NWB=10;

// ---------------- analysis ----------------

function astHas(node, types) {
  if (!node) return false;
  if (types.has(node.t)) return true;
  switch (node.t) {
    case T_ALT: return astHas(node.l, types) || astHas(node.r, types);
    case T_CAT: return node.items.some(x => astHas(x, types));
    case T_REP: return astHas(node.x, types);
    case T_GRP: case T_NGRP: case T_LA: return astHas(node.x, types);
    default: return false;
  }
}

// Longest literal prefix (for BMH prefilter). Zero-width assertions skipped.
function literalPrefix(node) {
  switch (node.t) {
    case T_LIT: return node.s;
    case T_CAT: {
      let out = '';
      for (const x of node.items) {
        if (x.t === T_LIT) { out += x.s; continue; }
        if (x.t === T_BOL || x.t === T_WB || x.t === T_NWB) continue;
        break;
      }
      return out;
    }
    default: return '';
  }
}

function isPureLiteral(node) {
  if (node.t === T_LIT) return true;
  if (node.t === T_CAT) return node.items.every(isPureLiteral);
  if (node.t === T_NGRP) return isPureLiteral(node.x);
  return false;
}

function literalOf(node) {
  if (node.t === T_LIT) return node.s;
  if (node.t === T_CAT) return node.items.map(literalOf).join('');
  if (node.t === T_NGRP) return literalOf(node.x);
  return '';
}

// ---------------- Boyer-Moore-Horspool ----------------

function bmhSkipTable(needle) {
  const m = needle.length;
  const skip = new Int32Array(65536);
  skip.fill(m);
  for (let i = 0; i < m - 1; i++) skip[needle.charCodeAt(i)] = m - 1 - i;
  return { skip, m };
}

function bmhSearch(hay, needle, table, from) {
  const n = hay.length, m = table.m;
  if (m === 0) return from <= n ? from : -1;
  if (m === 1) {
    const c = needle.charCodeAt(0);
    for (let i = from; i < n; i++) if (hay.charCodeAt(i) === c) return i;
    return -1;
  }
  let i = from;
  while (i <= n - m) {
    let j = m - 1;
    while (j >= 0 && hay.charCodeAt(i + j) === needle.charCodeAt(j)) j--;
    if (j < 0) return i;
    i += table.skip[hay.charCodeAt(i + m - 1)];
  }
  return -1;
}

// ---------------- Pike VM program builder ----------------
// Thompson construction. Emission is strictly in order; non-branching
// instructions fall through to pc+1. A frag is {start, out} where out
// lists addresses of JMP instructions whose target is not yet known.

class PikeBuilder {
  constructor(flags) {
    this.ins = [];
    this.classes = [];
    this.multiline = !!flags.multiline;
    this.dotAll = !!flags.dotAll;
  }
  emit(op, a, b) { this.ins.push([op, a|0, b|0]); return this.ins.length - 1; }
  patchList(list, target) { for (const a of list) this.ins[a][1] = target; }

  addClass(rs) { this.classes.push(rs); return this.classes.length - 1; }

  build(node, nsave) {
    const frag = this.gen(node);
    const m = this.emit(OP_MATCH, 0, 0);
    this.patchList(frag.out, m);
    return { ins: this.ins, classes: this.classes, nsave };
  }

  // Single non-branching instruction frag.
  one(op, a, b) {
    const at = this.emit(op, a, b);
    const j = this.emit(OP_JMP, 0, 0);
    return { start: at, out: [j] };
  }

  gen(node) {
    switch (node.t) {
      case T_LIT: {
        const s = node.s;
        if (!s.length) { const j = this.emit(OP_JMP, 0, 0); return { start: j, out: [j] }; }
        const start = this.emit(OP_CHAR, s.charCodeAt(0), 0);
        for (let i = 1; i < s.length; i++) this.emit(OP_CHAR, s.charCodeAt(i), 0);
        const j = this.emit(OP_JMP, 0, 0);
        return { start, out: [j] };
      }
      case T_DOT: return this.one(OP_ANY, 0, 0);
      case T_CLS: {
        const id = this.addClass(node.rs);
        return this.one(OP_CLS, id, node.neg ? 1 : 0);
      }
      case T_BOL: return this.one(OP_BOL, 0, 0);
      case T_EOL: return this.one(OP_EOL, 0, 0);
      case T_WB: return this.one(OP_WB, 0, 0);
      case T_NWB: return this.one(OP_NWB, 0, 0);
      case T_CAT: {
        if (!node.items.length) { const j = this.emit(OP_JMP, 0, 0); return { start: j, out: [j] }; }
        let f = this.gen(node.items[0]);
        for (let i = 1; i < node.items.length; i++) {
          const g = this.gen(node.items[i]);
          this.patchList(f.out, g.start);
          f = { start: f.start, out: g.out };
        }
        return f;
      }
      case T_ALT: {
        const s = this.emit(OP_SPLIT, 0, 0);
        const l = this.gen(node.l);
        const j = this.emit(OP_JMP, 0, 0);
        const r = this.gen(node.r);
        this.ins[s][1] = l.start; this.ins[s][2] = r.start;
        return { start: s, out: l.out.concat([j], r.out) };
      }
      case T_REP: return this.genRep(node);
      case T_GRP: {
        const s0 = this.emit(OP_SAVE, (node.i - 1) * 2, 0);
        const g = this.gen(node.x);
        const s1 = this.emit(OP_SAVE, (node.i - 1) * 2 + 1, 0);
        const j = this.emit(OP_JMP, 0, 0);
        // s0 falls through into g.start (emission order); g.out -> s1; s1 falls into j.
        this.patchList(g.out, s1);
        void s0;
        return { start: s0, out: [j] };
      }
      case T_NGRP: return this.gen(node.x);
      default: throw new Error('pike: unsupported node t=' + node.t);
    }
  }

  genRep(node) {
    const { x, min, max, lazy } = node;
    // Mandatory copies in sequence.
    let f = null;
    for (let i = 0; i < min; i++) {
      const g = this.gen(x);
      if (!f) f = g;
      else { this.patchList(f.out, g.start); f = { start: f.start, out: g.out }; }
    }
    const opt = max === Infinity ? Infinity : max - min;
    if (opt === 0) {
      if (!f) { const j = this.emit(OP_JMP, 0, 0); return { start: j, out: [j] }; }
      return f;
    }
    if (opt === Infinity) {
      // Unbounded loop.
      const s = this.emit(OP_SPLIT, 0, 0);
      const b = this.gen(x);
      const back = this.emit(OP_JMP, 0, 0);
      const exitJ = this.emit(OP_JMP, 0, 0);
      if (!lazy) { this.ins[s][1] = b.start; this.ins[s][2] = exitJ; }
      else { this.ins[s][1] = exitJ; this.ins[s][2] = b.start; }
      this.ins[back][1] = s;
      this.patchList(b.out, back);
      const loop = { start: s, out: [exitJ] };
      if (!f) return loop;
      this.patchList(f.out, s);
      return { start: f.start, out: [exitJ] };
    }
    // Bounded optional copies: emit SPLIT/body pairs in sequence.
    // Greedy: SPLIT -> body, SPLIT2 -> next. Lazy: swapped.
    let head = null, tailOut = null;
    for (let i = 0; i < opt; i++) {
      const s = this.emit(OP_SPLIT, 0, 0);
      const b = this.gen(x);
      if (!lazy) { this.ins[s][1] = b.start; /* [2] patched below */ }
      else { this.ins[s][2] = b.start; /* [1] patched below */ }
      this.patchList(b.out, this.ins.length); // body exit -> next SPLIT (or end)
      if (!head) head = { start: s };
      else {
        // previous SPLIT's skip arm -> this SPLIT
        if (!lazy) this.ins[tailOut.s][2] = s; else this.ins[tailOut.s][1] = s;
      }
      tailOut = { s };
    }
    const endJ = this.emit(OP_JMP, 0, 0);
    if (!lazy) this.ins[tailOut.s][2] = endJ; else this.ins[tailOut.s][1] = endJ;
    const optFrag = { start: head.start, out: [endJ] };
    if (!f) return optFrag;
    this.patchList(f.out, head.start);
    return { start: f.start, out: [endJ] };
  }
}

// ---------------- Pike VM runner ----------------

function isWordChar(cp) {
  return (cp >= 48 && cp <= 57) || (cp >= 65 && cp <= 90) ||
         (cp >= 97 && cp <= 122) || cp === 95;
}

class PikeRunner {
  constructor(prog, flags) {
    this.ins = prog.ins;
    this.classes = prog.classes;
    this.nsave = prog.nsave;
    this.multiline = !!flags.multiline;
    this.dotAll = !!flags.dotAll;
    // Reusable thread lists + dedup stamps (no per-position allocation).
    this.clist = [];
    this.nlist = [];
    this.stamp = new Int32Array(this.ins.length);
    this.gen = 1;
  }

  // -1-filled caps array: -1 = group did not participate.
  allocCaps() {
    const a = new Int32Array(Math.max(2, this.nsave));
    a.fill(-1);
    return a;
  }

  // Try match starting at `from`. Returns {end, caps} or null.
  // capsOut: Int32Array to receive save slots (may be null).
  matchAt(input, from, capsOut) {
    const ins = this.ins, n = input.length;
    let clist = this.clist, nlist = this.nlist;
    clist.length = 0;
    const gen = ++this.gen;
    // Seed: epsilon closure of instruction 0 at position `from`.
    if (!this.addThread(0, from, input, clist, gen, null)) return null;
    let pos = from;
    let pendPos = -1, pendCaps = null;
    const dotAll = this.dotAll, classes = this.classes;
    const canConsume = (t, c) => {
      const o = ins[t.pc];
      switch (o[0]) {
        case OP_CHAR: return c === o[1];
        case OP_CLS: return classHas(classes[o[1]], c) !== !!o[2];
        case OP_ANY: return dotAll || (c !== 10 && c !== 13 && c !== 0x2028 && c !== 0x2029);
        default: return false;
      }
    };
    for (;;) {
      if (pos >= n) {
        // End of input: first MATCH thread in priority order wins.
        for (let i = 0; i < clist.length; i++) {
          const t = clist[i];
          if (ins[t.pc][0] === OP_MATCH) {
            if (capsOut) capsOut.set(t.caps);
            this.clist = clist; this.nlist = nlist;
            return { end: pos, caps: t.caps };
          }
        }
        this.clist = clist; this.nlist = nlist;
        if (pendPos >= 0) {
          if (capsOut) capsOut.set(pendCaps);
          return { end: pendPos, caps: pendCaps };
        }
        return null;
      }
      const c = input.charCodeAt(pos);
      // A MATCH wins only if no higher-priority thread can consume input.
      // This implements greedy/lazy preference correctly.
      let firstMatch = -1, firstConsumer = -1;
      for (let i = 0; i < clist.length; i++) {
        const t = clist[i];
        if (ins[t.pc][0] === OP_MATCH) { if (firstMatch < 0) firstMatch = i; }
        else if (firstConsumer < 0 && canConsume(t, c)) firstConsumer = i;
        if (firstMatch >= 0 && firstConsumer >= 0) break;
      }
      if (firstMatch >= 0 && (firstConsumer < 0 || firstMatch < firstConsumer)) {
        const t = clist[firstMatch];
        if (capsOut) capsOut.set(t.caps);
        this.clist = clist; this.nlist = nlist;
        return { end: pos, caps: t.caps };
      }
      if (firstMatch >= 0) {
        // Lower-priority match available; higher-priority paths are explored
        // first. Remember it in case they all die (backtrack point).
        pendPos = pos; pendCaps = clist[firstMatch].caps;
      }
      if (firstConsumer < 0) {
        this.clist = clist; this.nlist = nlist;
        if (pendPos >= 0) {
          if (capsOut) capsOut.set(pendCaps);
          return { end: pendPos, caps: pendCaps };
        }
        return null;
      }
      nlist.length = 0;
      const gen2 = ++this.gen;
      for (let i = 0; i < clist.length; i++) {
        const t = clist[i];
        if (canConsume(t, c)) this.addThread(t.pc + 1, pos + 1, input, nlist, gen2, t.caps);
      }
      // swap locals
      const tmp = clist; clist = nlist; nlist = tmp;
      pos++;
    }
  }

  // Single-pass unanchored search. Runs ONE NFA simulation across the input,
  // injecting a new start thread at each position. Per-pc we keep the
  // earliest start (leftmost priority). Linear time — no quadratic retry.
  // Returns {index, end, caps} or null.
  searchUnanchored(input, fromPos, capsOut) {
    const ins = this.ins, n = input.length;
    const dotAll = this.dotAll, classes = this.classes;
    const stamp = this.stamp;
    let clist = this.clist, nlist = this.nlist;
    clist.length = 0;

    const canConsume = (t, c) => {
      const o = ins[t.pc];
      switch (o[0]) {
        case OP_CHAR: return c === o[1];
        case OP_CLS: return classHas(classes[o[1]], c) !== !!o[2];
        case OP_ANY: return dotAll || (c !== 10 && c !== 13 && c !== 0x2028 && c !== 0x2029);
        default: return false;
      }
    };

    // Epsilon closure for a fresh start at `pos`, appended to `list`.
    // Dedup: skip pcs already in list (earlier start wins); stamp prevents loops.
    const injectStart = (pos, list) => {
      const gen = ++this.gen;
      const stackPc = [0], stackCaps = [null];
      while (stackPc.length) {
        const p = stackPc.pop();
        const cur = stackCaps.pop();
        if (stamp[p] === gen) continue;
        stamp[p] = gen;
        const o = ins[p];
        switch (o[0]) {
          case OP_JMP: stackPc.push(o[1]); stackCaps.push(cur); break;
          case OP_SPLIT:
            stackPc.push(o[2]); stackCaps.push(cur);
            stackPc.push(o[1]); stackCaps.push(cur);
            break;
          case OP_SAVE: {
            const nc = cur ? cur.slice() : this.allocCaps();
            nc[o[1]] = pos;
            stackPc.push(p + 1); stackCaps.push(nc);
            break;
          }
          case OP_BOL: {
            const ok = pos === 0 || (this.multiline && pos > 0 && input.charCodeAt(pos - 1) === 10);
            if (ok) { stackPc.push(p + 1); stackCaps.push(cur); }
            break;
          }
          case OP_EOL: {
            const ok = pos === n || (this.multiline && pos < n && input.charCodeAt(pos) === 10);
            if (ok) { stackPc.push(p + 1); stackCaps.push(cur); }
            break;
          }
          case OP_WB: {
            const a = pos > 0 && isWordChar(input.charCodeAt(pos - 1));
            const b = pos < n && isWordChar(input.charCodeAt(pos));
            if (a !== b) { stackPc.push(p + 1); stackCaps.push(cur); }
            break;
          }
          case OP_NWB: {
            const a = pos > 0 && isWordChar(input.charCodeAt(pos - 1));
            const b = pos < n && isWordChar(input.charCodeAt(pos));
            if (a === b) { stackPc.push(p + 1); stackCaps.push(cur); }
            break;
          }
          default:
            // consuming op or MATCH: check if pc already in list (earlier start wins)
            let dup = false;
            for (let i = 0; i < list.length; i++) {
              if (list[i].pc === p) { dup = true; break; }
            }
            if (!dup) list.push({ pc: p, caps: cur || this.allocCaps(), start: pos });
            break;
        }
      }
    };

    let pendStart = -1, pendEnd = -1, pendCaps = null;
    for (let pos = fromPos; pos <= n; pos++) {
      injectStart(pos, clist);
      if (pos >= n) {
        for (let i = 0; i < clist.length; i++) {
          const t = clist[i];
          if (ins[t.pc][0] === OP_MATCH) {
            if (capsOut) capsOut.set(t.caps);
            this.clist = clist; this.nlist = nlist;
            return { index: t.start, end: pos, caps: t.caps };
          }
        }
        break;
      }
      const c = input.charCodeAt(pos);
      let firstMatch = -1, firstConsumer = -1;
      for (let i = 0; i < clist.length; i++) {
        const t = clist[i];
        if (ins[t.pc][0] === OP_MATCH) { if (firstMatch < 0) firstMatch = i; }
        else if (firstConsumer < 0 && canConsume(t, c)) firstConsumer = i;
        if (firstMatch >= 0 && firstConsumer >= 0) break;
      }
      if (firstMatch >= 0 && (firstConsumer < 0 || firstMatch < firstConsumer)) {
        const t = clist[firstMatch];
        if (capsOut) capsOut.set(t.caps);
        this.clist = clist; this.nlist = nlist;
        return { index: t.start, end: pos, caps: t.caps };
      }
      if (firstMatch >= 0) {
        const t = clist[firstMatch];
        pendStart = t.start; pendEnd = pos; pendCaps = t.caps;
      }
      if (firstConsumer < 0) {
        if (pendStart >= 0) {
          if (capsOut) capsOut.set(pendCaps);
          this.clist = clist; this.nlist = nlist;
          return { index: pendStart, end: pendEnd, caps: pendCaps };
        }
        // All current threads dead, but a later start may still match.
        clist.length = 0;
        continue;
      }
      // Step: build nlist from consuming threads.
      nlist.length = 0;
      const gen2 = ++this.gen;
      for (let i = 0; i < clist.length; i++) {
        const t = clist[i];
        if (!canConsume(t, c)) continue;
        // inline closure for step (pc+1 at pos+1), deduped into nlist
        const stackPc = [t.pc + 1], stackCaps = [t.caps];
        while (stackPc.length) {
          const p = stackPc.pop();
          const cur = stackCaps.pop();
          if (stamp[p] === gen2) continue;
          stamp[p] = gen2;
          const o = ins[p];
          switch (o[0]) {
            case OP_JMP: stackPc.push(o[1]); stackCaps.push(cur); break;
            case OP_SPLIT:
              stackPc.push(o[2]); stackCaps.push(cur);
              stackPc.push(o[1]); stackCaps.push(cur);
              break;
            case OP_SAVE: {
              const nc = cur.slice();
              nc[o[1]] = pos + 1;
              stackPc.push(p + 1); stackCaps.push(nc);
              break;
            }
            case OP_BOL: {
              const ok = pos + 1 === 0 || (this.multiline && input.charCodeAt(pos) === 10);
              if (ok) { stackPc.push(p + 1); stackCaps.push(cur); }
              break;
            }
            case OP_EOL: {
              const ok = pos + 1 === n || (this.multiline && pos + 1 < n && input.charCodeAt(pos + 1) === 10);
              if (ok) { stackPc.push(p + 1); stackCaps.push(cur); }
              break;
            }
            case OP_WB: {
              const a = isWordChar(input.charCodeAt(pos));
              const b = pos + 1 < n && isWordChar(input.charCodeAt(pos + 1));
              if (a !== b) { stackPc.push(p + 1); stackCaps.push(cur); }
              break;
            }
            case OP_NWB: {
              const a = isWordChar(input.charCodeAt(pos));
              const b = pos + 1 < n && isWordChar(input.charCodeAt(pos + 1));
              if (a === b) { stackPc.push(p + 1); stackCaps.push(cur); }
              break;
            }
            default: {
              let dup = false;
              for (let k = 0; k < nlist.length; k++) {
                if (nlist[k].pc === p) { dup = true; break; }
              }
              if (!dup) nlist.push({ pc: p, caps: cur || this.allocCaps(), start: t.start });
              break;
            }
          }
        }
      }
      const tmp = clist; clist = nlist; nlist = tmp;
    }
    this.clist = clist; this.nlist = nlist;
    if (pendStart >= 0) {
      if (capsOut) capsOut.set(pendCaps);
      return { index: pendStart, end: pendEnd, caps: pendCaps };
    }
    return null;
  }

  // Epsilon closure: add thread for pc at position pos.
  // Uses explicit frames so SAVE slot updates travel with each pc.
  addThread(pc, pos, input, list, gen, caps) {
    const ins = this.ins, stamp = this.stamp, n = input.length;
    const nsave = Math.max(2, this.nsave);
    const stackPc = [pc];
    const stackCaps = [caps];
    while (stackPc.length) {
      const p = stackPc.pop();
      let cur = stackCaps.pop();
      if (stamp[p] === gen) continue;
      stamp[p] = gen;
      const o = ins[p];
      switch (o[0]) {
        case OP_JMP: stackPc.push(o[1]); stackCaps.push(cur); break;
        case OP_SPLIT:
          // Push y first so x is processed first (priority order).
          // Branches share the caps array: SAVE clones before writing
          // (copy-on-write), so sharing is safe and avoids garbage.
          stackPc.push(o[2]); stackCaps.push(cur);
          stackPc.push(o[1]); stackCaps.push(cur);
          break;
        case OP_SAVE: {
          const nc = cur ? cur.slice() : this.allocCaps();
          nc[o[1]] = pos;
          stackPc.push(p + 1); stackCaps.push(nc);
          break;
        }
        case OP_BOL: {
          const ok = pos === 0 || (this.multiline && pos > 0 && input.charCodeAt(pos - 1) === 10);
          if (ok) { stackPc.push(p + 1); stackCaps.push(cur); }
          break;
        }
        case OP_EOL: {
          const ok = pos === n || (this.multiline && pos < n && input.charCodeAt(pos) === 10);
          if (ok) { stackPc.push(p + 1); stackCaps.push(cur); }
          break;
        }
        case OP_WB: {
          const a = pos > 0 && isWordChar(input.charCodeAt(pos - 1));
          const b = pos < n && isWordChar(input.charCodeAt(pos));
          if (a !== b) { stackPc.push(p + 1); stackCaps.push(cur); }
          break;
        }
        case OP_NWB: {
          const a = pos > 0 && isWordChar(input.charCodeAt(pos - 1));
          const b = pos < n && isWordChar(input.charCodeAt(pos));
          if (a === b) { stackPc.push(p + 1); stackCaps.push(cur); }
          break;
        }
        case OP_MATCH:
          list.push({ pc: p, caps: cur || this.allocCaps() });
          break;
        default:
          // consuming op: becomes a live thread
          list.push({ pc: p, caps: cur || this.allocCaps() });
          break;
      }
    }
    return true;
  }
}

function classHas(rs, c) {
  let lo = 0, hi = rs.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (c < rs[m][0]) hi = m - 1;
    else if (c > rs[m][1]) lo = m + 1;
    else return true;
  }
  return false;
}

// ---------------- Guarded backtracker (Tier BT) ----------------
// For patterns with backreferences or lookaround. Continuation-passing
// backtracking with a step budget: guarantees termination (no catastrophic
// hangs). Caps are plain Arrays here (this tier is rare; clarity wins).

class Backtracker {
  constructor(ast, flags, nGroups) {
    this.ast = ast;
    this.multiline = !!flags.multiline;
    this.dotAll = !!flags.dotAll;
    this.nGroups = nGroups;
    this.steps = 0;
    this.budget = 1000000;
    this.input = '';
  }

  matchAt(input, from) {
    this.input = input;
    this.steps = 0;
    this.result = null;
    const caps = new Array(this.nGroups * 2).fill(-1);
    const ok = this.match(this.ast, from, caps, (pos, c) => {
      this.result = { end: pos, caps: c.slice() };
      return true;
    });
    return (ok && this.result) ? this.result : null;
  }

  // Returns true if cont-chain succeeded (stop backtracking), false to try next option.
  match(node, pos, caps, cont) {
    if (++this.steps > this.budget) return false;
    const input = this.input, n = input.length;
    switch (node.t) {
      case T_LIT: {
        const s = node.s, m = s.length;
        if (pos + m > n) return false;
        for (let i = 0; i < m; i++)
          if (input.charCodeAt(pos + i) !== s.charCodeAt(i)) return false;
        return cont(pos + m, caps);
      }
      case T_DOT: {
        if (pos >= n) return false;
        const c = input.charCodeAt(pos);
        if (!this.dotAll && (c === 10 || c === 13 || c === 0x2028 || c === 0x2029)) return false;
        return cont(pos + 1, caps);
      }
      case T_CLS: {
        if (pos >= n) return false;
        const hit = classHas(node.rs, input.charCodeAt(pos));
        return (hit !== node.neg) ? cont(pos + 1, caps) : false;
      }
      case T_BOL:
        return (pos === 0 || (this.multiline && pos > 0 && input.charCodeAt(pos - 1) === 10)) ? cont(pos, caps) : false;
      case T_EOL:
        return (pos === n || (this.multiline && pos < n && input.charCodeAt(pos) === 10)) ? cont(pos, caps) : false;
      case T_WB: {
        const a = pos > 0 && isWordChar(input.charCodeAt(pos - 1));
        const b = pos < n && isWordChar(input.charCodeAt(pos));
        return (a !== b) ? cont(pos, caps) : false;
      }
      case T_NWB: {
        const a = pos > 0 && isWordChar(input.charCodeAt(pos - 1));
        const b = pos < n && isWordChar(input.charCodeAt(pos));
        return (a === b) ? cont(pos, caps) : false;
      }
      case T_ALT: {
        const s = caps.slice();
        if (this.match(node.l, pos, caps, cont)) return true;
        for (let i = 0; i < s.length; i++) caps[i] = s[i];
        return this.match(node.r, pos, caps, cont);
      }
      case T_CAT: {
        const items = node.items;
        const rec = (i, p, c) => {
          if (i === items.length) return cont(p, c);
          return this.match(items[i], p, c, (p2, c2) => rec(i + 1, p2, c2));
        };
        return rec(0, pos, caps);
      }
      case T_REP: return this.matchRep(node, pos, caps, cont);
      case T_GRP: {
        const gi = (node.i - 1) * 2;
        const o0 = caps[gi], o1 = caps[gi + 1];
        caps[gi] = pos;
        const r = this.match(node.x, pos, caps, (p2, c2) => {
          const prev = c2[gi + 1];
          c2[gi + 1] = p2;
          const rr = cont(p2, c2);
          if (!rr) c2[gi + 1] = prev;
          return rr;
        });
        if (!r) { caps[gi] = o0; caps[gi + 1] = o1; }
        return r;
      }
      case T_NGRP: return this.match(node.x, pos, caps, cont);
      case T_REF: {
        const gi = (node.i - 1) * 2;
        const s = caps[gi], e = caps[gi + 1];
        if (s < 0 || e < 0 || e < s) return cont(pos, caps); // unmatched -> empty
        const len = e - s;
        if (pos + len > n) return false;
        for (let k = 0; k < len; k++)
          if (input.charCodeAt(pos + k) !== input.charCodeAt(s + k)) return false;
        return cont(pos + len, caps);
      }
      case T_LA: {
        const probe = this.match(node.x, pos, caps.slice(), () => true);
        return ((probe !== false) !== node.neg) ? cont(pos, caps) : false;
      }
      default: return false;
    }
  }

  matchRep(node, pos, caps, cont) {
    const { x, min, max, lazy } = node;
    const self = this;
    // tryN(c, p, cp): c iterations done, at position p.
    function tryN(c, p, cp) {
      if (lazy) {
        if (c >= min) {
          if (cont(p, cp)) return true;
        }
        if (c < max) {
          const s = cp.slice();
          return self.match(x, p, cp, (p2, c2) => {
            if (p2 === p) return cont(p, c2); // empty iteration: stop looping
            return tryN(c + 1, p2, c2);
          }) || false;
          // NOTE: on inner failure caps already restored by callee discipline;
          // `s` snapshot guards the stop-branch below from dirty caps.
        }
        return false;
      } else {
        if (c < max) {
          const s = cp.slice();
          if (self.match(x, p, cp, (p2, c2) => {
            if (p2 === p) return cont(p, c2);
            return tryN(c + 1, p2, c2);
          })) return true;
          for (let i = 0; i < s.length; i++) cp[i] = s[i];
        }
        if (c >= min) return cont(p, cp);
        return false;
      }
    }
    return tryN(0, pos, caps);
  }
}

module.exports = { PikeBuilder, PikeRunner, Backtracker,
  bmhSkipTable, bmhSearch, literalPrefix, isPureLiteral, literalOf, astHas, T_REF, T_LA };
