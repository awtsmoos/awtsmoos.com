// B"H — Merkava WASM vs Node native WebAssembly: time + RAM benchmark.
// Measures wall time and heap delta for identical programs on both engines.
import * as w from './wasm/wasmRunner.js';

const FIB_REC = `(module (func $fib (export "fib") (param i32) (result i32)
  (if (result i32) (i32.lt_s (local.get 0) (i32.const 2))
    (then (local.get 0))
    (else (i32.add (call $fib (i32.sub (local.get 0) (i32.const 1)))
                   (call $fib (i32.sub (local.get 0) (i32.const 2))))))))`;

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

function heapMB() {
  if (global.gc) global.gc();
  return process.memoryUsage().heapUsed / 1048576;
}

async function benchOne(label, wat, exportName, args, iters) {
  const bytes = w.compileWatToBytes(wat);

  // --- ours ---
  const h0 = heapMB();
  const t0 = process.hrtime.bigint();
  const inst = w.instantiateWat(wat);
  const h1 = heapMB();
  let oursResult;
  for (let i = 0; i < iters; i++) oursResult = w.callExport(inst, exportName, args)[0];
  const t1 = process.hrtime.bigint();
  const h2 = heapMB();
  const oursMs = Number(t1 - t0) / 1e6;

  // --- native ---
  const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const h3 = heapMB();
  const t2 = process.hrtime.bigint();
  const nmod = await WebAssembly.compile(buf);
  const ninst = await WebAssembly.instantiate(nmod, {});
  const h4 = heapMB();
  let natResult;
  for (let i = 0; i < iters; i++) natResult = ninst.exports[exportName](...args);
  const t3 = process.hrtime.bigint();
  const h5 = heapMB();
  const natMs = Number(t3 - t2) / 1e6;

  const ok = String(oursResult) === String(natResult);
  console.log(`\n${label}  (result=${oursResult}, match=${ok})`);
  console.log(`  ours   : ${oursMs.toFixed(1)}ms total  heap+${(h1 - h0).toFixed(2)}MB instantiate  heap+${(h2 - h1).toFixed(2)}MB run`);
  console.log(`  native : ${natMs.toFixed(1)}ms total  heap+${(h4 - h3).toFixed(2)}MB instantiate  heap+${(h5 - h4).toFixed(2)}MB run`);
  console.log(`  time ratio (ours/native): ${(oursMs / natMs).toFixed(1)}x`);
  return { label, oursMs, natMs, oursHeap: (h2 - h0), natHeap: (h5 - h3) };
}

console.log('=== Merkava WASM vs Node native WebAssembly ===');
console.log(`node ${process.version}, heap baseline ${heapMB().toFixed(1)}MB`);
const results = [];
results.push(await benchOne('fib(25) recursive x3', FIB_REC, 'fib', [25], 3));
results.push(await benchOne('sieve(5000) x5', SIEVE, 'sieve', [5000], 5));
console.log('\nDone.');
