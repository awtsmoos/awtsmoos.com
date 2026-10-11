// B"H — WASM tests Tier A: WAT compiler + native validation (25 tests).
// Every emitted module must also pass the host's native WebAssembly.validate.
const T = (name, wat, exp, args = [], extra = {}) => ({ name, wat, export: exp, args, ...extra });
const TRAP = (name, wat, exp, args = [], code = null) => ({ name, wat, export: exp, args, expectTrap: code || true });
const CHK = (name, check) => ({ name, check });

export const tests = [
  T('empty module validates', '(module)', null, [], { onlyValidate: true }),
  T('add compiles+validates', '(module (func (export "add") (param i32 i32) (result i32) local.get 0 local.get 1 i32.add))', 'add', [40, 2], { expect: [42], xcheck: true }),
  T('folded form', '(module (func (export "f") (param i32) (result i32) (i32.add (local.get 0) (i32.const 1))))', 'f', [41], { expect: [42], xcheck: true }),
  T('named func and locals', '(module (func $a (export "a") (param $x i32) (param $y i32) (result i32) (i32.mul (local.get $x) (local.get $y))))', 'a', [6, 7], { expect: [42], xcheck: true }),
  T('two funcs with call', '(module (func $d (param i32) (result i32) (i32.mul (local.get 0) (i32.const 2))) (func (export "m") (param i32) (result i32) (call $d (local.get 0))))', 'm', [21], { expect: [42], xcheck: true }),
  T('memory and data segment', '(module (memory 1) (data (i32.const 0) "ABC") (func (export "ld") (result i32) (i32.load8_u (i32.const 1))))', 'ld', [], { expect: [66], xcheck: true }),
  T('global get', '(module (global $g i32 (i32.const 42)) (func (export "g") (result i32) (global.get $g)))', 'g', [], { expect: [42], xcheck: true }),
  T('mutable global set', '(module (global $g (mut i32) (i32.const 1)) (func (export "s") (param i32) (result i32) (global.set $g (local.get 0)) (global.get $g)))', 's', [99], { expect: [99], xcheck: true }),
  T('imported func call', '(module (import "env" "inc" (func $inc (param i32) (result i32))) (func (export "m") (param i32) (result i32) (call $inc (local.get 0))))', 'm', [41], { expect: [42], imports: { env: { inc: (x) => x + 1 } } }),
  T('start function runs', '(module (global $g (mut i32) (i32.const 0)) (func $s (global.set $g (i32.const 7))) (start $s) (func (export "g") (result i32) (global.get $g)))', 'g', [], { expect: [7], xcheck: true }),
  T('table + call_indirect', '(module (table 1 funcref) (elem (i32.const 0) $t) (func $t (param i32) (result i32) (i32.add (local.get 0) (i32.const 1))) (func (export "m") (param i32 i32) (result i32) (call_indirect (type $tt) (local.get 1) (local.get 0))) (type $tt (func (param i32) (result i32))))', 'm', [0, 41], { expect: [42], xcheck: true }),
  T('br_table', '(module (func (export "m") (param i32) (result i32) (block $b (local.get 0) (br_table $b $b) (i32.const 1) (return) ) (i32.const 42)))', 'm', [0], { expect: [42], xcheck: true }),
  T('named block loop labels', '(module (func (export "m") (result i32) (block $out (loop $in (br $out)) ) (i32.const 5)))', 'm', [], { expect: [5], xcheck: true }),
  T('if then else folded', '(module (func (export "m") (param i32) (result i32) (if (result i32) (local.get 0) (then (i32.const 1)) (else (i32.const 2)))))', 'm', [0], { expect: [2], xcheck: true }),
  T('if then else folded true', '(module (func (export "m") (param i32) (result i32) (if (result i32) (local.get 0) (then (i32.const 1)) (else (i32.const 2)))))', 'm', [9], { expect: [1], xcheck: true }),
  T('memory.size initial', '(module (memory 3) (func (export "m") (result i32) (memory.size)))', 'm', [], { expect: [3], xcheck: true }),
  T('memory.grow', '(module (memory 1 4) (func (export "m") (result i32) (memory.grow (i32.const 2)) (drop) (memory.size)))', 'm', [], { expect: [3], xcheck: true }),
  T('i64 const big', '(module (func (export "m") (result i64) (i64.const 9223372036854775807)))', 'm', [], { expect: [9223372036854775807n], xcheck: true }),
  T('f32 const', '(module (func (export "m") (result f32) (f32.const 0.5)))', 'm', [], { expect: [0.5], xcheck: true }),
  T('f64 const pi', '(module (func (export "m") (result f64) (f64.const 3.141592653589793)))', 'm', [], { expect: [Math.PI], xcheck: true }),
  T('data escapes', '(module (memory 1) (data (i32.const 10) "\\00\\41\\n") (func (export "m") (result i32) (i32.add (i32.load8_u (i32.const 10)) (i32.add (i32.load8_u (i32.const 11)) (i32.load8_u (i32.const 12))))))', 'm', [], { expect: [0 + 65 + 10], xcheck: true }),
  T('deep folded nesting', '(module (func (export "m") (result i32) (i32.add (i32.add (i32.add (i32.const 1) (i32.const 2)) (i32.const 3)) (i32.const 4))))', 'm', [], { expect: [10], xcheck: true }),
  T('export memory', '(module (memory 2) (export "mem" (memory 0)) (func (export "m") (result i32) (i32.const 1)))', 'm', [], { expect: [1], xcheck: true }),
  T('type dedup two sigs', '(module (func $a (param i32) (result i32) (local.get 0)) (func $b (param i32) (result i32) (local.get 0)) (func (export "m") (result i32) (i32.const 1)))', 'm', [], {
    expect: [1],
    checkTypes: 2,
  }),
  CHK('syntax error unbalanced', async (api) => {
    try { api.compileWatToBytes('(module (func)'); return { pass: false, why: 'no throw' }; }
    catch (e) { return { pass: true }; }
  }),
  CHK('unknown opcode throws', async (api) => {
    try { api.compileWatToBytes('(module (func (export "m") frobnicate))'); return { pass: false, why: 'no throw' }; }
    catch (e) { return { pass: true }; }
  }),
  CHK('unknown func name throws', async (api) => {
    try { api.compileWatToBytes('(module (func (export "m") (call $nope)))'); return { pass: false, why: 'no throw' }; }
    catch (e) { return { pass: true }; }
  }),
];
