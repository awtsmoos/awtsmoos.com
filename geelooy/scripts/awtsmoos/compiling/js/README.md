B"H

# Merkava JS → Native Tier (`geelooy/scripts/awtsmoos/compiling/js/`)

The Merkava JS VM (`thread.js`) is a bytecode interpreter written in JavaScript,
running on top of V8. An interpreter layered on V8 can never beat V8. This
directory implements the **native tier**: integer-subset JavaScript compiled
directly to portable x86_64 assembly, assembled and linked by the self-hosted
Awtsmoos toolchain (`compileNativeAsm`) into real machine code.

## Modules

- **`asm.js`** — the fast tier. JS integer subset → x86_64 assembly directly.
  Register-resident codegen, no C involved.
- **`transpile.js`** — JS integer subset → C (via the self-hosted C compiler).
  Slower path, kept for completeness.
- **`native.js`** — C → x86_64 ELF → run → parse integer result.

## Supported subset (asm.js v1)

- Integer arithmetic: `+ - * / % & | ^ << >> >>>`, unary `- ~ !`
- Comparisons fused into jumps; ternary `?:`; `&&`/`||` with JS value semantics
- `var`, functions + recursion, `if/while/for/break/continue`, `return`
- Fixed-shape objects: `var o={x:1,y:2}` → stack-allocated, fields at fixed
  offsets (compile-time hidden classes). `o.x` loads/stores, `o.x++`, `o.x+=`.
- Calls: up to 6 integer args, direct calls only (no closures, no method calls)
- `/` is truncating; `%` matches JS (incl. negatives); `>>>` is ToUint32
- No: strings, arrays, heap allocation, closures, exceptions, floats, objects
  with dynamic shape, `new`, method calls

All values are signed 64-bit. Literals must fit int64.

## Optimizations

- **Register pinning**: locals pinned to callee-saved regs (RBX/R12–R15); no
  memory traffic for ≤5 locals.
- **Comparison fusion**: `if (a<b)` → `CMP+JL`, no boolean materialization.
- **Void-context DCE**: expression statements skip dead value copies.
- **Call args**: evaluated straight into RDI/RSI/… (no PUSH/POP) when call-free.
- **Barrett reduction**: `n % constant` → multiply-based, no IDIV (~3x faster).
  Branchless abs via sign mask. Verified against V8 on 164 (n,d) pairs.
- **LEA peephole**: `(reg*C)+K` → single LEA for C∈{3,5,9}.
- **Constant shifts** folded; `x%1` → 0.

## Correctness

Every optimization is differentially tested against V8 (`new Function`):
- `~/workspace/js-vs-v8/barrett-test.mjs` — 164 (n,d) modulo cases
- `~/workspace/js-vs-v8/obj-test.mjs` — object field cases
- `~/workspace/js-vs-v8/lea-test.mjs` — LEA peephole cases

## Benchmarks

`~/workspace/js-vs-v8/native-vs-v8.mjs` — native tier vs V8, best-of-N.
The official suite (`~/workspace/benchmarks/merkava-js.mjs`) measures the native
tier automatically for compilable kernels (`nativeResults`), using in-process
`repeat=` to amortize process-spawn overhead.

## Entry points

```js
import { compileJsToNativeAsm } from ".../compiling/js/asm.js";
// entry=null: auto-wrap top-level statements into __merkava_kernel
// opts={repeat:n}: run entry n times per process (benchmarking)
const { path, asm, compileMs } = await compileJsToNativeAsm(jsSource, null, { repeat: 100 });
```

## Roadmap

- v2: fixed-size arrays (stack), more object shapes
- v3: heap allocation (brk/mmap via `__awtsmoos_syscall3`) for dynamic arrays/strings
- In-process JIT (remove spawn overhead entirely)
- Upstream peepholes (comparison fusion, Barrett) into the C backend's x86_64 emitter
