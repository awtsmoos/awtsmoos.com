# B"H — NATIVE TIER v2 VERIFICATION SIGN-OFF (stream 8/8, the gatekeeper)

**Date:** 2026-10-09 ~13:32 EDT (matrix t0 17:32:29Z)
**Oracle:** V8 (`new Function`) — always. Never a stream's own claims.
**Machine load at measurement:** `17:32:29 up 30 min, load average: 7.73, 8.51, 7.97`
**Matrix:** `native-v2-matrix.mjs` → `native-v2-matrix-report.json`
**Verdict: 🔴 RED — nothing ships.** S1 goes back with 2 confirmed bugs; S3 and
S5 go back for object-model contract drift. Details below.

Byte-identical required: any mismatch = stream goes back, no exceptions.

---

## Per-stream sign-off table

| Stream | Feature | Status | Tests passed | Independent fuzz (vs V8) | Chrome ratio | Load at measurement |
|---|---|---|---|---|---|---|
| S1 | object model (`value-model.js` + `OBJECT_MODEL.md`) | 🔴 GOES BACK — 2 bugs | own: 212/212 ✅; mine: 22,501 pass / **2,007 fail** ❌ | 12,000 seeded cases (round-trip, truthiness, `===`, `typeof`, fixnum boundaries, holes) | n/a (spec + JS helpers, no codegen) | 7.73 |
| S2 | heap/GC (`heap.js`) | 🟡 LIBRARY — landed, not wired into `asm.js` | none (no test file) | n/a (not wired) | pending (not wired) | 7.73 |
| S3 | string codegen (`codegen-strings.js`) | 🔴 GOES BACK — contract drift | none (no test file) | 34,524 pass ✅ (unicode torture at model level; S3-native section pending wire-up) | pending (not wired) | 7.73 |
| S4 | array codegen (`codegen-arrays.js`) | 🟡 LIBRARY — landed, not wired | none (no test file) | 22,525 pass ✅ (sparse/hole arrays at model level; S4-native section pending) | pending (not wired) | 7.73 |
| S5 | object codegen (`codegen-objects.js`) | 🔴 GOES BACK — contract drift | none (no test file) | 41,503 pass ✅ (shape transitions at model level + **1,500 native v1 fixed-shape object programs byte-identical vs V8**) | pending (not wired) | 7.73 |
| S6 | JSON codegen | ⚪ PENDING — nothing landed | — | 40,000 pass ✅ (corpus validation at model level; 1,000-case corpus saved to `native-v2-json-corpus.json` for S6's arrival) | pending | 7.73 |
| S7 | tiering | ⚪ PENDING — nothing landed | — | — | pending | 7.73 |
| — | v1 baseline differential | ✅ GREEN | barrett/obj/lea all PASS | 164 + 7 + 7 cases vs V8 | — | 7.73 |
| — | stress 340, native-ON | ✅ GREEN | 28/28 byte-identical vs live V8, 0 mismatch (312 skipped: unsupported subset / non-integer) | — | — | 7.73 |
| — | stress 340, native-OFF | ✅ GREEN | **340/340 pass** through the interpreter (independent runner, same budgets as the suite's own) | — | — | 9.22 |
| — | benchmark gate (v1 kernels, informational) | ✅ measured | fib/arith/props compile+run | — | native-vs-V8: fib 0.63x, arith 0.04x, props 0.14x (v8 wins; v1 tier, high variance under load — NOT sign-off data) | 8.72 |

---

## 🔴 S1 — why it goes back (2 confirmed bugs, both reproduced)

**Bug 1 — `strictEqual` violates spec §12 rule 6 (cross-tag numerics).**
Spec: "Cross-tag number compare beyond rule 3 (e.g. `fixnum(5)` vs boxed `5.0`):
compare `Number(fixnum)` with the double bits; NaN → false." Differential-tested vs V8.
Implementation only handles the fixnum-0-vs-±0 sub-case and returns `false` for
everything else:
- `strictEqual(fixnum(5), boxed 5.0)` → `false`; V8 `5 === 5.0` → `true` ❌
- `strictEqual(fixnum(-7), boxed -7.0)` → `false`; V8 → `true` ❌
- `strictEqual(fixnum(2**40), boxed 2**40)` → `false`; V8 → `true` ❌
(5 vs 5.5 → false ✅, 5 vs NaN → false ✅, 0 vs ±0 ✅ — those are correct.)
This **will** arise in real codegen: any arithmetic stream result that is an
integer-valued double (e.g. `2*2.5`) compared against a fixnum. Fix: implement
rule 6 fully.

**Bug 2 — `encodeValue` throws RangeError on the double `2**60` instead of
boxing it.**
Guard: `js <= Number(FIXNUM_MAX)`. But `Number(FIXNUM_MAX)` = `Number(2**60 - 1)`
rounds **up** to the double `2**60` (prints as `1152921504606847000`). So the
double `2**60` passes the guard, then `fixnum(js)` does `BigInt(2**60) >
FIXNUM_MAX` → **throws**. Per spec §3 ("any integer op whose true result leaves
the range boxes a double"), `2**60` must encode as a boxed double, never throw.
Any JS program computing `2**60` crashes the encoder. Fix: the guard must be
`js < 2**60` (strict), not `js <= Number(FIXNUM_MAX)`.
Blast radius in the fuzz: 2,003 of 2,007 failures trace to this throw
(roundtrip 370, truthy 159, stricteq 1369, typeof 105).

**S1 re-entry criteria:** both fixed, then `native-v2-edge-valuemodel.mjs`
(12k cases) exits 0 and `value-model.test.mjs` still 212/212.

---

## 🔴 S3 / S5 — why they go back (object-model contract drift)

`value-model.js` is the declared **single source of truth** ("Every stream
(codegen, GC, runtime, harness) imports tag constants, header layouts, and
these encode/decode helpers from this file"). S3 and S5 do not conform:

**S3 (`codegen-strings.js`):**
1. `await import("../value-model.js")` — wrong path (file lives in the same
   directory; needs `"./"`). The import **always fails** and the module
   silently falls back to `LOCAL_VM` (`valueModelSource()` returns
   `"local-fallback"`). The "prefer the authoritative module" logic never runs.
2. `HTYPE_CONS = 8` **collides** with S1 `TYPE_SHAPE = 8`. A GC walking the
   heap cannot distinguish an S3 cons-string from an S1 shape.
3. Header is 8 bytes (`bits[7:0]` = type, `bits[63:8]` = meta) vs S1's 16-byte
   `[type u32, flags u32, meta u64]` — GC header parsing is incompatible.

**S5 (`codegen-objects.js`):**
1. Never imports `value-model.js` at all — a parallel model.
2. Own heap type ids: `3=object, 4=array, 5=string, 6=function, 7=undefined`
   vs S1 `1=string, 2=array, 3=object, 4=double, 5=closure`.
3. Own layout `[type, shapePtr, protoPtr, valuesPtr]` vs S1's 16-byte header +
   payload at +16. An S1-built heap is unreadable to S5 codegen and vice versa.

**Re-entry criteria:** import tag/type/header constants from `value-model.js`
(no silent fallbacks — fail loud if the import misses), use S1 header layout
and type ids, resolve the HTYPE_CONS/TYPE_SHAPE collision with S1.

**S2 note (not red, but must reconcile before integration):** `heap.js`
constant ids conform (1=string, 2=array, 3=object; 16-byte header), but the
**meta packing differs**: S1 array meta = `length(high32) | capacity(low32)`,
heap.js = `len(low32) | cap(high32)` (halves swapped); S1 string meta = length
in UTF-16 units, heap.js = `used_byte_len | (capacity_bytes << 32)`. Pick one;
S1 is the contract.

**S4 note:** constants conform via the correct `./value-model.js` import, but
it defines its own 24-byte header (`OFF_TYPE=0, OFF_LENGTH=8, OFF_CAPACITY=16,
OFF_ELEMS=24`) vs S1's 16-byte header — reconcile before integration.

---

## Independent edge suites (all new, seeded, vs V8)

| Suite | Cases | Result |
|---|---|---|
| `native-v2-edge-valuemodel.mjs` | 12,000 | ❌ 22,501 pass / 2,007 fail (the 2 S1 bugs) |
| `native-v2-edge-unicode.mjs` | 10,000 strings (+1,500 unit/slice checks) | ✅ 34,524 pass |
| `native-v2-edge-sparse.mjs` | 10,000 | ✅ 22,525 pass |
| `native-v2-edge-shapes.mjs` | 10,000 + 1,500 native | ✅ 41,503 pass (1,500 native v1 object programs byte-identical vs V8) |
| `native-v2-edge-json.mjs` | 10,000 | ✅ 40,000 pass; corpus saved |
| shared | `native-v2-prng.mjs` (seeded xorshift128+) | failures reproduce with `--seed` |

Each suite has a probe-gated `NATIVE_Sn` section that activates automatically
when the corresponding stream wires into `asm.js` — the differential coverage
is already written for S3/S4/S5/S6's arrival.

---

## Benchmark gate

Per-stream Chrome-vs-native ratios: **not yet measurable** — no stream with
codegen is wired end-to-end (S2–S5 are libraries; S6/S7 pending). Ratios will
be recorded per stream on wire-up, each with `uptime` at measurement; any
ratio taken at 1-min load ≥ 12 is REJECTED and re-run (matrix enforces this).
V8 here = Chrome's JS engine, measured in-process; true browser-Chrome numbers
come from the `chrome-vs-merkava-benchmark` cron.

**v1-kernel informational ratios** (official `benchmarks/merkava-js.mjs`,
load 8.72, best-of-7 V8 in-process, median of 3 runs):

| kernel | native | V8 | interpreter | V8/native |
|---|---|---|---|---|
| fib(22) | 0.69ms | 0.438ms | 465.2ms | 0.63x (V8 wins) |
| arith 200k | 14.43ms | 0.544ms | 608.6ms | 0.04x (V8 wins) |
| props 100k | 1.87ms | 0.26ms | 6334.7ms | 0.14x (V8 wins) |

These describe the v1 integer tier, not any v2 stream — they are baseline
context only, not sign-off data. High run-to-run variance under machine load;
re-measure on quiet machine before quoting.

**Gate integrity note (2026-10-09 ~13:34 EDT):** one benchmark invocation
returned `n:0`/null medians (interpreter flaked under load 9.91) while the
matrix initially recorded unexplained non-null rows. Root causes fixed in the
matrix: (1) `benchGate` no longer `import`s `merkava-js.mjs` for its SCRIPTS
(the import executed the whole benchmark as a side effect) — it now reads the
generated `js-scripts.json`; (2) any null-median/flaked run is REJECTED, never
converted to rows. The numbers above are from a clean re-run through the
validated path.

## What "green" requires (per stream, before it ships)

1. Stream's own tests pass (spawned by the matrix, never edited).
2. The independent edge suite for that stream exits 0 (≥10k seeded cases vs V8).
3. Contract check vs `value-model.js` conforms (no drift).
4. Applicable stress-340 subset byte-identical vs live V8 in native-ON mode.
5. Benchmark ratio recorded with load < 12 (or re-run note).

**Current state: 1 of 7 streams complete (S1), and it goes back. 4 streams are
libraries awaiting wire-up + contract reconciliation. 2 not started.**
