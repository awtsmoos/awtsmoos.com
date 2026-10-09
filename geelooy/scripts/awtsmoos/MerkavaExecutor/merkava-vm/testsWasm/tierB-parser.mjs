// B"H — WASM tests Tier B: binary parser (20 tests).
const CHK = (name, check) => ({ name, check });

const MOD_WAT = '(module (func $a (export "add") (param i32 i32) (result i32) local.get 0 local.get 1 i32.add) (memory 1 2) (global $g i32 (i32.const 9)) (export "mem" (memory 0)) (export "g" (global $g)) (data (i32.const 5) "hi"))';

export const tests = [
  CHK('magic accepted', async (api) => {
    const b = api.compileWatToBytes('(module)');
    return { pass: b[0] === 0 && b[1] === 0x61 && b[2] === 0x73 && b[3] === 0x6d };
  }),
  CHK('version is 1', async (api) => {
    const b = api.compileWatToBytes('(module)');
    const v = b[4] | (b[5] << 8) | (b[6] << 16) | (b[7] << 24);
    return { pass: v === 1 };
  }),
  CHK('bad magic rejected', async (api) => {
    const b = api.compileWatToBytes('(module)').slice();
    b[0] = 1;
    try { api.instantiateBytes(b); return { pass: false, why: 'no throw' }; }
    catch (e) { return { pass: e.code === 'bad-magic' }; }
  }),
  CHK('bad version rejected', async (api) => {
    const b = api.compileWatToBytes('(module)').slice();
    b[4] = 2;
    try { api.instantiateBytes(b); return { pass: false, why: 'no throw' }; }
    catch (e) { return { pass: e.code === 'bad-version' }; }
  }),
  CHK('truncated module rejected', async (api) => {
    const b = api.compileWatToBytes(MOD_WAT).slice(0, 20);
    try { api.instantiateBytes(b); return { pass: false, why: 'no throw' }; }
    catch (e) { return { pass: true }; }
  }),
  CHK('type section parsed', async (api) => {
    const m = api.parseModule(api.compileWatToBytes(MOD_WAT));
    return { pass: m.types.length === 1 && m.types[0].params.join() === 'i32,i32' && m.types[0].results.join() === 'i32' };
  }),
  CHK('func section parsed', async (api) => {
    const m = api.parseModule(api.compileWatToBytes(MOD_WAT));
    return { pass: m.funcs.length === 1 && m.funcs[0] === 0 };
  }),
  CHK('memory section min/max', async (api) => {
    const m = api.parseModule(api.compileWatToBytes(MOD_WAT));
    return { pass: m.memories.length === 1 && m.memories[0].min === 1 && m.memories[0].max === 2 };
  }),
  CHK('global section parsed', async (api) => {
    const m = api.parseModule(api.compileWatToBytes(MOD_WAT));
    return { pass: m.globals.length === 1 && m.globals[0].valtype === 'i32' && !m.globals[0].mutable };
  }),
  CHK('export section kinds', async (api) => {
    const m = api.parseModule(api.compileWatToBytes(MOD_WAT));
    const kinds = Object.fromEntries(m.exports.map((e) => [e.name, e.kind]));
    return { pass: kinds.add === 'func' && kinds.mem === 'memory' && kinds.g === 'global' };
  }),
  CHK('data section bytes', async (api) => {
    const m = api.parseModule(api.compileWatToBytes(MOD_WAT));
    return { pass: m.datas.length === 1 && m.datas[0].bytes.length === 2 && m.datas[0].bytes[0] === 104 && m.datas[0].bytes[1] === 105 };
  }),
  CHK('code section body ends with end', async (api) => {
    const m = api.parseModule(api.compileWatToBytes(MOD_WAT));
    const c = m.codes[0];
    return { pass: c.code[c.code.length - 1] === 0x0b && c.locals.length === 0 };
  }),
  CHK('custom section skipped', async (api) => {
    // build module with custom section 0 prepended by hand
    const core = api.compileWatToBytes('(module (func (export "m") (result i32) (i32.const 3)))');
    const body = core.slice(8);
    const name = [4, 116, 101, 115, 116]; // "test"
    const payload = [name.length, ...name, 9, 9, 9];
    const custom = [0, payload.length, ...payload];
    const withCustom = new Uint8Array([0, 0x61, 0x73, 0x6d, 1, 0, 0, 0, ...custom, ...body]);
    const m = api.parseModule(withCustom);
    return { pass: m.exports.length === 1 && api.callExport(api.instantiate(m), 'm', [])[0] === 3 };
  }),
  CHK('out-of-order sections rejected', async (api) => {
    const simple = api.compileWatToBytes('(module (func (export "m") (result i32) (i32.const 3)))');
    // split into raw sections: id + size + payload
    let pos = 8;
    const secs = [];
    while (pos < simple.length) {
      const start = pos;
      const id = simple[pos++];
      let sz = 0, sh = 0, by;
      do { by = simple[pos++]; sz |= (by & 0x7f) << sh; sh += 7; } while (by & 0x80);
      pos += sz;
      secs.push(simple.slice(start, pos));
    }
    // rebuild with sections fully reversed (export before type/func -> order violation)
    const rev = new Uint8Array(simple.length);
    rev.set(simple.slice(0, 8), 0);
    let w = 8;
    for (let i = secs.length - 1; i >= 0; i--) { rev.set(secs[i], w); w += secs[i].length; }
    try { api.parseModule(rev); return { pass: false, why: 'no throw' }; }
    catch (e) { return { pass: e.code === 'order' }; }
  }),
  CHK('empty code section ok', async (api) => {
    const m = api.parseModule(api.compileWatToBytes('(module (memory 1))'));
    return { pass: m.codes.length === 0 && m.memories.length === 1 };
  }),
  CHK('import section parsed', async (api) => {
    const m = api.parseModule(api.compileWatToBytes('(module (import "e" "f" (func (param i32) (result i64))))'));
    return { pass: m.imports.length === 1 && m.imports[0].module === 'e' && m.imports[0].name === 'f' && m.imports[0].type === 0 };
  }),
  CHK('start section parsed', async (api) => {
    const m = api.parseModule(api.compileWatToBytes('(module (func $s) (start $s))'));
    return { pass: m.start === 0 };
  }),
  CHK('table+elem parsed', async (api) => {
    const m = api.parseModule(api.compileWatToBytes('(module (table 2 funcref) (func $a) (elem (i32.const 0) $a))'));
    return { pass: m.tables.length === 1 && m.tables[0].min === 2 && m.elems.length === 1 && m.elems[0].funcs[0] === 0 };
  }),
  CHK('multi section order ok', async (api) => {
    const m = api.parseModule(api.compileWatToBytes(MOD_WAT));
    return { pass: m.exports.length === 3 };
  }),
  CHK('data offset expr parsed', async (api) => {
    const m = api.parseModule(api.compileWatToBytes(MOD_WAT));
    return { pass: m.datas[0].offset.code[0] === 0x41 }; // i32.const
  }),
];
