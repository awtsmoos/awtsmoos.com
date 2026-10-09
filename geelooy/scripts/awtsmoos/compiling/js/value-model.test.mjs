// B"H
// value-model.test.mjs — unit tests for the v2 object model contract.
// Run: node value-model.test.mjs   (exit 0 = all pass)
import {
  MASK64, asU64, asI64,
  TAG_FIXNUM, TAG_HEAPREF, TAG_DOUBLE, TAG_SMALLSTR, TAG_IMM, TAG_MASK, tagOf,
  FIXNUM_MAX, FIXNUM_MIN, fixnum, isFixnum, fixnumValue,
  IMM_UNDEFINED, IMM_NULL, IMM_TRUE, IMM_FALSE, IMM_NAN, IMM_HOLE,
  imm, isImm, immCode, V_UNDEFINED, V_NULL, V_TRUE, V_FALSE, V_NAN, V_HOLE,
  heapref, isHeapref, heapPtr, doubleref, isDouble,
  smallString, isSmallString, smallStringLength, smallStringValue, SSO_MAX_UNITS,
  HEADER_SIZE, TYPE_STRING, TYPE_ARRAY, TYPE_OBJECT, TYPE_DOUBLE, TYPE_CLOSURE,
  TYPE_BUFFER, TYPE_SPARSE_ARRAY, TYPE_SHAPE,
  FLAG_MARKED, FLAG_FORWARDED, FLAG_GEN_SHIFT, FLAG_GEN_MASK,
  writeHeader, readHeader, makeHeap,
  encodeValue, decodeValue, isTruthy, strictEqual, typeOf,
} from "./value-model.js";

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) { pass++; } else { fail++; console.error(`FAIL: ${name}`); } };
const eq = (a, b, name) => ok(Object.is(a, b) || (typeof a === "bigint" && typeof b === "bigint" && a === b), `${name} (got ${String(a)}, want ${String(b)})`);
const throws = (fn, name) => { try { fn(); ok(false, name + " (no throw)"); } catch { ok(true, name); } };

// --- tags ---
eq(tagOf(fixnum(5)), TAG_FIXNUM, "tag fixnum");
eq(tagOf(V_TRUE), TAG_IMM, "tag imm");
eq(tagOf(smallString("ab")), TAG_SMALLSTR, "tag smallstr");

// --- fixnum round-trip ---
for (const n of [0, 1, -1, 42, -42, FIXNUM_MAX, FIXNUM_MIN, 2n ** 59n, -(2n ** 59n)]) {
  eq(fixnumValue(fixnum(n)), BigInt(n), `fixnum round-trip ${n}`);
  ok(isFixnum(fixnum(n)), `isFixnum ${n}`);
}
throws(() => fixnum(FIXNUM_MAX + 1n), "fixnum overflow throws");
throws(() => fixnum(FIXNUM_MIN - 1n), "fixnum underflow throws");
eq(fixnum(7) >> 3n, 7n, "fixnum raw>>3 == value (positive)");
eq(asI64(fixnum(-9)) >> 3n, -9n, "fixnum arith>>3 == value (negative)");

// --- immediates ---
const codes = [[V_UNDEFINED, IMM_UNDEFINED], [V_NULL, IMM_NULL], [V_TRUE, IMM_TRUE],
               [V_FALSE, IMM_FALSE], [V_NAN, IMM_NAN], [V_HOLE, IMM_HOLE]];
for (const [v, c] of codes) { eq(immCode(v), c, `imm code ${c}`); ok(isImm(v), `isImm ${c}`); }
eq(V_UNDEFINED, 4n, "undefined == 0b100");
eq(V_TRUE, (2n << 3n) | 4n, "true encoding");

// --- small strings ---
for (const s of ["", "a", "ab", "abc", "\u{1F600}", "\u{1F600}a", "\uD800"]) {
  eq(smallStringValue(smallString(s)), s, `sso round-trip ${JSON.stringify(s)}`);
  eq(smallStringLength(smallString(s)), s.length, `sso length ${JSON.stringify(s)}`);
}
throws(() => smallString("abcd"), "sso 4 units throws");
eq(smallString(""), 3n, "empty string == tag 0b011");
ok((smallString("abc") & (0xffffn << 53n)) === 0n, "sso reserved bits zero");

// --- heapref / doubleref ---
const p1 = heapref(0x1000n);
eq(tagOf(p1), TAG_HEAPREF, "heapref tag");
eq(heapPtr(p1), 0x1000n, "heapref ptr mask");
throws(() => heapref(0x1003n), "unaligned heapref throws");
const d1 = doubleref(0x2000n);
eq(tagOf(d1), TAG_DOUBLE, "doubleref tag");
ok(isDouble(d1) && !isHeapref(d1), "double not heapref");

// --- header read/write ---
{
  const heap = makeHeap();
  writeHeader(heap.dv, 0, TYPE_ARRAY, FLAG_MARKED | (3 << FLAG_GEN_SHIFT), 0xdeadbeefcafef00dn);
  const h = readHeader(heap.dv, 0);
  eq(h.type, TYPE_ARRAY, "header type");
  eq(h.flags & FLAG_MARKED, FLAG_MARKED, "header marked bit");
  eq((h.flags & FLAG_GEN_MASK) >> FLAG_GEN_SHIFT, 3, "header gen bits");
  eq(h.meta, 0xdeadbeefcafef00dn, "header meta u64 exact (beyond 2^53)");
  eq(HEADER_SIZE, 16, "header is 16 bytes");
}

// --- string alloc/decode ---
{
  const heap = makeHeap();
  for (const s of ["", "x", "hello world, this is a longer heap string!", "a\u{1F600}b\u{1D11E}"]) {
    const v = heap.allocString(s);
    eq(decodeValue(heap, v), s, `string round-trip len=${s.length}`);
    if (s.length <= SSO_MAX_UNITS) ok(isSmallString(v), `short string is SSO: ${JSON.stringify(s)}`);
    else { ok(isHeapref(v), "long string is heapref"); eq(readHeader(heap.dv, Number(heapPtr(v))).type, TYPE_STRING, "heap string type"); }
  }
  // exact UTF-16 unit semantics: lone surrogates preserved byte-exact
  const lone = heap.allocString("\uD800x\uDC00");
  eq(decodeValue(heap, lone), "\uD800x\uDC00", "lone surrogates preserved");
}

// --- array alloc/decode incl. holes ---
{
  const heap = makeHeap();
  const v = encodeValue(heap, [1, , 3, "xy", true, null]); // hole at index 1
  const back = decodeValue(heap, v);
  eq(back.length, 6, "array length incl hole");
  ok(!(1 in back), "hole preserved as hole");
  eq(back[0], 1, "arr[0]"); eq(back[2], 3, "arr[2]"); eq(back[3], "xy", "arr[3]"); eq(back[4], true, "arr[4]"); eq(back[5], null, "arr[5]");
  const h = readHeader(heap.dv, Number(heapPtr(v)));
  eq(h.type, TYPE_ARRAY, "array type");
  eq(Number(h.meta >> 32n), 6, "array meta length");
}

// --- object alloc/decode via shape ---
{
  const heap = makeHeap();
  const v = encodeValue(heap, { x: 1, y: "ab", z: [1, 2] });
  eq(readHeader(heap.dv, Number(heapPtr(v))).type, TYPE_OBJECT, "object type");
  const back = decodeValue(heap, v);
  eq(back.x, 1, "obj.x"); eq(back.y, "ab", "obj.y");
  eq(JSON.stringify(back.z), "[1,2]", "obj.z nested");
}

// --- doubles ---
{
  const heap = makeHeap();
  for (const d of [1.5, -1.5, 1e300, -0, Infinity, -Infinity, 0.1]) {
    const v = encodeValue(heap, d);
    ok(isDouble(v), `double tag for ${d}`);
    const back = decodeValue(heap, v);
    ok(Object.is(back, d), `double round-trip ${d}`);
    eq(readHeader(heap.dv, Number(heapPtr(v))).type, TYPE_DOUBLE, "double header type");
  }
  eq(decodeValue(heap, encodeValue(heap, NaN)), NaN, "NaN -> V_NAN decodes to NaN");
  ok(isImm(encodeValue(heap, NaN)), "NaN encodes as immediate (no alloc)");
  throws(() => encodeValue(heap, 2n ** 70n), "out-of-range bigint throws (no silent wrap)");
  // -0 keeps its sign through the box
  const negZero = decodeValue(heap, encodeValue(heap, -0));
  ok(Object.is(negZero, -0), "-0 sign preserved");
  // Bug 2: the double 2**60 must box, not throw. Number(2**60 - 1) rounds UP
  // to the double 2**60, so the old <= Number(FIXNUM_MAX) guard admitted it
  // and fixnum() threw RangeError.
  const b60 = encodeValue(heap, 2 ** 60);
  ok(isDouble(b60), "2**60 encodes as boxed double");
  ok(Object.is(decodeValue(heap, b60), 2 ** 60), "2**60 round-trips through box");
  // 2**60 - 1 is not a distinct double (rounds to 2**60), so use the largest
  // representable double strictly below 2**60 (spacing there is 256).
  const justBelow = encodeValue(heap, 2 ** 60 - 256);
  ok(isFixnum(justBelow), "2**60 - 256 still takes the fixnum path");
  eq(decodeValue(heap, justBelow), 2 ** 60 - 256, "2**60 - 256 fixnum round-trip");
}

// --- nested marshal ---
{
  const heap = makeHeap();
  const src = { a: [1, "x", true, null, [2.5]], b: null, c: { d: -0 } };
  const back = decodeValue(heap, encodeValue(heap, src));
  eq(back.a[0], 1, "nested a[0]"); eq(back.a[1], "x", "nested a[1]");
  eq(back.a[2], true, "nested a[2]"); eq(back.a[3], null, "nested a[3]");
  eq(back.a[4][0], 2.5, "nested a[4][0]");
  ok(Object.is(back.c.d, -0), "nested -0");
}

// --- strictEqual ---
{
  const heap = makeHeap();
  ok(strictEqual(heap, fixnum(3), fixnum(3)), "fixnum ===");
  ok(!strictEqual(heap, fixnum(3), fixnum(4)), "fixnum !==");
  ok(strictEqual(heap, V_TRUE, V_TRUE), "true === true");
  ok(!strictEqual(heap, V_NAN, V_NAN), "NaN !== NaN");
  ok(!strictEqual(heap, V_NULL, V_UNDEFINED), "null !== undefined");
  const s1 = heap.allocString("hello heap"), s2 = heap.allocString("hello heap");
  ok(s1 !== s2, "two heap strings, distinct pointers");
  ok(strictEqual(heap, s1, s2), "heap strings === by content");
  const s3 = heap.allocString("other");
  ok(!strictEqual(heap, s1, s3), "different strings !==");
  const mz = encodeValue(heap, -0), pz = fixnum(0);
  ok(strictEqual(heap, mz, pz), "-0 === 0");
  ok(strictEqual(heap, mz, encodeValue(heap, 0)), "-0 === +0 (boxed)");
  ok(!strictEqual(heap, encodeValue(heap, 0.5), fixnum(0)), "0.5 !== 0");
  // spec §12 rule 6: cross-tag fixnum vs a GENUINELY boxed double
  // (encodeValue(heap, 5) collapses to a fixnum, so it cannot exercise this path).
  const boxed5 = heap.allocDouble(5.0);
  ok(strictEqual(heap, boxed5, fixnum(5)), "true boxed 5.0 === fixnum 5");
  ok(strictEqual(heap, fixnum(5), boxed5), "fixnum 5 === true boxed 5.0");
  ok(!strictEqual(heap, boxed5, fixnum(6)), "true boxed 5.0 !== fixnum 6");
  ok(!strictEqual(heap, fixnum(5), heap.allocDouble(5.5)), "fixnum 5 !== boxed 5.5");
  ok(!strictEqual(heap, fixnum(5), heap.allocDouble(-0)), "fixnum 5 !== boxed -0");
  ok(!strictEqual(heap, fixnum(5), heap.allocDouble(NaN)), "fixnum 5 !== boxed NaN");
  ok(strictEqual(heap, fixnum(0), heap.allocDouble(-0)), "fixnum 0 === boxed -0");
  ok(strictEqual(heap, fixnum(-7), heap.allocDouble(-7.0)), "fixnum -7 === boxed -7.0");
  const a1 = encodeValue(heap, [1]), a2 = encodeValue(heap, [1]);
  ok(!strictEqual(heap, a1, a2), "arrays === by identity");
  ok(strictEqual(heap, a1, a1), "array === itself");
}

// --- truthiness ---
{
  const heap = makeHeap();
  const cases = [
    [fixnum(0), false], [fixnum(1), true], [fixnum(-5), true],
    [V_FALSE, false], [V_TRUE, true], [V_NULL, false], [V_UNDEFINED, false], [V_NAN, false],
    [smallString(""), false], [smallString("a"), true],
    [heap.allocString(""), false], [heap.allocString("x"), true],
    [encodeValue(heap, []), true], [encodeValue(heap, {}), true],
    [encodeValue(heap, 0), false], [encodeValue(heap, -0), false], [encodeValue(heap, 0.5), true],
  ];
  for (const [v, want] of cases) eq(isTruthy(heap, v), want, `truthy ${String(v).slice(0, 24)}`);
}

// --- typeof ---
{
  const heap = makeHeap();
  eq(typeOf(heap, fixnum(1)), "number", "typeof fixnum");
  eq(typeOf(heap, encodeValue(heap, 1.5)), "number", "typeof double");
  eq(typeOf(heap, smallString("a")), "string", "typeof smallstr");
  eq(typeOf(heap, heap.allocString("longer than three")), "string", "typeof heap string");
  eq(typeOf(heap, V_UNDEFINED), "undefined", "typeof undefined");
  eq(typeOf(heap, V_NULL), "object", "typeof null (JS quirk)");
  eq(typeOf(heap, V_TRUE), "boolean", "typeof bool");
  eq(typeOf(heap, V_NAN), "number", "typeof NaN");
  eq(typeOf(heap, encodeValue(heap, [])), "object", "typeof array");
  eq(typeOf(heap, encodeValue(heap, {})), "object", "typeof object");
}

// --- alignment invariant: every heap object 16-aligned ---
{
  const heap = makeHeap();
  for (let i = 0; i < 50; i++) {
    const off = heap.alloc(TYPE_BUFFER, (i * 7) % 40, BigInt(i));
    ok(off % 16 === 0, `alloc ${i} 16-aligned`);
    heapref(BigInt(off)); // must not throw
  }
}

// --- marshal reference identity (spec §16): a === a across marshal calls ---
{
  const heap = makeHeap();
  // double-encode of the same reference (separate top-level calls) -> same handle
  const a = { x: 1, y: [1, 2] };
  const e1 = encodeValue(heap, a), e2 = encodeValue(heap, a);
  ok(e1 === e2, "double-encode same reference -> identical handle");
  ok(strictEqual(heap, e1, e2), "double-encoded reference strictEqual");
  // distinct references stay distinct
  const d1 = encodeValue(heap, { x: 1 }), d2 = encodeValue(heap, { x: 1 });
  ok(d1 !== d2 && !strictEqual(heap, d1, d2), "distinct literals -> distinct handles");
  // cyclic array: encodes without hanging; decodes with identity intact
  const ca = [1]; ca.push(ca);
  const dca = decodeValue(heap, encodeValue(heap, ca));
  ok(dca[0] === 1 && dca[1] === dca, "cyclic array round-trips with self-identity");
  // cyclic object
  const co = { n: "self" }; co.me = co;
  const dco = decodeValue(heap, encodeValue(heap, co));
  ok(dco.n === "self" && dco.me === dco, "cyclic object round-trips with self-identity");
  // shared substructure within one call: {x:o, y:o} -> decoded x === y
  const o = { v: 42 };
  const de = decodeValue(heap, encodeValue(heap, { x: o, y: o }));
  ok(de.x === de.y && de.x.v === 42, "shared substructure decodes to identical references");
  // shared substructure across elements
  const arr = [o, o];
  const darr = decodeValue(heap, encodeValue(heap, arr));
  ok(darr[0] === darr[1], "shared array elements decode to identical references");
  // previously marshaled reference nested in a later call reuses its handle
  const t1 = encodeValue(heap, o);
  const t2 = encodeValue(heap, [o]);
  const dt2 = decodeValue(heap, t2);
  ok(dt2[0].v === 42, "nested reuse of marshaled reference decodes correctly");
  ok(strictEqual(heap, t1, encodeValue(heap, o)), "re-marshal returns remembered handle");
  // deep cycle through object -> array -> object
  const top = { name: "top" }; const mid = [top]; top.mid = mid;
  const dtop = decodeValue(heap, encodeValue(heap, top));
  ok(dtop.mid[0] === dtop && dtop.name === "top", "object/array cycle round-trips");
  // Infinity: boxed infinities compare true (V8: Infinity === Infinity)
  const i1 = encodeValue(heap, Infinity), i2 = encodeValue(heap, Infinity);
  ok(strictEqual(heap, i1, i2), "boxed Infinity === boxed Infinity");
  ok(!strictEqual(heap, i1, encodeValue(heap, -Infinity)), "Infinity !== -Infinity");
}

console.log(`\nvalue-model: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
