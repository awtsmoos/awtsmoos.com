// B"H — WASM tests Tier J: full programs (25 tests).
const T = (name, wat, exp, args = [], expect = [0], extra = {}) => ({ name, wat, export: exp, args, expect, ...extra });

// prime sieve: count primes < 100 using memory as bitset
const SIEVE = `(module (memory 1)
  (func (export "sieve") (param i32) (result i32)
    (local $i i32) (local $j i32) (local $count i32)
    (local.set $i (i32.const 2))
    (loop $init
      (i32.store8 (local.get $i) (i32.const 1))
      (local.set $i (i32.add (local.get $i) (i32.const 1)))
      (br_if $init (i32.lt_u (local.get $i) (local.get 0))))
    (local.set $i (i32.const 2))
    (loop $outer
      (if (i32.load8_u (local.get $i))
        (then
          (local.set $j (i32.mul (local.get $i) (i32.const 2)))
          (loop $inner
            (i32.store8 (local.get $j) (i32.const 0))
            (local.set $j (i32.add (local.get $j) (local.get $i)))
            (br_if $inner (i32.lt_u (local.get $j) (local.get 0))))))
      (local.set $i (i32.add (local.get $i) (i32.const 1)))
      (br_if $outer (i32.lt_u (local.get $i) (local.get 0))))
    (local.set $i (i32.const 2))
    (loop $count
      (if (i32.load8_u (local.get $i)) (then (local.set $count (i32.add (local.get $count) (i32.const 1)))))
      (local.set $i (i32.add (local.get $i) (i32.const 1)))
      (br_if $count (i32.lt_u (local.get $i) (local.get 0))))
    (local.get $count)))`;

export const tests = [
  T('sieve primes<100', SIEVE, 'sieve', [100], [25], { xcheck: true }),
  T('sieve primes<30', SIEVE, 'sieve', [30], [10], { xcheck: true }),
  T('iterative fib 30', `(module (func (export "f") (param i32) (result i32) (local $a i32) (local $b i32) (local $t i32) (local.set $b (i32.const 1)) (block $done (loop $l (br_if $done (i32.eqz (local.get 0))) (local.set $t (i32.add (local.get $a) (local.get $b))) (local.set $a (local.get $b)) (local.set $b (local.get $t)) (local.set 0 (i32.sub (local.get 0) (i32.const 1))) (br $l))) (local.get $a)))`, 'f', [30], [832040], { xcheck: true }),
  T('power loop', `(module (func (export "p") (param i32 i32) (result i32) (local $r i32) (local.set $r (i32.const 1)) (block $done (loop $l (br_if $done (i32.eqz (local.get 1))) (local.set $r (i32.mul (local.get $r) (local.get 0))) (local.set 1 (i32.sub (local.get 1) (i32.const 1))) (br $l))) (local.get $r)))`, 'p', [2, 20], [1048576], { xcheck: true }),
  T('sum array in memory', `(module (memory 1) (data (i32.const 0) "\\01\\00\\00\\00\\02\\00\\00\\00\\03\\00\\00\\00\\04\\00\\00\\00\\05\\00\\00\\00") (func (export "s") (result i32) (local $i i32) (local $t i32) (loop $l (local.set $t (i32.add (local.get $t) (i32.load (i32.mul (local.get $i) (i32.const 4))))) (local.set $i (i32.add (local.get $i) (i32.const 1))) (br_if $l (i32.lt_u (local.get $i) (i32.const 5)))) (local.get $t)))`, 's', [], [15], { xcheck: true }),
  T('f64 compound interest', `(module (func (export "ci") (param f64 f64 i32) (result f64) (local $i i32) (loop $l (local.set $i (i32.add (local.get $i) (i32.const 1))) (local.set 0 (f64.mul (local.get 0) (f64.add (f64.const 1) (local.get 1)))) (br_if $l (i32.lt_s (local.get $i) (local.get 2)))) (local.get 0)))`, 'ci', [1000, 0.05, 10], [(() => { let e = 1000; for (let k = 0; k < 10; k++) e = e * 1.05; return e; })()], { xcheck: true }),
  T('collatz steps', `(module (func (export "c") (param i32) (result i32) (local $n i32) (loop $l (if (i32.eq (local.get 0) (i32.const 1)) (then (return (local.get $n)))) (local.set 0 (select (i32.div_u (local.get 0) (i32.const 2)) (i32.add (i32.mul (local.get 0) (i32.const 3)) (i32.const 1)) (i32.eqz (i32.and (local.get 0) (i32.const 1))))) (local.set $n (i32.add (local.get $n) (i32.const 1))) (br $l)) (unreachable)))`, 'c', [27], [111], { xcheck: true }),
  T('is prime trial', `(module (func $p (export "prime") (param i32) (result i32) (local $d i32) (if (i32.lt_s (local.get 0) (i32.const 2)) (then (return (i32.const 0)))) (local.set $d (i32.const 2)) (loop $l (if (i32.ge_u (i32.mul (local.get $d) (local.get $d)) (local.get 0)) (then (return (i32.const 1)))) (if (i32.eqz (i32.rem_u (local.get 0) (local.get $d))) (then (return (i32.const 0)))) (local.set $d (i32.add (local.get $d) (i32.const 1))) (br $l)) (i32.const 0)))`, 'prime', [97], [1], { xcheck: true }),
  T('is prime composite', `(module (func $p (export "prime") (param i32) (result i32) (local $d i32) (if (i32.lt_s (local.get 0) (i32.const 2)) (then (return (i32.const 0)))) (local.set $d (i32.const 2)) (loop $l (if (i32.ge_u (i32.mul (local.get $d) (local.get $d)) (local.get 0)) (then (return (i32.const 1)))) (if (i32.eqz (i32.rem_u (local.get 0) (local.get $d))) (then (return (i32.const 0)))) (local.set $d (i32.add (local.get $d) (i32.const 1))) (br $l)) (i32.const 0)))`, 'prime', [100], [0], { xcheck: true }),
  T('ackermann 2,3', `(module (func $a (export "a") (param i32 i32) (result i32) (if (result i32) (i32.eqz (local.get 0)) (then (i32.add (local.get 1) (i32.const 1))) (else (if (result i32) (i32.eqz (local.get 1)) (then (call $a (i32.sub (local.get 0) (i32.const 1)) (i32.const 1))) (else (call $a (i32.sub (local.get 0) (i32.const 1)) (call $a (local.get 0) (i32.sub (local.get 1) (i32.const 1))))))))))`, 'a', [2, 3], [9], { xcheck: true }),
  T('string compare eq', `(module (memory 1) (data (i32.const 0) "abc\\00") (data (i32.const 16) "abc\\00") (func (export "cmp") (param i32 i32) (result i32) (local $i i32) (loop $l (local.set $i (i32.add (local.get $i) (i32.const 1))) (if (i32.ne (i32.load8_u (i32.add (local.get 0) (local.get $i))) (i32.load8_u (i32.add (local.get 1) (local.get $i)))) (then (return (i32.const 1)))) (br_if $l (i32.load8_u (i32.add (local.get 0) (local.get $i))))) (i32.const 0)))`, 'cmp', [0, 16], [0], { xcheck: true }),
  T('string compare ne', `(module (memory 1) (data (i32.const 0) "abc\\00") (data (i32.const 16) "abd\\00") (func (export "cmp") (param i32 i32) (result i32) (local $i i32) (loop $l (if (i32.ne (i32.load8_u (i32.add (local.get 0) (local.get $i))) (i32.load8_u (i32.add (local.get 1) (local.get $i)))) (then (return (i32.const 1)))) (local.set $i (i32.add (local.get $i) (i32.const 1))) (br_if $l (i32.load8_u (i32.add (local.get 0) (local.get $i))))) (i32.const 0)))`, 'cmp', [0, 16], [1], { xcheck: true }),
  T('bubble sort 5', `(module (memory 1)
    (data (i32.const 0) "\\05\\00\\00\\00\\04\\00\\00\\00\\03\\00\\00\\00\\02\\00\\00\\00\\01\\00\\00\\00")
    (func (export "sort") (result i32) (local $i i32) (local $j i32) (local $t i32)
      (loop $o
        (local.set $j (i32.const 0))
        (loop $in
          (if (i32.gt_s
                (i32.load (i32.mul (local.get $j) (i32.const 4)))
                (i32.load (i32.mul (i32.add (local.get $j) (i32.const 1)) (i32.const 4))))
            (then
              (local.set $t (i32.load (i32.mul (local.get $j) (i32.const 4))))
              (i32.store (i32.mul (local.get $j) (i32.const 4))
                (i32.load (i32.mul (i32.add (local.get $j) (i32.const 1)) (i32.const 4))))
              (i32.store (i32.mul (i32.add (local.get $j) (i32.const 1)) (i32.const 4))
                (local.get $t))))
          (local.set $j (i32.add (local.get $j) (i32.const 1)))
          (br_if $in (i32.lt_u (local.get $j) (i32.const 4))))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br_if $o (i32.lt_u (local.get $i) (i32.const 5))))
      (i32.load (i32.const 16))))`, 'sort', [], [5], { xcheck: true }),
  T('fizzbuzz count 15', `(module (func (export "fb") (result i32) (local $i i32) (local $c i32) (loop $l (local.set $i (i32.add (local.get $i) (i32.const 1))) (if (i32.eqz (i32.rem_u (local.get $i) (i32.const 15))) (then (local.set $c (i32.add (local.get $c) (i32.const 1))))) (br_if $l (i32.lt_u (local.get $i) (i32.const 100)))) (local.get $c)))`, 'fb', [], [6], { xcheck: true }),
  T('i64 fibonacci', `(module (func (export "f") (param i64) (result i64) (local $a i64) (local $b i64) (local $t i64) (local.set $b (i64.const 1)) (block $done (loop $l (br_if $done (i64.eqz (local.get 0))) (local.set $t (i64.add (local.get $a) (local.get $b))) (local.set $a (local.get $b)) (local.set $b (local.get $t)) (local.set 0 (i64.sub (local.get 0) (i64.const 1))) (br $l))) (local.get $a)))`, 'f', [50n], [12586269025n], { xcheck: true }),
  T('dispatch via br_table', `(module (func (export "op") (param i32 i32 i32) (result i32) (block $out (result i32) (block $case2 (block $case1 (block $case0 (local.get 0) (br_table $case0 $case1 $case2)) (i32.sub (local.get 1) (local.get 2)) (br $out)) (i32.mul (local.get 1) (local.get 2)) (br $out)) (i32.add (local.get 1) (local.get 2)))))`, 'op', [1, 6, 7], [42], { xcheck: true }),
  T('dispatch default', `(module (func (export "op") (param i32 i32 i32) (result i32) (block $out (result i32) (block $case2 (block $case1 (block $case0 (local.get 0) (br_table $case0 $case1 $case2)) (i32.sub (local.get 1) (local.get 2)) (br $out)) (i32.mul (local.get 1) (local.get 2)) (br $out)) (i32.add (local.get 1) (local.get 2)))))`, 'op', [9, 6, 7], [13], { xcheck: true }),
  T('dispatch sub', `(module (func (export "op") (param i32 i32 i32) (result i32) (block $out (result i32) (block $case2 (block $case1 (block $case0 (local.get 0) (br_table $case0 $case1 $case2)) (i32.sub (local.get 1) (local.get 2)) (br $out)) (i32.mul (local.get 1) (local.get 2)) (br $out)) (i32.add (local.get 1) (local.get 2)))))`, 'op', [0, 6, 7], [-1], { xcheck: true }),
  T('horner polynomial', `(module (func (export "h") (param i32) (result i32) ;; 3x^3+2x^2+x+5 at x
    (i32.add (i32.const 5) (i32.mul (local.get 0) (i32.add (i32.const 1) (i32.mul (local.get 0) (i32.add (i32.const 2) (i32.mul (i32.const 3) (local.get 0)))))))))`, 'h', [2], [3 * 8 + 2 * 4 + 2 + 5], { xcheck: true }),
  T('abs via select', `(module (func (export "a") (param i32) (result i32) (select (i32.sub (i32.const 0) (local.get 0)) (local.get 0) (i32.lt_s (local.get 0) (i32.const 0)))))`, 'a', [-42], [42], { xcheck: true }),
  T('max via select', `(module (func (export "mx") (param i32 i32) (result i32) (select (local.get 0) (local.get 1) (i32.gt_s (local.get 0) (local.get 1)))))`, 'mx', [3, 7], [7], { xcheck: true }),
  T('countdown sum i64', `(module (func (export "s") (param i64) (result i64) (local $t i64) (local $c i32) (local.set $c (i32.const 100000)) (loop $l (local.set $t (i64.add (local.get $t) (local.get 0))) (local.set 0 (i64.sub (local.get 0) (i64.const 1))) (local.set $c (i32.sub (local.get $c) (i32.const 1))) (br_if $l (local.get $c))) (local.get $t)))`, 's', [100000n], [5000050000n], { xcheck: true }),
  T('nested calls pyramid', `(module (func $l3 (param i32) (result i32) (i32.mul (local.get 0) (i32.const 2))) (func $l2 (param i32) (result i32) (i32.add (call $l3 (local.get 0)) (call $l3 (local.get 0)))) (func $l1 (param i32) (result i32) (i32.add (call $l2 (local.get 0)) (call $l2 (local.get 0)))) (func (export "m") (param i32) (result i32) (call $l1 (local.get 0))))`, 'm', [5], [40], { xcheck: true }),
  T('while-style search', `(module (memory 1) (data (i32.const 0) "\\00\\00\\00\\00\\x2a\\00\\00\\00\\00\\00\\00\\00") (func (export "find") (result i32) (local $i i32) (loop $l (if (i32.eq (i32.load (i32.mul (local.get $i) (i32.const 4))) (i32.const 42)) (then (return (local.get $i)))) (local.set $i (i32.add (local.get $i) (i32.const 1))) (br_if $l (i32.lt_u (local.get $i) (i32.const 3)))) (i32.const -1)))`, 'find', [], [1], { xcheck: true }),
  T('swap via memory', `(module (memory 1) (func $sw (export "sw") (param i32 i32) (local $t i32) (local.set $t (i32.load (local.get 0))) (i32.store (local.get 0) (i32.load (local.get 1))) (i32.store (local.get 1) (local.get $t))) (func (export "m") (result i32) (i32.store (i32.const 0) (i32.const 10)) (i32.store (i32.const 4) (i32.const 20)) (call $sw (i32.const 0) (i32.const 4)) (i32.add (i32.load (i32.const 0)) (i32.load (i32.const 4)))))`, 'm', [], [30], { xcheck: true }),
  T('recursive sum', `(module (func $s (export "s") (param i32) (result i32) (if (result i32) (i32.eqz (local.get 0)) (then (i32.const 0)) (else (i32.add (local.get 0) (call $s (i32.sub (local.get 0) (i32.const 1))))))))`, 's', [100], [5050], { xcheck: true }),
  T('f64 distance', `(module (func (export "d") (param f64 f64 f64 f64) (result f64) (f64.sqrt (f64.add (f64.mul (f64.sub (local.get 0) (local.get 2)) (f64.sub (local.get 0) (local.get 2))) (f64.mul (f64.sub (local.get 1) (local.get 3)) (f64.sub (local.get 1) (local.get 3)))))))`, 'd', [0, 0, 3, 4], [5], { xcheck: true }),
];
