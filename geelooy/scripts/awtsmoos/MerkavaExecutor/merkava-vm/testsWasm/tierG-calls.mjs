// B"H — WASM tests Tier G: calls, recursion, indirect, imports (20 tests).
const T = (name, wat, exp, args = [], expect = [0], extra = {}) => ({ name, wat, export: exp, args, expect, ...extra });

const FIB = `(func $fib (export "fib") (param i32) (result i32)
  (if (result i32) (i32.lt_s (local.get 0) (i32.const 2))
    (then (local.get 0))
    (else (i32.add (call $fib (i32.sub (local.get 0) (i32.const 1)))
                   (call $fib (i32.sub (local.get 0) (i32.const 2)))))))`;

export const tests = [
  T('fib 10', `(module ${FIB})`, 'fib', [10], [55], { xcheck: true }),
  T('fib 20', `(module ${FIB})`, 'fib', [20], [6765], { xcheck: true }),
  T('factorial rec', `(module (func $f (export "f") (param i32) (result i32) (if (result i32) (i32.le_s (local.get 0) (i32.const 1)) (then (i32.const 1)) (else (i32.mul (local.get 0) (call $f (i32.sub (local.get 0) (i32.const 1))))))))`, 'f', [10], [3628800], { xcheck: true }),
  T('mutual recursion', `(module (func $even (export "even") (param i32) (result i32) (if (result i32) (i32.eqz (local.get 0)) (then (i32.const 1)) (else (call $odd (i32.sub (local.get 0) (i32.const 1)))))) (func $odd (param i32) (result i32) (if (result i32) (i32.eqz (local.get 0)) (then (i32.const 0)) (else (call $even (i32.sub (local.get 0) (i32.const 1))))))`, 'even', [100], [1], { xcheck: true }),
  T('deep recursion 1000', `(module (func $d (export "d") (param i32) (result i32) (if (result i32) (i32.eqz (local.get 0)) (then (i32.const 0)) (else (i32.add (i32.const 1) (call $d (i32.sub (local.get 0) (i32.const 1))))))))`, 'd', [1000], [1000], { xcheck: true }),
  T('deep recursion 10000', `(module (func $d (export "d") (param i32) (result i32) (if (result i32) (i32.eqz (local.get 0)) (then (i32.const 0)) (else (i32.add (i32.const 1) (call $d (i32.sub (local.get 0) (i32.const 1))))))))`, 'd', [10000], [10000]),
  T('call chain 3 deep', `(module (func $a (param i32) (result i32) (i32.add (local.get 0) (i32.const 1))) (func $b (param i32) (result i32) (call $a (call $a (local.get 0)))) (func (export "m") (param i32) (result i32) (call $b (call $b (local.get 0)))))`, 'm', [0], [4], { xcheck: true }),
  T('call_indirect basic', `(module (type $t (func (param i32) (result i32))) (table 2 funcref) (elem (i32.const 0) $f $g) (func $f (param i32) (result i32) (i32.mul (local.get 0) (i32.const 2))) (func $g (param i32) (result i32) (i32.mul (local.get 0) (i32.const 3))) (func (export "m") (param i32 i32) (result i32) (call_indirect (type $t) (local.get 1) (local.get 0))))`, 'm', [0, 21], [42], { xcheck: true }),
  T('call_indirect second', `(module (type $t (func (param i32) (result i32))) (table 2 funcref) (elem (i32.const 0) $f $g) (func $f (param i32) (result i32) (i32.mul (local.get 0) (i32.const 2))) (func $g (param i32) (result i32) (i32.mul (local.get 0) (i32.const 3))) (func (export "m") (param i32 i32) (result i32) (call_indirect (type $t) (local.get 1) (local.get 0))))`, 'm', [1, 14], [42], { xcheck: true }),
  T('call_indirect oob traps', `(module (type $t (func (param i32) (result i32))) (table 1 funcref) (elem (i32.const 0) $f) (func $f (param i32) (result i32) (local.get 0)) (func (export "m") (param i32) (result i32) (call_indirect (type $t) (local.get 0) (i32.const 5))))`, 'm', [5], null, { expectTrap: 'uninitialized-table' }),
  T('call_indirect type mismatch traps', `(module (type $t (func (param i32) (result i32))) (type $u (func (param i32 i32) (result i32))) (table 1 funcref) (elem (i32.const 0) $f) (func $f (param i32 i32) (result i32) (i32.add (local.get 0) (local.get 1))) (func (export "m") (param i32) (result i32) (call_indirect (type $t) (local.get 0) (i32.const 0))))`, 'm', [0], null, { expectTrap: 'indirect-type-mismatch' }),
  T('imported func', `(module (import "e" "dbl" (func $d (param i32) (result i32))) (func (export "m") (param i32) (result i32) (call $d (local.get 0))))`, 'm', [21], [42], { imports: { e: { dbl: (x) => x * 2 } } }),
  T('imported then defined index order', `(module (import "e" "one" (func $one (result i32))) (func $two (result i32) (i32.const 2)) (func (export "m") (result i32) (i32.add (call $one) (call $two))))`, 'm', [], [3], { imports: { e: { one: () => 1 } } }),
  T('import throwing traps', `(module (import "e" "boom" (func $b)) (func (export "m") (call $b)))`, 'm', [], null, { expectTrap: 'import-threw', imports: { e: { boom: () => { throw new Error('x'); } } } }),
  T('missing import throws', `(module (import "e" "nope" (func $b)) (func (export "m") (call $b)))`, 'm', [], null, { expectTrap: true, skipInstantiate: false, imports: {} }),
  T('many args 6', `(module (func (export "m") (param i32 i32 i32 i32 i32 i32) (result i32) (i32.add (i32.add (i32.add (local.get 0) (local.get 1)) (i32.add (local.get 2) (local.get 3))) (i32.add (local.get 4) (local.get 5)))))`, 'm', [1, 2, 3, 4, 5, 6], [21], { xcheck: true }),
  T('multi result via locals', `(module (func $p (param i32) (result i32 i32) (local.get 0) (i32.add (local.get 0) (i32.const 1))) (func (export "m") (param i32) (result i32) (call $p (local.get 0)) (i32.add)))`, 'm', [20], [41], { xcheck: true }),
  T('recursive gcd', `(module (func $g (export "g") (param i32 i32) (result i32) (if (result i32) (i32.eqz (local.get 1)) (then (local.get 0)) (else (call $g (local.get 1) (i32.rem_u (local.get 0) (local.get 1)))))))`, 'g', [1071, 462], [21], { xcheck: true }),
  T('import global read', `(module (import "e" "k" (global $k i32)) (func (export "m") (result i32) (i32.mul (global.get $k) (i32.const 2))))`, 'm', [], [84], { imports: { e: { k: 42 } } }),
  T('void call no return', `(module (func $v (param i32) (drop (local.get 0))) (func (export "m") (result i32) (call $v (i32.const 5)) (i32.const 7)))`, 'm', [], [7], { xcheck: true }),
];
