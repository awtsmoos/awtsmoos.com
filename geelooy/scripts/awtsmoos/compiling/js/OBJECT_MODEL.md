// B"H
# Merkava Native Tier v2 — Object Model Contract

**Status:** authoritative. Every v2 stream (codegen, GC, runtime, harness,
interop) conforms to this document. Disagreements are resolved by editing this
file, not by forking behavior.

**Companion:** `value-model.js` (same directory) — tag constants, header
layouts, and JS-side encode/decode helpers. Import it; do not re-derive the
numbers by hand.

**Scope:** the 64-bit value representation and heap object layouts used by the
JS→x86_64 native tier (`geelooy/scripts/awtsmoos/compiling/js/`) and the
marshal bridge to the `DefaultMerkavaHost` interpreter.

---

## CHANGELOG

- **v2.0.1 — 2026-10-09 (fix-up).** Two verified-by-differential bugs fixed:
  - *§12 rule 6 clarification:* `strictEqual` on cross-tag `fixnum` vs boxed
    double compared only the zero sub-case; all other integer-valued boxed
    doubles returned `false`. Rule 6 is exact: every fixnum is exactly
    representable as a double, so the protocol is `Number(fixnum) ===`
    the boxed double (`fixnum(5) === double(5.0)` → true; `NaN !== NaN`;
    `fixnum(0) === double(-0)` → true). Implementations must use genuinely
    boxed doubles (via `allocDouble`) when testing this path — `encodeValue`
    of an integer-valued number collapses to a fixnum and never exercises it.
  - *Encoder boundary rule:* the `encodeValue` number fast path used
    `js <= Number(FIXNUM_MAX)`, but the double `Number(2**60 - 1)` already
    rounds UP to `2**60`, which the guard admitted and `fixnum()` then
    rejected with `RangeError`. The rule is now strict: only doubles with
    `js < 2**60` take the fixnum path; `2**60` itself is boxed. (`2**60 - 1`
    is not a distinct double at all; the largest boxed double is `2**60`,
    the largest fixnum double is `2**60 - 256`.)
- **v2.0.0 — 2026-10-09 (HEAP-1, first draft).** Initial contract: 3-bit tags
  (`000` fixnum / `001` heapref / `010` boxed double / `011` small string /
  `100` immediate); 16-byte headers; types STRING/ARRAY/OBJECT/DOUBLE/CLOSURE/
  BUFFER/SPARSE_ARRAY/SHAPE; UTF-16 strings with ≤3-unit SSO; HOLE immediate +
  sparse-array conversion rule; shape-transition strategy; GC flag bits;
  `===` / truthiness / `typeof` protocols; `value-model.js` helpers.

---

## 1. Goals and non-goals

**Goals**

- One uniform 64-bit value that flows through registers in compiled code, with
  tag tests cheap enough to inline (`test reg,7` / `and reg,7` + `cmp`).
- Exact JS semantics for strings (UTF-16 code units), `-0`, `NaN`, holes, and
  `===` — verified differentially against V8, never approximated.
- A heap layout a mark-sweep *or* copying GC can walk without side tables:
  every object is self-describing via its 16-byte header.
- A marshal bridge so the interpreter (`DefaultMerkavaHost.js`) can box JS
  values into tagged values and unbox native results back.

**Non-goals (v2.0)**

- `bigint`, `symbol`: tags `101`/`110`/`111` are reserved; using them is a
  contract violation until a later version assigns them.
- Property attributes (writable/enumerable/configurable), getters/setters,
  prototypes: plain data objects only. The shape system is built to grow
  into them (see §11).
- `Proxy`, `WeakMap`, typed-array views over buffers: deferred.

---

## 2. Tagged values (64 bits, low 3 bits = tag)

```
bits 63..3 : payload (tag-dependent)
bits 2..0  : tag
```

| Tag (bin) | Name      | Meaning |
|-----------|-----------|---------|
| `000`     | fixnum    | signed 61-bit integer; value = raw arithmetic-shift-right 3 |
| `001`     | heapref   | heap pointer OR'd with 1; pointer is 8-aligned (16 in practice) |
| `010`     | double    | heap pointer OR'd with 2 → boxed double; **no header read needed** |
| `011`     | smallstr  | small string: ≤3 UTF-16 code units inline (§5) |
| `100`     | immediate | 61-bit singleton code (§4) |
| `101`     | —         | RESERVED (future: symbol/bigint) |
| `110`     | —         | RESERVED (future: packed SIMD) |
| `111`     | —         | RESERVED |

**Why this split.** Fixnum keeps integer arithmetic tag-free after one `sar`.
Heapref vs double are separate tags so numeric fast paths dispatch on the tag
alone — arithmetic never reads a header to discover "this is a double". The
three reserved tags leave room without renumbering.

**Dispatch idiom (x86_64):**
```asm
and  r11, rax, 7
cmp  r11, 0        ; fixnum?
jz   .is_fixnum
cmp  r11, 2        ; boxed double?
jz   .is_double
; ... heapref (1), smallstr (3), immediate (4)
```

---

## 3. Fixnums — signed 61-bit

- Encoding: `(n << 3) & 0xFFFF_FFFF_FFFF_FFFF`, tag `000`.
- Decoding: arithmetic shift right 3 (`sar reg,3`).
- Range: `-(2^60)` … `2^60 - 1` (±1.15e18 — every 53-bit JS-safe integer fits).
- Make: `lea reg,[r*8]` (no flags clobber, single uop). Untag: `sar reg,3`.
- **Overflow policy:** any integer op whose true result leaves the range boxes
  a double (stream: arithmetic). No silent wraparound — that would break
  differential testing against V8.

---

## 4. Immediates — tag `100`, value `(code << 3) | 4`

| Code | Singleton | Notes |
|------|-----------|-------|
| 0 | `undefined` | |
| 1 | `null` | `typeof null === "object"` (JS quirk, kept exact) |
| 2 | `true` | |
| 3 | `false` | |
| 4 | `NaN` | canonical NaN; **no allocation** on the cold path |
| 5 | `hole` | array hole — internal, never observable (§10) |

**Why NaN is an immediate.** NaN results are cold; boxing a heap double for
every `0/0` would punish the common case. `NaN !== NaN` is handled in the
`===` protocol (§12), not in the bits.

**Why a hole immediate.** Holes must be distinguishable from `undefined`
(`1 in [1,,3]` is `false`; `1 in [1,undefined,3]` is `true`). One reserved
code costs nothing and keeps array elements uniformly tagged.

Codes 6…2^61−1 are reserved.

---

## 5. Strings — UTF-16, with small-string optimization

**Decision: UTF-16, not UTF-8.** JS string semantics are defined in UTF-16
code units (`length`, `charCodeAt`, `slice`, indices). Storing UTF-16 makes
those operations direct 16-bit loads/offsets with zero conversion and zero
cache invalidation. UTF-8 would save bytes for ASCII but tax every
semantics-bearing operation with decode + an index cache. The native tier
optimizes for operation speed, and this also keeps lone surrogates
byte-exact with no special cases. **Rationale recorded: exact semantics beat
compact storage; revisit only with differential proof.**

### 5a. Small strings (tag `011`) — inline, no allocation

```
bits 2..0   = 0b011
bits 4..3   = length in UTF-16 code units (0..3)
bits 52..5  = up to 3 units, little-endian (unit 0 in bits 5..20)
bits 63..53 = 0 (reserved)
```

- Empty string is smallstr length 0 — no singleton needed.
- Surrogate halves count as one unit each (`"\u{1F600}".length === 2`, so an
  emoji + one BMP char still fits).
- 4+ units → heap string. Comparison starts with the length field, so
  smallstr-vs-smallstr compare is a couple of integer ops.

### 5b. Heap strings (header type 1)

```
header: type=1, flags, meta = length in UTF-16 code units (u64)
+16:    length × u16 code units, little-endian, inline
```

- No NUL terminator (length is authoritative).
- `charCodeAt(i)` = `u16[base+16+2i]`; `slice` = offset arithmetic + copy.
- Concatenation allocates `len(a)+len(b)` units and memcpys.

---

## 6. Heap references and alignment

- `heapref = (ptr & ~7) | 1`. Recover with `ptr = v & ~7`.
- **All heap objects are 16-byte aligned.** The allocator rounds every
  allocation (header + payload) up to a multiple of 16. Payloads are multiples
  of 8, so field access stays 8-aligned and 16-byte SSE moves are safe.
- The 16-byte header means `ptr+16` is the payload start, always.

---

## 7. Boxed doubles — tag `010` (header type 4)

```
value:  (ptr & ~7) | 0b010
header: type=4, flags, meta = reserved 0
+16:    8-byte IEEE-754 double, little-endian
```

- The tag alone identifies a double — arithmetic fast paths never touch the
  header (the header exists so the GC can walk the object).
- `-0` is a boxed double with payload `0x8000_0000_0000_0000`; its sign
  survives round-trips (`Object.is(-0, -0)`, `1/-0 === -Infinity`).
- `Infinity`/`-Infinity`/fractional/out-of-fixnum-range integers box here.

---

## 8. Heap object header — 16 bytes, little-endian

```
+0 : type  u32   (table below)
+4 : flags u32   (GC bits)
+8 : meta  u64   (per-type)
```

| Type id | Name | Meta | Payload at +16 |
|---------|------|------|----------------|
| 1 | STRING | length in UTF-16 units | units inline |
| 2 | ARRAY | `length` (high 32) \| `capacity` (low 32) | `capacity` tagged values inline |
| 3 | OBJECT | shape pointer | tagged values, one per shape slot |
| 4 | DOUBLE | reserved 0 | 8-byte IEEE-754 |
| 5 | CLOSURE | code address | tagged captured env values inline |
| 6 | BUFFER | byte length | raw bytes |
| 7 | SPARSE_ARRAY | entry count | sorted `(u32 key, tagged value, u32 pad)` triples, 12 bytes each |
| 8 | SHAPE | property count N | N×heapref prop-name, then N×u32 slot index |

### Flags (u32)

| Bits | Name | Meaning |
|------|------|---------|
| 0 | MARKED | mark-sweep mark bit |
| 1 | FORWARDED | copying GC: `meta` currently holds the forwarding pointer |
| 8–15 | GEN | generation / age counter (generational GC) |
| others | — | reserved 0 |

**GC contract.** The header is fixed at 16 bytes and the type table is closed
for v2.0, so a collector written against this spec walks any heap without
side tables:

- `STRING`/`BUFFER`/`DOUBLE`: no outgoing refs (leaf).
- `ARRAY`: scan `capacity` tagged slots; recurse on tags `001`/`010`.
- `OBJECT`: read shape (type 8) → N slots; scan the N tagged values.
- `CLOSURE`: scan captured env values (count = payload size / 8).
- `SPARSE_ARRAY`: scan the tagged value of each triple.
- `SHAPE`: scan the N prop-name heaprefs (slots are u32, not refs).
- Small strings, fixnums, immediates: no heap, nothing to scan.

First collector is mark-sweep using MARKED; the FORWARDED/GEN bits reserve the
upgrade path to copying/generational without changing the header. During a
copying phase with FORWARDED set, `meta` is *temporarily* the forwarding
pointer — collectors must restore it before clearing the bit (type-specific
restore: STRING length, ARRAY length|capacity, OBJECT shape ptr, etc. — all
recoverable because the *type* field is never clobbered).

---

## 9. Arrays

- **Dense by default.** `meta = (length << 32) | capacity`; `capacity` tagged
  slots inline at +16. `length` is the JS `.length` (counts holes).
- Growth: double the capacity (amortized O(1) push); allocate new, copy, let
  GC reclaim the old.
- Elements are uniformly tagged values — no separate element kinds in v2.0
  (packed-SMI vs packed-double specialization is a later optimization that
  must preserve this layout's observable behavior).
- `length` is a u32 pair — arrays longer than 2^32−1 are a `RangeError`.

### Holes and sparseness (§10 is the policy; this is the mechanism)

- A hole is the `hole` immediate (code 5), stored like any element.
- `arr[i]` on a hole → `undefined`; `i in arr` on a hole → `false`;
  iteration (`for..of`, `map`, `forEach`) skips holes — all derived from the
  hole immediate, tested against V8.

---

## 10. Array holes / sparseness policy (DECIDED)

1. **Holey-but-dense** stays flat: holes are `hole` immediates in the dense
   vector. `[1,,3]`, `delete a[1]`, `new Array(100)` all live here.
2. **Sparse conversion.** A store to index `i` converts the array to
   `SPARSE_ARRAY` (type 7) when `i >= 1024 && i > 4 * length`. Rationale: filling
   a million holes to serve one store is a memory blowup; a sorted key/value
   vector keeps it O(entries). The thresholds are chosen so normal code
   (including `new Array(n)` + fill loops, which stay dense) never converts.
3. `SPARSE_ARRAY` payload: `count` triples of `(u32 key, tagged value, u32 pad
   = 0)`, sorted by key, 12 bytes each. `length` = highest key + 1 (0 when
   empty). Holes are simply absent keys.
4. Conversion back (sparse → dense) happens when a `length` shrink or deletes
   bring the highest key below the threshold — collector's choice to implement
   eagerly or lazily, but **observable behavior must match V8** either way.

---

## 11. Objects and shapes (hidden classes) — transition strategy (DECIDED)

- Every object (type 3) points at a **shape** (type 8): an immutable, canonical
  record `{propNames[N] (heapref strings), slots[N] (u32)}`. `meta` = shape
  pointer; payload = N tagged values, value for `propNames[i]` at
  `payload[slots[i]]`.
- **Adding a property** follows a transition: `shape.add(name)` returns the
  canonical child shape (child = parent props + name → new slot). Transitions
  are cached in a runtime-side hash map keyed `(shape, name)` — the SHAPE heap
  object itself stays fixed-layout (no inline transition table), keeping the
  GC walk trivial. Objects constructed with the same property-addition order
  share shapes, exactly like V8 hidden classes.
- **Deleting a property** allocates a fresh shape without that property and
  compacts the values (no transition caching required).
- **Shape identity rule:** two shapes are the same shape iff same ordered
  property-name sequence. The runtime interns shapes; `===`-on-shapes is
  pointer equality.
- **Inline caches** (stream: property access) key on the shape pointer in
  `meta`: `obj.shape === cachedShape ? payload[slot] : slowPath`.
- v2.0 objects are data-only. Getters/setters/prototypes/attributes slot into
  the shape later as per-property flag words — the shape/slot indirection
  already isolates that change from every object payload.

---

## 12. Strict equality (`===`) protocol

Codegen must implement exactly this (differential-tested vs V8):

1. If both immediates and both `NaN` → **false** (even though the bits match).
2. If `a === b` as u64 → **true** (fixnum, imm, smallstr, heapref identity).
3. If tags differ → **false**, except fixnum-0 vs boxed ±0:
   `fixnum(0) === double(±0)` → true (payload sign bits ignored iff both are zero).
4. Same tag `010` (double): `+0`/`-0` payloads compare equal; any NaN payload
   → false; otherwise bitwise equality.
5. Same tag `001` (heapref): identity, **except strings compare by content**
   (length + units) — `'a' === 'a'` is true for distinct heap strings.
6. Cross-tag number compare beyond rule 3 (e.g. `fixnum(5)` vs boxed `5.0`):
   compare `Number(fixnum)` with the double bits — every fixnum is exactly
   representable, so the numeric comparison is exact. NaN → false.

`==` (abstract equality) follows `ToPrimitive`/`ToNumber` per spec — later
stream; the value model only guarantees the primitives above.

---

## 13. Truthiness

| Value | Truthy? |
|-------|---------|
| fixnum 0 | false; all other fixnums true |
| `false`, `null`, `undefined`, `NaN` | false; `true` true |
| smallstr / heap string | iff length > 0 (`""` is false) |
| boxed double | iff `d !== 0 && !NaN` (`-0` is false) |
| array / object / closure / buffer / sparse array | **true** (even empty — `[]` and `{}` are truthy) |
| hole | unreachable (never leaks; internal `TypeError` if it does) |

---

## 14. `typeof` mapping

`fixnum`/`double` → `"number"`; strings → `"string"`; `undefined` →
`"undefined"`; `null` → `"object"`; booleans → `"boolean"`; `NaN` → `"number"`;
closure → `"function"`; everything else heap → `"object"`.

---

## 15. Allocation (runtime contract for codegen)

- Entry point the runtime provides: `__merkava_alloc(size_bytes) -> ptr`
  (16-aligned). Codegen calls it; it never returns misaligned memory.
- Codegen writes the 16-byte header itself (type/flags/meta), then payload.
- Bump-allocator is the expected first implementation; the header contract
  does not care.
- Stack allocation (v1's fixed-shape objects) remains legal for
  provably-local values, but any value that can escape to the heap or to the
  interpreter **must** use this model.

---

## 16. Interop with the interpreter (`DefaultMerkavaHost.js`)

The interpreter's values are JS objects; the native tier's are u64. The
marshal rules (implemented in `value-model.js` as `encodeValue`/`decodeValue`):

- JS `number`: integer in fixnum range → fixnum; `-0`, fractions,
  out-of-range, ±Infinity → boxed double; `NaN` → `V_NAN`.
- JS `string` → smallstr (≤3 units) else heap string. Surrogates preserved.
- `boolean`/`null`/`undefined` → immediates.
- JS `Array` → heap ARRAY, holes → `hole` immediates (holes survive the
  round-trip as real holes).
- Plain JS object → heap OBJECT with a fresh shape (insertion order).
- Native → JS is the exact inverse. Closures/buffers decode only where the
  host defines a mapping; otherwise the host throws (loud, not silent).

The differential harness (`~/workspace/js-vs-v8/`) marshals V8 results through
`encodeValue` and compares against native-tier results with `strictEqual` —
bit-level agreement, not string comparison.

**Changelog 2026-10-09 — marshal reference identity.** Marshal calls preserve
reference identity per top-level call; cycles supported via two-phase
memoization. `encodeValue` threads a fresh `Map` through each top-level call:
shared substructure encodes to one handle, and cyclic containers are
allocated empty first, memoized, then filled, so self-references resolve
instead of recursing forever. `decodeValue` mirrors this in reverse
(tagged → JS) with its own per-call memo. Additionally, a per-heap identity
table (`WeakMap`, scoped to the heap object, weakly keyed, holding only
`BigInt` handles) remembers every marshaled reference, so marshaling the
same JS reference across *separate* top-level calls returns the identical
handle — V8 requires `a === a` across a marshal boundary, which a per-call
memo alone cannot provide. Primitives (fixnums, boxed doubles, SSO strings,
immediates) carry no identity and take no memo entries; heap strings compare
by content (spec §12 rule 5).

---

## 17. Codegen notes (for the asm.js stream)

- Tag test: `test reg,7` sets ZF iff fixnum. `and tmp,reg,7` + `cmp` for the
  rest. Put the hot tags (fixnum, double) first in the dispatch chain.
- Untag fixnum: `sar reg,3`. Retag: `lea reg,[reg*8]` (or `shl reg,3`).
- Heapref → payload: `and ptr,reg,-8` then `[ptr+16+...]`. Header type check:
  `cmp dword [ptr], TYPE_*`.
- Smallstr length: `shr tmp,reg,3` / `and tmp,3`. Unit i: `shr`/`and 0xffff`
  or `movzx tmp, word [reg+i*2-?]` — note units start at bit 5, so shift first.
- String compare fast path: lengths differ → not equal; smallstr: single
  `cmp`; heap: `memcmp` over units.
- `undefined`/`null` checks: `cmp reg, IMM_VALUE` — single compare, no mask.

---

## 18. Open questions / deferred

- `bigint`/`symbol` tags (`101`): layout TBD when a stream needs them.
- Array element-kind specialization (packed fixnum/double): invisible
  optimization, must keep §9 observables.
- Prototype chain, accessors, property attributes: shape flags, later.
- Exact `ToPrimitive`/`valueOf`/`toString` dispatch order: later stream with
  differential tests.
- Generational GC promotion policy: uses GEN bits; policy TBD by GC stream.

---

## 19. `value-model.js` API (summary)

Tags: `TAG_FIXNUM/HEAPREF/DOUBLE/SMALLSTR/IMM`, `TAG_MASK`, `tagOf`.
Fixnum: `fixnum`, `isFixnum`, `fixnumValue`, `FIXNUM_MAX/MIN`.
Immediates: `imm`, `isImm`, `immCode`, `IMM_*`, `V_UNDEFINED/NULL/TRUE/FALSE/NAN/HOLE`.
Refs: `heapref`, `heapPtr`, `doubleref`, `isDouble`.
Small strings: `smallString`, `isSmallString`, `smallStringLength`, `smallStringValue`.
Headers: `HEADER_SIZE`, `TYPE_*`, `FLAG_*`, `writeHeader`, `readHeader`.
Heap (test/harness): `makeHeap` with `alloc/allocString/allocArray/allocDouble`.
Marshal: `encodeValue(heap, js)`, `decodeValue(heap, tagged)`.
Semantics: `isTruthy`, `strictEqual`, `typeOf`.
