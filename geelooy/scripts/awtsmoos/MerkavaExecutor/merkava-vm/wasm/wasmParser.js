// B"H — WebAssembly binary format parser (from scratch).
// Parses magic, version, and sections 0-11 into a module object.
import { makeReader } from './leb128.js';
import { VALTYPE } from './wasmOpcodes.js';

const MAGIC = [0x00, 0x61, 0x73, 0x6D];

function valtypeName(code) {
  const n = VALTYPE[code];
  if (!n) throw new Error('[wasm] bad valtype 0x' + code.toString(16));
  return n;
}

function parseLimits(r) {
  const flags = r.u8();
  const min = r.u32();
  const max = (flags & 1) ? r.u32() : null;
  return { min, max };
}

function parseTypeSection(r) {
  const n = r.u32();
  const types = [];
  for (let i = 0; i < n; i++) {
    const tag = r.u8();
    if (tag !== 0x60) throw new Error('[wasm] bad functype tag');
    const pn = r.u32();
    const params = [];
    for (let j = 0; j < pn; j++) params.push(valtypeName(r.u8()));
    const rn = r.u32();
    const results = [];
    for (let j = 0; j < rn; j++) results.push(valtypeName(r.u8()));
    types.push({ params, results });
  }
  return types;
}

function parseImportSection(r) {
  const n = r.u32();
  const imports = [];
  for (let i = 0; i < n; i++) {
    const module = r.name();
    const name = r.name();
    const kind = r.u8();
    let desc;
    if (kind === 0x00) desc = { kind: 'func', type: r.u32() };
    else if (kind === 0x01) desc = { kind: 'table', elemType: r.u8(), limits: parseLimits(r) };
    else if (kind === 0x02) desc = { kind: 'memory', limits: parseLimits(r) };
    else if (kind === 0x03) {
      const vt = valtypeName(r.u8());
      const mut = r.u8();
      desc = { kind: 'global', valtype: vt, mutable: mut === 1 };
    } else throw new Error('[wasm] bad import kind ' + kind);
    imports.push({ module, name, ...desc });
  }
  return imports;
}

function parseVecU32(r) {
  const n = r.u32();
  const out = [];
  for (let i = 0; i < n; i++) out.push(r.u32());
  return out;
}

function parseExportSection(r) {
  const n = r.u32();
  const exports = [];
  for (let i = 0; i < n; i++) {
    const name = r.name();
    const kind = r.u8();
    const index = r.u32();
    const kinds = ['func', 'table', 'memory', 'global'];
    exports.push({ name, kind: kinds[kind], index });
  }
  return exports;
}

function parseGlobalSection(r) {
  const n = r.u32();
  const globals = [];
  for (let i = 0; i < n; i++) {
    const valtype = valtypeName(r.u8());
    const mutable = r.u8() === 1;
    const init = parseConstExpr(r);
    globals.push({ valtype, mutable, init });
  }
  return globals;
}

// Constant init expression: single const op + 0x0B end.
function parseConstExpr(r) {
  const op = r.u8();
  let value, type;
  if (op === 0x41) { type = 'i32'; value = r.s32(); }
  else if (op === 0x42) { type = 'i64'; value = r.s64(); }
  else if (op === 0x43) { type = 'f32'; value = r.f32(); }
  else if (op === 0x44) { type = 'f64'; value = r.f64(); }
  else if (op === 0x23) { type = 'globalref'; value = r.u32(); }
  else throw new Error('[wasm] bad const expr op 0x' + op.toString(16));
  const end = r.u8();
  if (end !== 0x0B) throw new Error('[wasm] const expr missing end');
  return { type, value };
}

function parseCodeSection(r) {
  const n = r.u32();
  const bodies = [];
  for (let i = 0; i < n; i++) {
    const size = r.u32();
    const start = r.pos;
    const localGroups = r.u32();
    const locals = [];
    for (let g = 0; g < localGroups; g++) {
      const count = r.u32();
      const vt = valtypeName(r.u8());
      for (let j = 0; j < count; j++) locals.push(vt);
    }
    const code = r.bytes(size - (r.pos - start));
    bodies.push({ locals, code });
  }
  return bodies;
}

function parseDataSection(r) {
  const n = r.u32();
  const segs = [];
  for (let i = 0; i < n; i++) {
    const flag = r.u32();
    if (flag === 0) {
      const offset = parseConstExpr(r);
      const size = r.u32();
      const bytes = r.bytes(size);
      segs.push({ active: true, memory: 0, offset, bytes });
    } else if (flag === 1) {
      const size = r.u32();
      const bytes = r.bytes(size);
      segs.push({ active: false, bytes });
    } else if (flag === 2) {
      const mem = r.u32();
      const offset = parseConstExpr(r);
      const size = r.u32();
      const bytes = r.bytes(size);
      segs.push({ active: true, memory: mem, offset, bytes });
    } else throw new Error('[wasm] unsupported data flag ' + flag);
  }
  return segs;
}

function parseElemSection(r) {
  const n = r.u32();
  const segs = [];
  for (let i = 0; i < n; i++) {
    const flag = r.u32();
    if (flag === 0) {
      const offset = parseConstExpr(r);
      const funcs = parseVecU32(r);
      segs.push({ active: true, table: 0, offset, funcs });
    } else throw new Error('[wasm] unsupported elem flag ' + flag);
  }
  return segs;
}

export function parseModule(bytes) {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const r = makeReader(buf);
  for (let i = 0; i < 4; i++) {
    if (r.u8() !== MAGIC[i]) throw new Error('[wasm] bad magic number');
  }
  const version = [r.u8(), r.u8(), r.u8(), r.u8()];
  if (version[0] !== 1 || version[1] !== 0 || version[2] !== 0 || version[3] !== 0) {
    throw new Error('[wasm] unsupported version');
  }
  const mod = {
    types: [], imports: [], funcs: [], tables: [], memories: [],
    globals: [], exports: [], start: null, elems: [], codes: [], datas: [],
  };
  while (r.remaining > 0) {
    const id = r.u8();
    const size = r.u32();
    const start = r.pos;
    const end = start + size;
    const sub = makeReader(buf.subarray(start, end));
    if (id === 0) {
      const nameLen = sub.u32();
      sub.bytes(nameLen); // custom section name, skipped
    } else if (id === 1) mod.types = parseTypeSection(sub);
    else if (id === 2) mod.imports = parseImportSection(sub);
    else if (id === 3) mod.funcs = parseVecU32(sub);
    else if (id === 4) {
      const n = sub.u32();
      for (let i = 0; i < n; i++) mod.tables.push({ elemType: sub.u8(), limits: parseLimits(sub) });
    } else if (id === 5) {
      const n = sub.u32();
      for (let i = 0; i < n; i++) mod.memories.push(parseLimits(sub));
    } else if (id === 6) mod.globals = parseGlobalSection(sub);
    else if (id === 7) mod.exports = parseExportSection(sub);
    else if (id === 8) mod.start = sub.u32();
    else if (id === 9) mod.elems = parseElemSection(sub);
    else if (id === 10) mod.codes = parseCodeSection(sub);
    else if (id === 11) mod.datas = parseDataSection(sub);
    else throw new Error('[wasm] unknown section id ' + id);
    if (sub.remaining !== 0) throw new Error('[wasm] section ' + id + ' has trailing bytes');
    r.bytes(size);
  }
  if (mod.funcs.length !== mod.codes.length) {
    throw new Error('[wasm] func/code count mismatch');
  }
  return mod;
}
