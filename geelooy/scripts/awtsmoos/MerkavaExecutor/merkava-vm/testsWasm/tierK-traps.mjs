// B"H — WASM tests Tier K: traps, imports, start, edge cases (15 tests).
const T = (name, wat, exp, args = [], expect = [0], extra = {}) => ({ name, wat, export: exp, args, expect, ...extra });
const TRAP = (name, wat, exp, args, code) => ({ name, wat, export: exp, args, expectTrap: code });
const CHK = (name, check) => ({ name, check });

export const tests = [
  TRAP('call stack underflow', '(module (func (export "m") (result i32) (i32.add)))', 'm', [], 'stack-underflow'),
  T('memory.grow negative returns -1', '(module (memory 1) (func (export "m") (result i32) (memory.grow (i32.const -1))))', 'm', [], [-1], { xcheck: true }),
  T('start + exports combined', '(module (global $c (mut i32) (i32.const 0)) (func $s (global.set $c (i32.add (global.get $c) (i32.const 1)))) (start $s) (func (export "c") (result i32) (global.get $c)))', 'c', [], [1], { xcheck: true }),
  CHK('imported memory shared', async (api) => {
    const mem = { bytes: new Uint8Array(65536) };
    const inst = api.instantiateWat('(module (import "e" "mem" (memory 1)) (func (export "w") (param i32) (i32.store (i32.const 0) (local.get 0))) (func (export "r") (result i32) (i32.load (i32.const 0))))', { e: { mem } });
    api.callExport(inst, 'w', [123]);
    const r = api.callExport(inst, 'r', []);
    return { pass: r[0] === 123 };
  }),
  CHK('step budget stops infinite loop', async (api) => {
    const inst = api.instantiateWat('(module (func (export "m") (loop (br 0))))', {}, { maxSteps: 1000 });
    try { api.callExport(inst, 'm', []); return { pass: false, why: 'no trap' }; }
    catch (e) { return { pass: e.code === 'timeout' }; }
  }),
  TRAP('type mismatch call args', '(module (func (export "m") (param i32) (result i32) (local.get 0)))', 'm', ['xx'], 'bad-arg'),
  T('export func by index', '(module (func (export "m") (result i32) (i32.const 8)) (export "n" (func 0)))', 'n', [], [8], { xcheck: true }),
  CHK('bridge adds hostAPI.wasm', async (api) => {
    const vm = {};
    api.bridgeMerkavaVM(vm);
    return { pass: !!vm.hostAPI && typeof vm.hostAPI.wasm.instantiateWat === 'function' };
  }),
  CHK('bridge runs wat end to end', async (api) => {
    const vm = {};
    const w = api.bridgeMerkavaVM(vm);
    const inst = w.instantiateWat('(module (func (export "d") (param i32) (result i32) (i32.mul (local.get 0) (i32.const 2))))');
    const r = w.callExport(inst, 'd', [21]);
    return { pass: r[0] === 42 };
  }),
  T('two memories', '(module (memory $a 1) (memory $b 1) (func (export "m") (result i32) (i32.const 1)))', 'm', [], [1], { onlyValidate: true }),
  TRAP('br_table bad depth traps', '(module (func (export "m") (param i32) (result i32) (block (local.get 0) (br_table 5))))', 'm', [0], 'bad-label'),
  T('locals default zero', '(module (func (export "m") (result i32 i64 f32 f64) (local i32) (local i64) (local f32) (local f64) (local.get 0) (local.get 1) (local.get 2) (local.get 3)))', 'm', [], [0, 0n, 0, 0], { xcheck: true }),
  T('params are locals', '(module (func (export "m") (param i32 i64) (result i64) (i64.add (i64.extend_i32_s (local.get 0)) (local.get 1))))', 'm', [5, 10n], [15n], { xcheck: true }),
  T('imported global mutable', '(module (import "e" "g" (global $g (mut i32))) (func (export "m") (result i32) (global.set $g (i32.const 11)) (global.get $g)))', 'm', [], [11], { imports: { e: { g: 0 } } }),
  CHK('native validate rejects bad magic', async (api) => {
    const b = api.compileWatToBytes('(module)');
    b[0] = 9;
    const r = api.nativeValidate(b);
    return { pass: r.supported ? r.valid === false : true };
  }),
];
