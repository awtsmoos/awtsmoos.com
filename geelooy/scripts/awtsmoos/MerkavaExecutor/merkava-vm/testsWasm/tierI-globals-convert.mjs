// B"H — WASM tests Tier I: globals + numeric conversions (20 tests).
const T = (name, wat, exp, args = [], expect = [0], extra = {}) => ({ name, wat, export: exp, args, expect, ...extra });
const TRAP = (name, wat, exp, args, code) => ({ name, wat, export: exp, args, expectTrap: code });

export const tests = [
  T('i32.wrap_i64', '(module (func (export "m") (param i64) (result i32) (i32.wrap_i64 (local.get 0))))', 'm', [0x1FFFFFFFFn], [0xFFFFFFFF | 0], { xcheck: true }),
  T('i64.extend_i32_s', '(module (func (export "m") (param i32) (result i64) (i64.extend_i32_s (local.get 0))))', 'm', [-42], [-42n], { xcheck: true }),
  T('i64.extend_i32_u', '(module (func (export "m") (param i32) (result i64) (i64.extend_i32_u (local.get 0))))', 'm', [-42], [0xFFFFFFD6n], { xcheck: true }),
  T('i32.trunc_f64_s', '(module (func (export "m") (param f64) (result i32) (i32.trunc_f64_s (local.get 0))))', 'm', [3.99], [3], { xcheck: true }),
  T('i32.trunc_f64_s neg', '(module (func (export "m") (param f64) (result i32) (i32.trunc_f64_s (local.get 0))))', 'm', [-3.99], [-3], { xcheck: true }),
  T('i32.trunc_f64_u', '(module (func (export "m") (param f64) (result i32) (i32.trunc_f64_u (local.get 0))))', 'm', [4294967295], [-1], { xcheck: true }),
  T('i64.trunc_f64_s', '(module (func (export "m") (param f64) (result i64) (i64.trunc_f64_s (local.get 0))))', 'm', [-9e18], [-9000000000000000000n], { xcheck: true }),
  T('f64.convert_i32_s', '(module (func (export "m") (param i32) (result f64) (f64.convert_i32_s (local.get 0))))', 'm', [-42], [-42], { xcheck: true }),
  T('f64.convert_i32_u', '(module (func (export "m") (param i32) (result f64) (f64.convert_i32_u (local.get 0))))', 'm', [-1], [4294967295], { xcheck: true }),
  T('f32.convert_i64_s', '(module (func (export "m") (param i64) (result f32) (f32.convert_i64_s (local.get 0))))', 'm', [123456789n], [Math.fround(123456789)], { xcheck: true }),
  T('f64.promote_f32', '(module (func (export "m") (param f32) (result f64) (f64.promote_f32 (local.get 0))))', 'm', [0.1], [Math.fround(0.1)], { xcheck: true }),
  T('f32.demote_f64', '(module (func (export "m") (param f64) (result f32) (f32.demote_f64 (local.get 0))))', 'm', [0.1], [Math.fround(0.1)], { xcheck: true }),
  T('i32.reinterpret_f32', '(module (func (export "m") (param f32) (result i32) (i32.reinterpret_f32 (local.get 0))))', 'm', [1.0], [0x3F800000], { xcheck: true }),
  T('f32.reinterpret_i32', '(module (func (export "m") (param i32) (result f32) (f32.reinterpret_i32 (local.get 0))))', 'm', [0x3F800000], [1.0], { xcheck: true }),
  T('i64.reinterpret_f64', '(module (func (export "m") (param f64) (result i64) (i64.reinterpret_f64 (local.get 0))))', 'm', [1.0], [0x3FF0000000000000n], { xcheck: true }),
  TRAP('trunc NaN traps', '(module (func (export "m") (param f64) (result i32) (i32.trunc_f64_s (local.get 0))))', 'm', [NaN], 'invalid-conversion'),
  TRAP('trunc overflow traps', '(module (func (export "m") (param f64) (result i32) (i32.trunc_f64_s (local.get 0))))', 'm', [1e20], 'int-overflow'),
  TRAP('trunc neg overflow traps', '(module (func (export "m") (param f64) (result i32) (i32.trunc_f64_s (local.get 0))))', 'm', [-1e20], 'int-overflow'),
  T('global immutable read', '(module (global $g f64 (f64.const 2.5)) (func (export "m") (result f64) (global.get $g)))', 'm', [], [2.5], { xcheck: true }),
  T('global i64 init', '(module (global $g i64 (i64.const -7)) (func (export "m") (result i64) (global.get $g)))', 'm', [], [-7n], { xcheck: true }),
];
