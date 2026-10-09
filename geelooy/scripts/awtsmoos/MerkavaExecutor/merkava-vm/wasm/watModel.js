// B"H — WAT S-expression -> resolved module model (from scratch).
// Name resolution ($foo -> indices), folded-expression flattening,
// label depth computation. Emission is in watEmit.js (repo binary builders).
import { parseWat, parseNum, parseBig } from './watParse.js';
import { NAME_TO_OP } from './wasmOpcodes.js';

const VALTYPES = new Set(['i32', 'i64', 'f32', 'f64']);

function isName(s) { return typeof s === 'string' && s[0] === '$'; }
function isStr(t) { return t && typeof t === 'object' && typeof t.str === 'string'; }

function dataBytes(strs) {
  const out = [];
  for (const s of strs) {
    for (const ch of s) {
      const cp = ch.codePointAt(0);
      if (cp <= 0xff) out.push(cp);
      else {
        const enc = new TextEncoder().encode(ch);
        for (const b of enc) out.push(b);
      }
    }
  }
  return Uint8Array.from(out);
}

// Natural alignment (log2) per load/store op
export function naturalAlign(op) {
  if (/(load8|store8)/.test(op)) return 0;
  if (/(load16|store16)/.test(op)) return 1;
  if (/(load32|store32|load|store)$/.test(op) && /^(i32|f32)/.test(op)) return 2;
  if (/^(i64|f64)/.test(op)) return 3;
  return 2;
}

export function buildModel(src) {
  const forms = parseWat(src);
  if (forms.length !== 1 || !Array.isArray(forms[0]) || forms[0][0] !== 'module') {
    throw new Error('[wat] expected a single (module ...) form');
  }
  const fields = forms[0].slice(1);
  const m = {
    types: [], typeKeys: new Map(), namedTypes: new Map(),
    imports: [], funcs: [], funcNames: new Map(),
    memories: [], memNames: new Map(),
    globals: [], globalNames: new Map(),
    tables: [], tableNames: new Map(),
    exports: [], start: null,
    elems: [], datas: [],
    pendingExports: [], pendingStart: null,
  };

  // ---- pass 1: declare everything (indices assigned in assignIndices) ----
  for (const f of fields) {
    if (!Array.isArray(f)) throw new Error('[wat] bad module field');
    const head = f[0];
    if (head === 'func') declareFunc(m, f);
    else if (head === 'memory') declareMemory(m, f);
    else if (head === 'global') declareGlobal(m, f);
    else if (head === 'table') declareTable(m, f);
    else if (head === 'import') declareImport(m, f);
    else if (head === 'export') m.pendingExports.push(f);
    else if (head === 'start') m.pendingStart = f[1];
    else if (head === 'elem') m.elems.push({ raw: f });
    else if (head === 'data') m.datas.push({ raw: f });
    else if (head === 'type') declareType(m, f);
    else throw new Error('[wat] unknown module field: ' + head);
  }

  // ---- index assignment: imports occupy the low indices of each space ----
  assignIndices(m);

  // ---- pass 2: resolve bodies ----
  for (const fn of m.funcs) {
    if (fn.import) continue;
    fn.body = compileBody(fn.rawBody, makeFuncCtx(m, fn), m);
  }
  for (const g of m.globals) {
    if (g.import) continue;
    g.init = compileBody(g.rawInit, makeFuncCtx(m, null), m);
  }
  m.elems = m.elems.map((e) => resolveElem(m, e.raw));
  m.datas = m.datas.map((d) => resolveData(m, d.raw));

  // ---- pass 3: type dedup ----
  for (const fn of m.funcs) {
    fn.typeIdx = internType(m, fn.params.map((p) => p.t), fn.results);
  }
  for (const im of m.imports) {
    if (im.kind === 'func') im.typeIdx = internType(m, im.params.map((p) => p.t), im.results);
  }
  return m;
}

function internType(m, params, results) {
  const key = params.join(',') + '->' + results.join(',');
  if (m.typeKeys.has(key)) return m.typeKeys.get(key);
  const idx = m.types.length;
  m.types.push({ params: params.slice(), results: results.slice() });
  m.typeKeys.set(key, idx);
  return idx;
}

function parseParams(f) {
  // (param $a i32) (param i32 i32) ...
  const params = [];
  for (const item of f) {
    if (Array.isArray(item) && item[0] === 'param') {
      const rest = item.slice(1);
      let k = 0;
      if (rest.length && isName(rest[0])) { params.push({ name: rest[0], t: checkValtype(rest[1]) }); k = 2; }
      for (; k < rest.length; k++) params.push({ name: null, t: checkValtype(rest[k]) });
    }
  }
  return params;
}
function parseResults(f) {
  const results = [];
  for (const item of f) {
    if (Array.isArray(item) && item[0] === 'result') {
      for (const t of item.slice(1)) results.push(checkValtype(t));
    }
  }
  return results;
}
function parseLocals(f) {
  const locals = [];
  for (const item of f) {
    if (Array.isArray(item) && item[0] === 'local') {
      const rest = item.slice(1);
      if (rest.length && isName(rest[0])) locals.push({ name: rest[0], t: checkValtype(rest[1]) });
      else for (const t of rest) locals.push({ name: null, t: checkValtype(t) });
    }
  }
  return locals;
}
function checkValtype(t) {
  if (!VALTYPES.has(t)) throw new Error('[wat] bad valtype ' + t);
  return t;
}

function declareFunc(m, f) {
  let name = null;
  let k = 1;
  if (isName(f[k])) { name = f[k]; k++; }
  const rec = { name, import: null, params: [], results: [], locals: [], rawBody: [], inlineExports: [] };
  const body = [];
  for (; k < f.length; k++) {
    const item = f[k];
    if (Array.isArray(item) && item[0] === 'export') {
      if (!isStr(item[1])) throw new Error('[wat] bad inline export');
      rec.inlineExports.push(item[1].str);
    } else if (Array.isArray(item) && item[0] === 'import') {
      rec.import = { module: strOf(item[1]), name: strOf(item[2]) };
    } else if (Array.isArray(item) && (item[0] === 'param' || item[0] === 'result' || item[0] === 'local')) {
      body.push(item); // parsed below
    } else {
      body.push(item);
    }
  }
  rec.params = parseParams(body);
  rec.results = parseResults(body);
  rec.locals = parseLocals(body);
  rec.rawBody = body.filter((it) => !(Array.isArray(it) && (it[0] === 'param' || it[0] === 'result' || it[0] === 'local')));
  if (name) {
    if (m.funcNames.has(name)) throw new Error('[wat] dup func name ' + name);
    m.funcNames.set(name, rec); // record for now; replaced by index in assignIndices
  }
  if (rec.import) {
    m.imports.push({ module: rec.import.module, name: rec.import.name, kind: 'func', funcName: name, params: rec.params, results: rec.results });
  } else {
    m.funcs.push(rec);
  }
}

function declareMemory(m, f) {
  let name = null, k = 1;
  if (isName(f[k])) { name = f[k]; k++; }
  const nums = [];
  const inlineExports = [];
  let importDecl = null;
  for (; k < f.length; k++) {
    const item = f[k];
    if (Array.isArray(item) && item[0] === 'export') inlineExports.push(item[1].str);
    else if (Array.isArray(item) && item[0] === 'import') importDecl = { module: strOf(item[1]), name: strOf(item[2]) };
    else nums.push(Number(item));
  }
  if (name) {
    if (m.memNames.has(name)) throw new Error('[wat] dup memory name ' + name);
    m.memNames.set(name, true); // replaced by index in assignIndices
  }
  const rec = { name, min: nums[0] || 0, max: nums.length > 1 ? nums[1] : null, inlineExports };
  if (importDecl) m.imports.push({ ...importDecl, kind: 'memory', memName: name, min: rec.min, max: rec.max });
  else m.memories.push(rec);
}

function declareGlobal(m, f) {
  let name = null, k = 1;
  if (isName(f[k])) { name = f[k]; k++; }
  let valtype = null, mutable = false;
  const rest = [];
  const inlineExports = [];
  let importDecl = null;
  for (; k < f.length; k++) {
    const item = f[k];
    if (Array.isArray(item) && item[0] === 'export') inlineExports.push(item[1].str);
    else if (Array.isArray(item) && item[0] === 'import') importDecl = { module: strOf(item[1]), name: strOf(item[2]) };
    else rest.push(item);
  }
  for (const item of rest) {
    if (Array.isArray(item) && item[0] === 'mut') { mutable = true; valtype = checkValtype(item[1]); }
    else if (typeof item === 'string' && VALTYPES.has(item) && !valtype) valtype = item;
  }
  const initItems = rest.filter((it) => !(typeof it === 'string' && VALTYPES.has(it)) && !(Array.isArray(it) && it[0] === 'mut'));
  if (name) {
    if (m.globalNames.has(name)) throw new Error('[wat] dup global name ' + name);
    m.globalNames.set(name, true); // replaced by index in assignIndices
  }
  const rec = { name, valtype, mutable, rawInit: initItems, inlineExports };
  if (importDecl) m.imports.push({ ...importDecl, kind: 'global', globalName: name, valtype, mutable });
  else m.globals.push(rec);
}

function declareTable(m, f) {
  let name = null, k = 1;
  if (isName(f[k])) { name = f[k]; k++; }
  const nums = [];
  let importDecl = null;
  const inlineExports = [];
  for (; k < f.length; k++) {
    const item = f[k];
    if (Array.isArray(item) && item[0] === 'export') inlineExports.push(item[1].str);
    else if (Array.isArray(item) && item[0] === 'import') importDecl = { module: strOf(item[1]), name: strOf(item[2]) };
    else if (typeof item === 'string' && item !== 'funcref') nums.push(Number(item));
  }
  if (name) {
    if (m.tableNames.has(name)) throw new Error('[wat] dup table name ' + name);
    m.tableNames.set(name, true); // replaced by index in assignIndices
  }
  const rec = { name, min: nums[0] || 0, max: nums.length > 1 ? nums[1] : null, inlineExports };
  if (importDecl) m.imports.push({ ...importDecl, kind: 'table', tableName: name, min: rec.min, max: rec.max });
  else m.tables.push(rec);
}

function declareImport(m, f) {
  const mod = strOf(f[1]);
  const nm = strOf(f[2]);
  const desc = f[3];
  if (!Array.isArray(desc)) throw new Error('[wat] bad import desc');
  if (desc[0] === 'func') {
    let name = null, k = 1;
    if (isName(desc[k])) { name = desc[k]; k++; }
    const params = parseParams(desc.slice(k));
    const results = parseResults(desc.slice(k));
    if (name) {
      if (m.funcNames.has(name)) throw new Error('[wat] dup func name ' + name);
      m.funcNames.set(name, true); // replaced by index in assignIndices
    }
    m.imports.push({ module: mod, name: nm, kind: 'func', funcName: name, params, results });
  } else if (desc[0] === 'memory') {
    const nums = desc.slice(1).map(Number);
    m.imports.push({ module: mod, name: nm, kind: 'memory', min: nums[0] || 0, max: nums.length > 1 ? nums[1] : null });
  } else if (desc[0] === 'global') {
    let vt = null, mut = false;
    for (const t of desc.slice(1)) {
      if (Array.isArray(t) && t[0] === 'mut') { mut = true; vt = checkValtype(t[1]); }
      else if (VALTYPES.has(t)) vt = t;
    }
    m.imports.push({ module: mod, name: nm, kind: 'global', valtype: vt, mutable: mut });
  } else if (desc[0] === 'table') {
    const nums = desc.slice(1).filter((t) => t !== 'funcref').map(Number);
    m.imports.push({ module: mod, name: nm, kind: 'table', min: nums[0] || 0, max: nums.length > 1 ? nums[1] : null });
  } else throw new Error('[wat] bad import kind ' + desc[0]);
}

// ---- index assignment: imports occupy the low indices of each space ----
function assignIndices(m) {
  let fi = 0;
  for (const im of m.imports) {
    if (im.kind !== 'func') continue;
    im.funcIdx = fi;
    if (im.funcName) m.funcNames.set(im.funcName, fi);
    fi++;
  }
  for (const fn of m.funcs) {
    fn.funcIdx = fi;
    if (fn.name) m.funcNames.set(fn.name, fi);
    for (const e of fn.inlineExports) m.exports.push({ name: e, kind: 'func', index: fi });
    fi++;
  }
  let mi = 0;
  for (const im of m.imports) {
    if (im.kind !== 'memory') continue;
    im.memIdx = mi;
    if (im.memName) m.memNames.set(im.memName, mi);
    mi++;
  }
  for (const mm of m.memories) {
    mm.memIdx = mi;
    if (mm.name) m.memNames.set(mm.name, mi);
    for (const e of (mm.inlineExports || [])) m.exports.push({ name: e, kind: 'memory', index: mi });
    mi++;
  }
  let gi = 0;
  for (const im of m.imports) {
    if (im.kind !== 'global') continue;
    im.globalIdx = gi;
    if (im.globalName) m.globalNames.set(im.globalName, gi);
    gi++;
  }
  for (const g of m.globals) {
    g.globalIdx = gi;
    if (g.name) m.globalNames.set(g.name, gi);
    for (const e of (g.inlineExports || [])) m.exports.push({ name: e, kind: 'global', index: gi });
    gi++;
  }
  let ti = 0;
  for (const im of m.imports) {
    if (im.kind !== 'table') continue;
    im.tableIdx = ti;
    if (im.tableName) m.tableNames.set(im.tableName, ti);
    ti++;
  }
  for (const t of m.tables) {
    t.tableIdx = ti;
    if (t.name) m.tableNames.set(t.name, ti);
    for (const e of (t.inlineExports || [])) m.exports.push({ name: e, kind: 'table', index: ti });
    ti++;
  }
  // explicit (export ...) fields, deferred until indices are final
  for (const f of m.pendingExports) {
    m.exports.push(resolveExport(m, f));
  }
  m.pendingExports = [];
  if (m.pendingStart !== null && m.pendingStart !== undefined) {
    const s = m.pendingStart;
    m.start = isName(s) ? m.funcNames.get(s) : Number(s);
    if (m.start === undefined) throw new Error('[wat] unknown start func ' + s);
  }
  m.pendingStart = null;
}

function resolveExport(m, f) {
  const nm = strOf(f[1]);
  const inner = f[2];
  if (!Array.isArray(inner)) throw new Error('[wat] bad export');
  const kind = inner[0];
  const ref = inner[1];
  let index;
  if (kind === 'func') index = isName(ref) ? m.funcNames.get(ref) : Number(ref);
  else if (kind === 'memory') index = isName(ref) ? m.memNames.get(ref) : Number(ref);
  else if (kind === 'global') index = isName(ref) ? m.globalNames.get(ref) : Number(ref);
  else if (kind === 'table') index = isName(ref) ? m.tableNames.get(ref) : Number(ref);
  else throw new Error('[wat] bad export kind ' + kind);
  if (index === undefined || !Number.isInteger(index)) throw new Error('[wat] unknown export ref ' + ref);
  return { name: nm, kind, index };
}

function declareType(m, f) {
  let name = null, k = 1;
  if (isName(f[k])) { name = f[k]; k++; }
  const inner = f[k];
  if (!Array.isArray(inner) || inner[0] !== 'func') throw new Error('[wat] bad type');
  const params = parseParams(inner.slice(1));
  const results = parseResults(inner.slice(1));
  const idx = internType(m, params.map((p) => p.t), results);
  if (name) m.namedTypes.set(name, idx);
}

function strOf(t) {
  if (!isStr(t)) throw new Error('[wat] expected string, got ' + JSON.stringify(t));
  return t.str;
}

function makeFuncCtx(m, fn) {
  const ctx = {
    m,
    params: fn ? fn.params : [],
    locals: fn ? fn.locals : [],
    labels: [],
  };
  ctx.localIndex = (n) => {
    if (isName(n)) {
      const pi = ctx.params.findIndex((p) => p.name === n);
      if (pi >= 0) return pi;
      const li = ctx.locals.findIndex((l) => l.name === n);
      if (li >= 0) return ctx.params.length + li;
      throw new Error('[wat] unknown local ' + n);
    }
    return Number(n);
  };
  ctx.funcIndex = (n) => {
    if (isName(n)) {
      if (!m.funcNames.has(n)) throw new Error('[wat] unknown func ' + n);
      return m.funcNames.get(n);
    }
    return Number(n);
  };
  ctx.globalIndex = (n) => {
    if (isName(n)) {
      if (!m.globalNames.has(n)) throw new Error('[wat] unknown global ' + n);
      return m.globalNames.get(n);
    }
    return Number(n);
  };
  ctx.labelDepth = (n) => {
    if (isName(n)) {
      const i = ctx.labels.findIndex((l) => l === n);
      if (i < 0) throw new Error('[wat] unknown label ' + n);
      return ctx.labels.length - 1 - i;
    }
    return Number(n);
  };
  return ctx;
}

// ---- instruction compilation ----
export function compileBody(items, ctx, m) {
  const out = [];
  let i = 0;
  while (i < items.length) i = compileOne(items, i, ctx, out);
  return out;
}

function compileOne(items, i, ctx, out) {
  const it = items[i];
  if (Array.isArray(it)) {
    const head = it[0];
    if (head === 'block' || head === 'loop') return compileBlock(it, ctx, out, i);
    if (head === 'if') return compileIf(it, ctx, out, i);
    if (head === 'then' || head === 'else') throw new Error('[wat] stray ' + head);
    if (typeof head === 'string' && NAME_TO_OP[head]) {
      return compileFolded(it, ctx, out, i);
    }
    throw new Error('[wat] bad expr head: ' + JSON.stringify(head));
  }
  // atom
  if (typeof it !== 'string') throw new Error('[wat] bad atom ' + JSON.stringify(it));
  if (it === 'then') return i + 1; // no-op in flat form
  if (it === 'else') { out.push({ op: 'else', imm: undefined }); return i + 1; }
  if (it === 'end') { out.push({ op: 'end', imm: undefined }); return i + 1; }
  if (!NAME_TO_OP[it]) throw new Error('[wat] unknown instruction ' + it);
  const info = needOp(it);
  const imm = parseFlatImm(info, items, i + 1, ctx);
  out.push({ op: it, imm: imm.value });
  return imm.next;
}

function needOp(name) {
  // name -> {imm kind}
  const byte = NAME_TO_OP[name];
  // imm kind lookup duplicated from wasmOpcodes OP table (avoid import cycle cost)
  return { byte, imm: IMM_KIND[name] || 'none' };
}

// immediate kinds per instruction name (mirrors wasmOpcodes.OP)
export const IMM_KIND = {
  'block': 'blocktype', 'loop': 'blocktype', 'if': 'blocktype',
  'br': 'u32', 'br_if': 'u32', 'br_table': 'brtable',
  'call': 'u32', 'call_indirect': 'callindirect',
  'local.get': 'u32', 'local.set': 'u32', 'local.tee': 'u32',
  'global.get': 'u32', 'global.set': 'u32',
  'memory.size': 'u32', 'memory.grow': 'u32',
  'i32.const': 's32', 'i64.const': 's64', 'f32.const': 'f32', 'f64.const': 'f64',
};
for (const n of ['i32.load','i64.load','f32.load','f64.load','i32.load8_s','i32.load8_u','i32.load16_s','i32.load16_u','i64.load8_s','i64.load8_u','i64.load16_s','i64.load16_u','i64.load32_s','i64.load32_u','i32.store','i64.store','f32.store','f64.store','i32.store8','i32.store16','i64.store8','i64.store16','i64.store32']) IMM_KIND[n] = 'memarg';

function parseFlatImm(info, items, i, ctx) {
  const kind = info.imm;
  if (kind === 'none') return { value: undefined, next: i };
  if (kind === 'u32') {
    const t = items[i];
    const v = resolveIndexOperand(t, ctx, info);
    return { value: v, next: i + 1 };
  }
  if (kind === 's32') return { value: parseNum(items[i]) | 0, next: i + 1 };
  if (kind === 's64') return { value: parseBig(items[i]), next: i + 1 };
  if (kind === 'f32' || kind === 'f64') return { value: parseNum(items[i]), next: i + 1 };
  if (kind === 'blocktype') {
    // optional (result t) list
    if (Array.isArray(items[i]) && items[i][0] === 'result') {
      const ts = items[i].slice(1).map(checkValtype);
      if (ts.length > 1) throw new Error('[wat] multi-value blocks unsupported');
      return { value: ts, next: i + 1 };
    }
    return { value: [], next: i };
  }
  if (kind === 'memarg') {
    let offset = 0, align = null;
    let j = i;
    while (j < items.length && typeof items[j] === 'string' && /^(offset|align)=\d+$/.test(items[j])) {
      const [, k, v] = items[j].match(/^(offset|align)=(\d+)$/);
      if (k === 'offset') offset = Number(v);
      else align = Number(v);
      j++;
    }
    return { value: { align, offset }, next: j };
  }
  throw new Error('[wat] flat imm not supported for kind ' + kind);
}

function resolveIndexOperand(t, ctx, info) {
  // t: name or number; meaning depends on op
  if (info && /local/.test(infoName(info))) return ctx.localIndex(t);
  if (info && /global/.test(infoName(info))) return ctx.globalIndex(t);
  if (info && /^br/.test(infoName(info))) return ctx.labelDepth(t);
  if (info && infoName(info) === 'call') return ctx.funcIndex(t);
  return isName(t) ? (() => { throw new Error('[wat] unexpected name ' + t); })() : Number(t);
}
function infoName(info) {
  for (const [n, b] of Object.entries(NAME_TO_OP)) if (b === info.byte) return n;
  return '';
}

function blockResults(children) {
  // children after optional $label: find (result t)
  const results = [];
  for (const c of children) {
    if (Array.isArray(c) && c[0] === 'result') {
      for (const t of c.slice(1)) results.push(checkValtype(t));
    }
  }
  if (results.length > 1) throw new Error('[wat] multi-value blocks unsupported');
  return results;
}

function compileBlock(form, ctx, out, i) {
  // (block $l? (result t)* body*) / (loop ...)
  const kind = form[0];
  let k = 1;
  let label = null;
  if (isName(form[k])) { label = form[k]; k++; }
  const results = blockResults(form.slice(k));
  const body = form.slice(k).filter((c) => !(Array.isArray(c) && c[0] === 'result'));
  out.push({ op: kind, imm: results });
  ctx.labels.push(label || ('$anon' + ctx.labels.length));
  for (const item of body) {
    const tmp = [item];
    let j = 0;
    while (j < tmp.length) j = compileOne(tmp, j, ctx, out);
  }
  ctx.labels.pop();
  out.push({ op: 'end', imm: undefined });
  return i + 1;
}

function compileIf(form, ctx, out, i) {
  // (if $l? (result t)* cond* (then b*) (else b*)?)
  let k = 1;
  let label = null;
  if (isName(form[k])) { label = form[k]; k++; }
  const results = blockResults(form.slice(k));
  let thenB = null, elseB = null;
  const cond = [];
  for (; k < form.length; k++) {
    const c = form[k];
    if (Array.isArray(c) && c[0] === 'then') thenB = c.slice(1);
    else if (Array.isArray(c) && c[0] === 'else') elseB = c.slice(1);
    else if (Array.isArray(c) && c[0] === 'result') continue;
    else cond.push(c);
  }
  if (!thenB) throw new Error('[wat] if without (then ...)');
  for (const c of cond) {
    const tmp = [c];
    let j = 0;
    while (j < tmp.length) j = compileOne(tmp, j, ctx, out);
  }
  out.push({ op: 'if', imm: results });
  ctx.labels.push(label || ('$anon' + ctx.labels.length));
  for (const item of thenB) {
    const tmp = [item];
    let j = 0;
    while (j < tmp.length) j = compileOne(tmp, j, ctx, out);
  }
  if (elseB) {
    out.push({ op: 'else', imm: undefined });
    for (const item of elseB) {
      const tmp = [item];
      let j = 0;
      while (j < tmp.length) j = compileOne(tmp, j, ctx, out);
    }
  }
  ctx.labels.pop();
  out.push({ op: 'end', imm: undefined });
  return i + 1;
}

function compileFolded(form, ctx, out, i) {
  const head = form[0];
  const info = needOp(head);
  const kind = info.imm;
  if (kind === 'none') {
    // pure stack op: children are operand exprs
    for (let k = 1; k < form.length; k++) {
      const c = form[k];
      const tmp = [c];
      let j = 0;
      while (j < tmp.length) j = compileOne(tmp, j, ctx, out);
    }
    out.push({ op: head, imm: undefined });
    return i + 1;
  }
  if (kind === 'u32') {
    // local.get/set/tee, global.get/set, call, br, br_if, memory.size/grow
    let v, startK;
    if (head === 'memory.size' || head === 'memory.grow') { v = 0; startK = 1; }
    else { v = resolveIndexOperand(form[1], ctx, info); startK = 2; }
    for (let k = startK; k < form.length; k++) {
      compileOperand(form[k], ctx, out);
    }
    out.push({ op: head, imm: v });
    return i + 1;
  }
  if (kind === 's32' || kind === 's64' || kind === 'f32' || kind === 'f64') {
    const t = form[1];
    let v;
    if (kind === 's32') v = parseNum(t) | 0;
    else if (kind === 's64') v = parseBig(t);
    else v = parseNum(t);
    out.push({ op: head, imm: v });
    return i + 1;
  }
  if (kind === 'memarg') {
    let offset = 0, align = null;
    for (let k = 1; k < form.length; k++) {
      const c = form[k];
      if (typeof c === 'string' && /^(offset|align)=\d+$/.test(c)) {
        const [, kk, v] = c.match(/^(offset|align)=(\d+)$/);
        if (kk === 'offset') offset = Number(v);
        else align = Number(v);
      } else {
        const tmp = [c];
        let j = 0;
        while (j < tmp.length) j = compileOne(tmp, j, ctx, out);
      }
    }
    out.push({ op: head, imm: { align, offset } });
    return i + 1;
  }
  if (kind === 'brtable') {
    // (br_table $l1 $l2 ... $default)
    const labels = form.slice(1).map((t) => ctx.labelDepth(t));
    const dflt = labels.pop();
    out.push({ op: head, imm: { targets: labels, default: dflt } });
    return i + 1;
  }
  if (kind === 'callindirect') {
    // (call_indirect $tbl? (type $t) operands...)
    let tableIdx = 0, typeIdx = null;
    const operands = [];
    for (let k = 1; k < form.length; k++) {
      const c = form[k];
      if (Array.isArray(c) && c[0] === 'type') {
        const tn = c[1];
        typeIdx = isName(tn) ? ctx.m.namedTypes.get(tn) : internTypeRef(ctx.m, Number(tn));
        if (typeIdx === undefined) throw new Error('[wat] unknown type ' + tn);
      } else if (isName(c) && typeIdx === null) {
        tableIdx = ctx.m.tableNames.get(c) || 0;
      } else operands.push(c);
    }
    if (typeIdx === null) throw new Error('[wat] call_indirect needs (type ..)');
    for (const o of operands) {
      const tmp = [o];
      let j = 0;
      while (j < tmp.length) j = compileOne(tmp, j, ctx, out);
    }
    out.push({ op: head, imm: { typeIdx, tableIdx } });
    return i + 1;
  }
  if (kind === 'blocktype') {
    // folded block/loop/if handled by compileBlock/compileIf; plain op here is flat
    throw new Error('[wat] unexpected folded ' + head);
  }
  throw new Error('[wat] folded imm not supported: ' + head);
}

// compile a single operand that must be an instruction (atom or folded list)
function compileOperand(c, ctx, out) {
  const tmp = [c];
  let j = 0;
  while (j < tmp.length) j = compileOne(tmp, j, ctx, out);
}

function internTypeRef(m, idx) { return idx; }

// ---- elem / data resolution ----
function resolveElem(m, f) {
  // (elem (i32.const 0) $f1 $f2) | (elem $t (i32.const 0) func $f1 ...)
  let k = 1;
  let table = 0;
  if (isName(f[k]) && m.tableNames.has(f[k])) { table = m.tableNames.get(f[k]); k++; }
  const offsetForm = f[k];
  if (!Array.isArray(offsetForm)) throw new Error('[wat] bad elem offset');
  const offset = compileBody([offsetForm], makeFuncCtx(m, null), m);
  k++;
  const funcs = [];
  for (; k < f.length; k++) {
    const c = f[k];
    if (c === 'func') continue;
    funcs.push(isName(c) ? m.funcNames.get(c) : Number(c));
  }
  return { table, offset, funcs };
}

function resolveData(m, f) {
  // (data $mem? (i32.const 0) "str" ...)
  let k = 1;
  let memory = 0;
  if (isName(f[k]) && m.memNames.has(f[k])) { memory = m.memNames.get(f[k]); k++; }
  const offsetForm = f[k];
  let offset;
  const strs = [];
  if (Array.isArray(offsetForm)) {
    offset = compileBody([offsetForm], makeFuncCtx(m, null), m);
    k++;
  } else {
    offset = [{ op: 'i32.const', imm: 0 }];
  }
  for (; k < f.length; k++) {
    const c = f[k];
    if (isStr(c)) strs.push(c.str);
    else throw new Error('[wat] bad data segment item');
  }
  return { memory, offset, bytes: dataBytes(strs) };
}
