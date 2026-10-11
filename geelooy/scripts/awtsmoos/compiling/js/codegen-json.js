// B"H
// Merkava JS -> Native Tier v2, Stream 6/8: NATIVE JSON.
//
// Fully native (x86_64 machine code, no interpreter, no libc) JSON.parse /
// JSON.stringify emitters. Emits Awtsmoos portable assembly text; assemble with
// compileNativeAsm(asm, "linux-x64-static") from ../../native/compiler.js.
//
// VALUE MODEL: Stream 1's OBJECT_MODEL.md + ./value-model.js are authoritative
// and this module conforms exactly (verified by the Stream-8 gate):
//   - 64-bit tagged values, low 3 bits = tag:
//       000 fixnum (signed 61-bit, value = raw >> 3 arith)
//       001 heapref ((ptr & ~7) | 1; 16-byte aligned heap object)
//       010 doubleref ((ptr & ~7) | 2 -> TYPE_DOUBLE header, IEEE754 at +16)
//       011 smallstr (<=3 UTF-16 units inline: bits 3..4 = len, units at 5..52)
//       100 immediate ((code<<3)|4): 0=undefined 1=null 2=true 3=false 4=NaN 5=hole
//   - 16-byte headers: +0 type u32, +4 flags u32, +8 meta u64.
//       TYPE_STRING=1 (meta = length in UTF-16 units, units at +16)
//       TYPE_ARRAY=2  (meta = (length<<32)|capacity, tagged values at +16)
//       TYPE_OBJECT=3 (meta = shape ptr, N tagged values at +16 per shape slots)
//       TYPE_DOUBLE=4 (meta = 0, IEEE754 at +16)
//       TYPE_SHAPE=8  (meta = prop count N, N heapref names at +16, N u32 slots after)
//   - Allocation: codegen CALLs __merkava_alloc(size_bytes) -> RAX raw 16-aligned
//     ptr; codegen writes the 16-byte header itself. The runtime provides it;
//     buildJsonTestProgram() emits a bump-allocator implementation for tests.
//   - Numbers: integers in +/-2^60 (and not -0) -> fixnum; -0, fractions,
//     out-of-range, +/-Infinity -> boxed double; NaN -> V_NAN immediate.
//
// Exports:
//   emitJsonParse(sink)      -> "json_parse": RDI=utf16 ptr, RSI=len units,
//                              RDX=reviver closure heapref or 0 -> RAX tagged value.
//                              Check json_err (0=ok, else 1-based failing unit index).
//   emitJsonStringify(sink)  -> "json_stringify_full": RDI=tagged value,
//                              RSI=replacer closure/array or 0, RDX=space
//                              (fixnum/string/undefined) -> RAX tagged string,
//                              or V_UNDEFINED (top-level undefined), or 0 on
//                              error (json_err=1 => circular).
//   JsonSink                 -> concrete sink: lines + data blobs -> toAsm().
//   buildJsonTestProgram()   -> standalone test binary asm (framed-stdin protocol).
//
// Stream 3/4/5 integration: those streams were in flight when this was written,
// so this module is self-contained (own string/array/object constructors on
// __merkava_alloc). The same-named integration points are exported; re-point
// them at the real stream 3/4/5 emitters when those land:
//   emitStringLit(sink, ptrReg, lenReg) -> RAX tagged string
//   emitArrayLit(sink)                  -> RAX tagged empty array
//   emitObjLit(sink)                    -> RAX tagged empty object
//
// Correctness: differential vs V8 (test/json-v2.mjs): full escape handling,
// strict number grammar, correctly-rounded decimal<->binary (Ryu d2s for
// stringify; Eisel-Lemire + exact bignum fallback for parse), reviver,
// replacer (fn + array), toJSON, circular detection, undefined/function
// elision, -0, duplicate keys (last wins, first position).

import {
  TAG_FIXNUM, TAG_HEAPREF, TAG_DOUBLE, TAG_SMALLSTR, TAG_IMM, TAG_MASK,
  IMM_UNDEFINED, IMM_NULL, IMM_TRUE, IMM_FALSE, IMM_NAN,
  TYPE_STRING, TYPE_ARRAY, TYPE_OBJECT, TYPE_DOUBLE, TYPE_SHAPE,
  HEADER_SIZE,
} from "./value-model.js";

// Tagged-value constants (BigInt -> asm immediates).
const V_UNDEFINED = (IMM_UNDEFINED << 3n) | TAG_IMM; // 0x4
const V_NULL      = (IMM_NULL      << 3n) | TAG_IMM; // 0xC
const V_TRUE      = (IMM_TRUE      << 3n) | TAG_IMM; // 0x14
const V_FALSE     = (IMM_FALSE     << 3n) | TAG_IMM; // 0x1C
const V_NAN       = (IMM_NAN       << 3n) | TAG_IMM; // 0x24
const asmImm = (v) => "0x" + v.toString(16);

// ---------------------------------------------------------------------------
// Sink
// ---------------------------------------------------------------------------
export class JsonSink {
  constructor() {
    this.code = [];
    this.blobs = [];
    this.n = 0;
    this.done = new Set();
  }
  emit(s) { this.code.push(s); }
  lbl(p) { return `$j_${p}_${this.n++}`; }
  data(name, bytes) {
    this.blobs.push({ name, bytes: bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes) });
  }
  dataQwords(name, vals) {
    const b = new Uint8Array(vals.length * 8);
    const dv = new DataView(b.buffer);
    for (let i = 0; i < vals.length; i++)
      dv.setBigUint64(i * 8, BigInt(vals[i]) & 0xFFFFFFFFFFFFFFFFn, true);
    this.data(name, b);
  }
  toAsm() {
    const out = [".code", ...this.code, ".data"];
    for (const { name, bytes } of this.blobs) {
      if (bytes.length === 0) { out.push(`${name}: 0`); continue; }
      for (let i = 0; i < bytes.length; i += 12) {
        const chunk = Array.from(bytes.slice(i, i + 12)).join(", ");
        out.push(i === 0 ? `${name}: ${chunk}` : `db ${chunk}`);
      }
    }
    return out.join("\n") + "\n";
  }
}

// ---------------------------------------------------------------------------
// Tables (computed with BigInt at codegen time)
// ---------------------------------------------------------------------------
function pow5bits(e) { return Number((BigInt(e) * 1217359n >> 19n) + 1n); }
function ryuTables() {
  const split = [], inv = [];
  for (let i = 0; i <= 326; i++) {
    const p5 = 5n ** BigInt(i), pb = pow5bits(i);
    const v = p5 << BigInt(125 - pb);
    split.push(v >> 64n, v & 0xFFFFFFFFFFFFFFFFn);
  }
  for (let q = 0; q <= 326; q++) {
    const p5 = 5n ** BigInt(q), pb = pow5bits(q);
    const v = (1n << BigInt(124 + pb)) / p5;
    inv.push(v >> 64n, v & 0xFFFFFFFFFFFFFFFFn);
  }
  return { split, inv };
}
function parseTables() {
  const p5 = [], sq = [], inv5 = [], tq = [];
  for (let Q = 0; Q <= 345; Q++) {
    const p = 5n ** BigInt(Q), bl = p.toString(2).length, s = bl - 128;
    const top = s >= 0 ? p >> BigInt(s) : p << BigInt(-s);
    p5.push(top >> 64n, top & 0xFFFFFFFFFFFFFFFFn); sq.push(BigInt(s));
    let t, iv;
    if (Q === 0) { t = 127; iv = 1n << 127n; }
    else { t = 127 + bl; iv = (1n << BigInt(t)) / p; }
    inv5.push(iv >> 64n, iv & 0xFFFFFFFFFFFFFFFFn); tq.push(BigInt(t));
  }
  return { p5, sq, inv5, tq };
}

// Emit: reg = reg >> k (logical), k = immediate 1..63. Clobbers tmp (reg != tmp).
function emitShr64(s, reg, tmp, k) {
  s.emit(`MOV ${tmp}, ${reg}`);
  s.emit(`SAR ${reg}, ${k}`);
  s.emit(`SAR ${tmp}, 63`);
  s.emit(`SHL ${tmp}, ${64 - k}`);
  s.emit(`NEG ${tmp}`);
  s.emit(`DEC ${tmp}`);
  s.emit(`AND ${reg}, ${tmp}`);
}

// ---------------------------------------------------------------------------
// Runtime. emitJsonRuntime(sink, opts): emits everything once.
// opts.provideAlloc: also emit a bump-allocator __merkava_alloc (test binaries).
// ---------------------------------------------------------------------------
export function emitJsonRuntime(s, opts = {}) {
  if (s.done.has("jsonrt")) return; s.done.add("jsonrt");

  // json_err: 0 = ok; parse error -> 1-based failing unit index; stringify circular -> 1.
  s.dataQwords("json_err", [0n]);

  if (opts.provideAlloc) {
    s.dataQwords("json_heap_ptr", [0n]);
    s.dataQwords("json_heap_end", [0n]);
    // __merkava_alloc: RDI = size bytes -> RAX = raw 16-aligned ptr. Bump over 1GiB arenas.
    s.emit(`__merkava_alloc:`);
    s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
    s.emit(`PUSH RBX`); s.emit(`PUSH R12`); s.emit(`PUSH R13`);
    s.emit(`MOV RAX, RDI`);
    s.emit(`ADD RAX, 15`);
    s.emit(`AND RAX, -16`);                 // RAX = size rounded to 16
    s.emit(`LEA R10, json_heap_ptr`);
    s.emit(`MOV RBX, QWORD PTR [R10]`);
    s.emit(`TEST RBX, RBX`);
    const haInit = s.lbl("ha"), haHave = s.lbl("ha");
    s.emit(`JNZ ${haHave}`);
    s.emit(`PUSH RAX`);
    s.emit(`MOV RAX, 9`);                   // sys_mmap
    s.emit(`XOR RDI, RDI`);
    s.emit(`MOV RSI, 1073741824`);
    s.emit(`MOV RDX, 3`);
    s.emit(`MOV R10, 0x22`);
    s.emit(`MOV R8, -1`);
    s.emit(`XOR R9, R9`);
    s.emit(`SYSCALL`);
    s.emit(`LEA R10, json_heap_ptr`);
    s.emit(`MOV QWORD PTR [R10], RAX`);
    s.emit(`MOV RBX, RAX`);
    s.emit(`ADD RAX, 1073741824`);
    s.emit(`LEA R10, json_heap_end`);
    s.emit(`MOV QWORD PTR [R10], RAX`);
    s.emit(`POP RAX`);
    s.emit(`${haHave}:`);
    s.emit(`MOV R12, RBX`);
    s.emit(`ADD R12, RAX`);                 // new bump
    s.emit(`LEA R10, json_heap_end`);
    s.emit(`MOV R13, QWORD PTR [R10]`);
    s.emit(`CMP R12, R13`);                 // signed ok: user addresses < 2^47
    const haGrow = s.lbl("ha");
    s.emit(`JG ${haGrow}`);
    s.emit(`LEA R10, json_heap_ptr`);
    s.emit(`MOV QWORD PTR [R10], R12`);
    s.emit(`MOV RAX, RBX`);
    s.emit(`POP R13`); s.emit(`POP R12`); s.emit(`POP RBX`);
    s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
    s.emit(`${haGrow}:`);                   // leak old chunk, mmap fresh 1GiB
    s.emit(`PUSH RAX`);
    s.emit(`MOV RAX, 9`);
    s.emit(`XOR RDI, RDI`);
    s.emit(`MOV RSI, 1073741824`);
    s.emit(`MOV RDX, 3`);
    s.emit(`MOV R10, 0x22`);
    s.emit(`MOV R8, -1`);
    s.emit(`XOR R9, R9`);
    s.emit(`SYSCALL`);
    s.emit(`MOV RBX, RAX`);
    s.emit(`LEA R10, json_heap_ptr`);
    s.emit(`MOV QWORD PTR [R10], RBX`);
    s.emit(`ADD RAX, 1073741824`);
    s.emit(`LEA R10, json_heap_end`);
    s.emit(`MOV QWORD PTR [R10], RAX`);
    s.emit(`POP RAX`);
    s.emit(`JMP ${haHave}`);
    void haInit;
  }

  // json_set_err: RDI = code. Sets json_err if not already set.
  s.emit(`json_set_err:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`); s.emit(`PUSH R10`);
  s.emit(`LEA R10, json_err`);
  s.emit(`MOV RAX, QWORD PTR [R10]`);
  s.emit(`TEST RAX, RAX`);
  const se = s.lbl("se");
  s.emit(`JNZ ${se}`);
  s.emit(`MOV QWORD PTR [R10], RDI`);
  s.emit(`${se}:`);
  s.emit(`POP R10`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_clz64: RDI = x (nonzero) -> RAX = clz.
  s.emit(`json_clz64:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`); s.emit(`PUSH R10`);
  s.emit(`MOV RAX, RDI`);
  s.emit(`XOR ECX, ECX`);
  for (const [bits, sar] of [[32, 32], [16, 48], [8, 56], [4, 60], [2, 62]]) {
    const d = s.lbl("clz");
    s.emit(`MOV R10, RAX`);
    s.emit(`SAR R10, ${sar}`);
    s.emit(`TEST R10, R10`);
    s.emit(`JNZ ${d}`);
    s.emit(`SHL RAX, ${bits}`);
    s.emit(`ADD ECX, ${bits}`);
    s.emit(`${d}:`);
  }
  const clz1 = s.lbl("clz");
  s.emit(`TEST RAX, RAX`);
  s.emit(`JL ${clz1}`);
  s.emit(`ADD ECX, 1`);
  s.emit(`${clz1}:`);
  s.emit(`MOV RAX, RCX`);
  s.emit(`POP R10`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_divmod10: RDI = x -> RAX = x/10, RDX = x%10 (x >= 0).
  s.emit(`json_divmod10:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`); s.emit(`PUSH RCX`);
  s.emit(`MOV RAX, RDI`);
  s.emit(`MOV RCX, 0xCCCCCCCCCCCCCCCD`);
  s.emit(`MUL RCX`);
  s.emit(`MOV RAX, RDX`);
  s.emit(`SAR RAX, 3`);
  s.emit(`MOV RCX, RAX`);
  s.emit(`IMUL RCX, RCX, 10`);
  s.emit(`SUB RDI, RCX`);
  s.emit(`MOV RDX, RDI`);
  s.emit(`POP RCX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_umulh: RDI = a, RSI = b -> RAX = high64(a*b).
  s.emit(`json_umulh:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`MOV RAX, RDI`);
  s.emit(`MUL RSI`);
  s.emit(`MOV RAX, RDX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  emitRyu(s);
  emitWriteDouble(s);
  emitValues(s);
  emitParseNumber(s);
  emitParse(s);
  emitStringify(s);
}

// ---------------------------------------------------------------------------
// Ryu d2s: double bits -> shortest decimal digits.
// json_d2d: RDI = bits (finite, nonzero) -> RAX = mantissa u64, RDX = exponent s64.
// ---------------------------------------------------------------------------
function emitRyu(s) {
  if (s.done.has("ryu")) return; s.done.add("ryu");
  const T = ryuTables();
  s.dataQwords("j_ryu_split", T.split);
  s.dataQwords("j_ryu_inv", T.inv);

  // json_mulshift64: RDI=m(<2^55), RSI=table ptr, EDX=j -> RAX=floor(m*M/2^j)
  s.emit(`json_mulshift64:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`PUSH RBX`); s.emit(`PUSH R12`); s.emit(`PUSH R13`);
  s.emit(`PUSH R14`); s.emit(`PUSH R15`);
  s.emit(`MOV R14, RDI`);
  s.emit(`MOV R12, RSI`);
  s.emit(`MOV R15D, EDX`);
  s.emit(`MOV RAX, R14`);
  s.emit(`MOV R8, QWORD PTR [R12]`);
  s.emit(`MUL R8`);                        // RDX:RAX = m*lo
  s.emit(`PUSH RDX`);                      // high0
  s.emit(`MOV RAX, R14`);
  s.emit(`MOV R8, QWORD PTR [R12+8]`);
  s.emit(`MUL R8`);                        // RDX=high1, RAX=low1
  s.emit(`MOV RBX, RAX`);
  s.emit(`POP R8`);                        // high0
  s.emit(`ADD R8, RBX`);                   // R8 = sum
  s.emit(`MOV R9, 0x8000000000000000`);    // carry = (sum < low1) unsigned
  s.emit(`MOV R10, R8`); s.emit(`XOR R10, R9`);
  s.emit(`XOR RBX, R9`);
  s.emit(`XOR R11, R11`);
  s.emit(`CMP R10, RBX`);
  s.emit(`SETL R11B`);
  s.emit(`MOVZX R11, R11B`);
  s.emit(`ADD RDX, R11`);                  // RDX = hi
  s.emit(`MOV ECX, R15D`);
  s.emit(`SUB ECX, 64`);                   // dist
  s.emit(`CMP ECX, 49`);
  const msLo = s.lbl("ms"), msDone = s.lbl("ms");
  s.emit(`JL ${msLo}`);
  s.emit(`CMP ECX, 58`);
  s.emit(`JG ${msLo}`);
  const entries = [];
  for (let d = 49; d <= 58; d++) entries.push(s.lbl("mse"));
  const tree = (lo, hi) => {
    if (lo === hi) return entries[lo - 49];
    const mid = (lo + hi) >> 1;
    const l = s.lbl("mst"), r = tree(mid + 1, hi), ll = tree(lo, mid);
    s.emit(`${l}:`); s.emit(`CMP ECX, ${mid}`);
    s.emit(`JG ${r}`); s.emit(`JMP ${ll}`);
    return l;
  };
  s.emit(`JMP ${tree(49, 58)}`);
  for (let d = 49; d <= 58; d++) {
    const k = 64 - d;
    s.emit(`${entries[d - 49]}:`);
    s.emit(`MOV RAX, RDX`); s.emit(`SHL RAX, ${k}`);
    s.emit(`MOV R10, R8`); s.emit(`SAR R10, ${d}`);
    s.emit(`MOV R11, R8`); s.emit(`SAR R11, 63`);
    s.emit(`SHL R11, ${k}`); s.emit(`NEG R11`); s.emit(`DEC R11`);
    s.emit(`AND R10, R11`); s.emit(`OR RAX, R10`);
    s.emit(`JMP ${msDone}`);
  }
  s.emit(`${msLo}:`);                      // bit-loop fallback (unreachable per paper)
  s.emit(`MOV RAX, R8`);
  const msBit = s.lbl("msb");
  s.emit(`${msBit}:`);
  s.emit(`TEST ECX, ECX`); s.emit(`JZ ${msDone}`);
  s.emit(`MOV R10, RDX`); s.emit(`AND R10, 1`); s.emit(`SHL R10, 63`);
  emitShr64(s, "RDX", "R11", 1);
  emitShr64(s, "RAX", "R11", 1);
  s.emit(`OR RAX, R10`);
  s.emit(`DEC ECX`); s.emit(`JMP ${msBit}`);
  s.emit(`${msDone}:`);
  s.emit(`POP R15`); s.emit(`POP R14`); s.emit(`POP R13`);
  s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_d2d core (see design notes in module header).
  s.emit(`json_d2d:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`PUSH RBX`); s.emit(`PUSH R12`); s.emit(`PUSH R13`);
  s.emit(`PUSH R14`); s.emit(`PUSH R15`);
  s.emit(`SUB RSP, 96`);
  // frame: -8:lastRemoved -16:flags(bit0 vmTz,bit1 vrTz,bit2 accept) -24:mmShift
  //        -32:q -40:e2 -48:m2 -56:ieeeE -64:tmp -72:table -80:j
  s.emit(`MOV RAX, RDI`);
  emitShr64(s, "RAX", "R10", 52);
  s.emit(`AND RAX, 0x7FF`);
  s.emit(`MOV QWORD PTR [RBP-56], RAX`);   // ieeeE
  s.emit(`MOV R10, 0xFFFFFFFFFFFFF`);
  s.emit(`MOV R11, RDI`);
  s.emit(`AND R11, R10`);                  // R11 = ieeeM
  s.emit(`MOV R8, 0x10000000000000`);
  const dSub = s.lbl("d2d"), dNorm = s.lbl("d2d");
  s.emit(`TEST RAX, RAX`); s.emit(`JNZ ${dSub}`);
  s.emit(`MOV QWORD PTR [RBP-40], -1076`);
  s.emit(`MOV QWORD PTR [RBP-48], R11`);
  s.emit(`JMP ${dNorm}`);
  s.emit(`${dSub}:`);
  s.emit(`SUB RAX, 1077`);
  s.emit(`MOV QWORD PTR [RBP-40], RAX`);   // e2
  s.emit(`OR R11, R8`);
  s.emit(`MOV QWORD PTR [RBP-48], R11`);   // m2
  s.emit(`${dNorm}:`);
  s.emit(`MOV RAX, QWORD PTR [RBP-56]`);
  s.emit(`CMP RAX, 1`);
  s.emit(`SETLE AL`); s.emit(`MOVZX RAX, AL`);
  s.emit(`TEST R11, R11`);
  const dMs0 = s.lbl("d2d");
  s.emit(`JZ ${dMs0}`);
  s.emit(`MOV RAX, 1`);
  s.emit(`${dMs0}:`);
  s.emit(`MOV QWORD PTR [RBP-24], RAX`);   // mmShift
  s.emit(`MOV QWORD PTR [RBP-16], 0`);     // flags = 0
  s.emit(`MOV QWORD PTR [RBP-8], 0`);      // lastRemoved = 0
  s.emit(`MOV RAX, QWORD PTR [RBP-48]`);
  s.emit(`TEST RAX, 1`);
  const dAb = s.lbl("d2d");
  s.emit(`JNZ ${dAb}`);
  s.emit(`MOV RAX, QWORD PTR [RBP-16]`);
  s.emit(`OR RAX, 4`);
  s.emit(`MOV QWORD PTR [RBP-16], RAX`);   // acceptBounds
  s.emit(`${dAb}:`);
  const d2dStep3 = s.lbl("d2d");
  s.emit(`JMP ${d2dStep3}`);

  // --- d2d small helpers ---
  s.emit(`json_div5:`);                    // RDI=x -> RAX=x/5
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`); s.emit(`PUSH RCX`);
  s.emit(`MOV RAX, RDI`);
  s.emit(`MOV RCX, 0xCCCCCCCCCCCCCCCD`);
  s.emit(`MUL RCX`);
  s.emit(`MOV RAX, RDX`); s.emit(`SAR RAX, 2`);
  s.emit(`POP RCX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
  s.emit(`json_div100:`);                  // RDI=x -> RAX=x/100 (x>=0)
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`); s.emit(`PUSH RCX`);
  s.emit(`MOV RAX, RDI`); s.emit(`SAR RAX, 2`);
  s.emit(`MOV RCX, 0x28F5C28F5C28F5C3`);
  s.emit(`MUL RCX`);
  s.emit(`MOV RAX, RDX`); s.emit(`SAR RAX, 2`);
  s.emit(`POP RCX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
  s.emit(`json_pow5factor:`);              // RDI=v -> RAX=exponent of 5 in v
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`PUSH RBX`); s.emit(`PUSH RCX`);
  s.emit(`MOV RBX, RDI`); s.emit(`XOR ECX, ECX`);
  const pfL = s.lbl("pf"), pfD = s.lbl("pf");
  s.emit(`${pfL}:`);
  s.emit(`MOV RDI, RBX`); s.emit(`CALL json_div5`);
  s.emit(`IMUL RDX, RAX, 5`); s.emit(`SUB RBX, RDX`);
  s.emit(`TEST RBX, RBX`); s.emit(`JNZ ${pfD}`);
  s.emit(`MOV RBX, RAX`); s.emit(`INC ECX`); s.emit(`JMP ${pfL}`);
  s.emit(`${pfD}:`); s.emit(`MOV RAX, RCX`);
  s.emit(`POP RCX`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
  s.emit(`json_mulpow5:`);                 // RDI=v, ESI=p -> RAX=(pow5factor(v)>=p)
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`); s.emit(`PUSH RSI`);
  s.emit(`CALL json_pow5factor`); s.emit(`POP RSI`);
  s.emit(`CMP RAX, RSI`); s.emit(`SETGE AL`); s.emit(`MOVZX RAX, AL`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
  s.emit(`json_mulpow2:`);                 // RDI=v, ESI=p -> RAX=((v&((1<<p)-1))==0)
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`); s.emit(`PUSH RCX`);
  s.emit(`MOV RAX, RDI`); s.emit(`MOV ECX, ESI`);
  s.emit(`TEST ECX, ECX`);
  const mp2d = s.lbl("mp2"), mp2f = s.lbl("mp2"), mp2l = s.lbl("mp2");
  s.emit(`JZ ${mp2d}`);
  s.emit(`${mp2l}:`);
  s.emit(`TEST RAX, 1`); s.emit(`JNZ ${mp2f}`);
  s.emit(`SAR RAX, 1`); s.emit(`DEC ECX`); s.emit(`JNZ ${mp2l}`);
  s.emit(`${mp2d}:`); s.emit(`MOV RAX, 1`);
  s.emit(`POP RCX`); s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
  s.emit(`${mp2f}:`); s.emit(`XOR RAX, RAX`);
  s.emit(`POP RCX`); s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  s.emit(`${d2dStep3}:`);
  // ---- Step 3: scale ----
  const msTriple = () => {
    const m2s = `QWORD PTR [RBP-48]`, mms = `QWORD PTR [RBP-24]`;
    s.emit(`MOV RAX, ${m2s}`); s.emit(`SHL RAX, 2`); s.emit(`ADD RAX, 2`);
    s.emit(`MOV RDI, RAX`);
    s.emit(`MOV RSI, QWORD PTR [RBP-72]`); s.emit(`MOV EDX, DWORD PTR [RBP-80]`);
    s.emit(`CALL json_mulshift64`); s.emit(`MOV R12, RAX`);
    s.emit(`MOV RAX, ${m2s}`); s.emit(`SHL RAX, 2`);
    s.emit(`SUB RAX, 1`); s.emit(`SUB RAX, ${mms}`);
    s.emit(`MOV RDI, RAX`);
    s.emit(`MOV RSI, QWORD PTR [RBP-72]`); s.emit(`MOV EDX, DWORD PTR [RBP-80]`);
    s.emit(`CALL json_mulshift64`); s.emit(`MOV R13, RAX`);
    s.emit(`MOV RAX, ${m2s}`); s.emit(`SHL RAX, 2`);
    s.emit(`MOV RDI, RAX`);
    s.emit(`MOV RSI, QWORD PTR [RBP-72]`); s.emit(`MOV EDX, DWORD PTR [RBP-80]`);
    s.emit(`CALL json_mulshift64`); s.emit(`MOV RBX, RAX`);
  };
  const d2dENeg = s.lbl("d2d"), d2dAfter = s.lbl("d2d");
  s.emit(`MOV RAX, QWORD PTR [RBP-40]`);
  s.emit(`TEST RAX, RAX`); s.emit(`JL ${d2dENeg}`);
  // e2 >= 0: q = log10Pow2(e2)-(e2>3); k=124+pow5bits(q); j=-e2+q+k
  s.emit(`MOV RCX, RAX`);
  s.emit(`IMUL RCX, RCX, 78913`); s.emit(`SAR RCX, 18`);
  s.emit(`CMP RAX, 3`);
  const d2dQ1 = s.lbl("d2d");
  s.emit(`JLE ${d2dQ1}`); s.emit(`SUB RCX, 1`); s.emit(`${d2dQ1}:`);
  s.emit(`MOV QWORD PTR [RBP-32], RCX`); s.emit(`MOV R14, RCX`);
  s.emit(`MOV RDX, RCX`);
  s.emit(`IMUL RDX, RDX, 1217359`); s.emit(`SAR RDX, 19`); s.emit(`ADD RDX, 125`);
  s.emit(`NEG RAX`); s.emit(`ADD RAX, RCX`); s.emit(`ADD RAX, RDX`);
  s.emit(`MOV QWORD PTR [RBP-80], RAX`);
  s.emit(`LEA RAX, j_ryu_inv`); s.emit(`SHL RCX, 4`); s.emit(`ADD RAX, RCX`);
  s.emit(`MOV QWORD PTR [RBP-72], RAX`);
  msTriple();
  s.emit(`MOV EAX, DWORD PTR [RBP-32]`); s.emit(`CMP EAX, 21`);
  const d2dTZ1 = s.lbl("d2d"), d2dTZ2 = s.lbl("d2d"), d2dTZ3 = s.lbl("d2d"), d2dTZ6 = s.lbl("d2d");
  s.emit(`JG ${d2dTZ1}`);
  s.emit(`MOV RAX, QWORD PTR [RBP-48]`); s.emit(`SHL RAX, 2`);
  s.emit(`MOV QWORD PTR [RBP-64], RAX`);
  s.emit(`MOV RDI, RAX`); s.emit(`CALL json_div5`);
  s.emit(`IMUL RCX, RAX, 5`);
  s.emit(`MOV RDX, QWORD PTR [RBP-64]`); s.emit(`SUB RDX, RCX`);
  s.emit(`TEST RDX, RDX`); s.emit(`JNZ ${d2dTZ2}`);
  s.emit(`MOV RDI, QWORD PTR [RBP-64]`);
  s.emit(`MOV ESI, DWORD PTR [RBP-32]`); s.emit(`CALL json_mulpow5`);
  s.emit(`TEST RAX, RAX`); s.emit(`JZ ${d2dTZ3}`);
  s.emit(`MOV RAX, QWORD PTR [RBP-16]`); s.emit(`OR RAX, 2`);
  s.emit(`MOV QWORD PTR [RBP-16], RAX`); s.emit(`JMP ${d2dTZ3}`);
  s.emit(`${d2dTZ2}:`);
  s.emit(`MOV RAX, QWORD PTR [RBP-16]`); s.emit(`TEST RAX, 4`);
  s.emit(`JZ ${d2dTZ6}`);
  s.emit(`MOV RDI, QWORD PTR [RBP-64]`); s.emit(`SUB RDI, 1`);
  s.emit(`SUB RDI, QWORD PTR [RBP-24]`);
  s.emit(`MOV ESI, DWORD PTR [RBP-32]`); s.emit(`CALL json_mulpow5`);
  s.emit(`TEST RAX, RAX`); s.emit(`JZ ${d2dTZ3}`);
  s.emit(`MOV RAX, QWORD PTR [RBP-16]`); s.emit(`OR RAX, 1`);
  s.emit(`MOV QWORD PTR [RBP-16], RAX`); s.emit(`JMP ${d2dTZ3}`);
  s.emit(`${d2dTZ6}:`);
  s.emit(`MOV RDI, QWORD PTR [RBP-64]`); s.emit(`ADD RDI, 2`);
  s.emit(`MOV ESI, DWORD PTR [RBP-32]`); s.emit(`CALL json_mulpow5`);
  s.emit(`SUB R12, RAX`);
  s.emit(`JMP ${d2dTZ3}`);
  s.emit(`${d2dTZ3}:`); s.emit(`JMP ${d2dAfter}`);
  s.emit(`${d2dTZ1}:`); s.emit(`JMP ${d2dAfter}`);
  // e2 < 0: q = log10Pow5(-e2)-(-e2>1); e10=q+e2; i=-e2-q; k=pow5bits(i)-125; j=q-k
  s.emit(`${d2dENeg}:`);
  s.emit(`MOV RCX, QWORD PTR [RBP-40]`); s.emit(`NEG RCX`);
  s.emit(`MOV RDX, RCX`);
  s.emit(`IMUL RDX, RDX, 732923`); s.emit(`SAR RDX, 20`);
  s.emit(`CMP RCX, 1`);
  const d2dQ2 = s.lbl("d2d");
  s.emit(`JLE ${d2dQ2}`); s.emit(`SUB RDX, 1`); s.emit(`${d2dQ2}:`);
  s.emit(`MOV QWORD PTR [RBP-32], RDX`);
  s.emit(`MOV RAX, QWORD PTR [RBP-40]`); s.emit(`ADD RAX, RDX`); s.emit(`MOV R14, RAX`);
  s.emit(`SUB RCX, RDX`); s.emit(`MOV QWORD PTR [RBP-64], RCX`);
  s.emit(`IMUL RDX, RCX, 1217359`); s.emit(`SAR RDX, 19`);
  s.emit(`ADD RDX, 1`); s.emit(`SUB RDX, 125`);
  s.emit(`MOV RAX, QWORD PTR [RBP-32]`); s.emit(`SUB RAX, RDX`);
  s.emit(`MOV QWORD PTR [RBP-80], RAX`);
  s.emit(`LEA RAX, j_ryu_split`);
  s.emit(`MOV RCX, QWORD PTR [RBP-64]`); s.emit(`SHL RCX, 4`); s.emit(`ADD RAX, RCX`);
  s.emit(`MOV QWORD PTR [RBP-72], RAX`);
  msTriple();
  s.emit(`MOV EAX, DWORD PTR [RBP-32]`); s.emit(`CMP EAX, 1`);
  const d2dTZ4 = s.lbl("d2d"), d2dTZ5 = s.lbl("d2d");
  s.emit(`JG ${d2dTZ4}`);
  s.emit(`MOV RAX, QWORD PTR [RBP-16]`); s.emit(`OR RAX, 2`);
  s.emit(`MOV QWORD PTR [RBP-16], RAX`);
  s.emit(`TEST RAX, 4`); s.emit(`JZ ${d2dTZ5}`);
  s.emit(`MOV RAX, QWORD PTR [RBP-24]`); s.emit(`CMP RAX, 1`);
  s.emit(`JNE ${d2dAfter}`);
  s.emit(`MOV RAX, QWORD PTR [RBP-16]`); s.emit(`OR RAX, 1`);
  s.emit(`MOV QWORD PTR [RBP-16], RAX`); s.emit(`JMP ${d2dAfter}`);
  s.emit(`${d2dTZ5}:`); s.emit(`SUB R12, 1`); s.emit(`JMP ${d2dAfter}`);
  s.emit(`${d2dTZ4}:`); s.emit(`CMP EAX, 63`); s.emit(`JGE ${d2dAfter}`);
  s.emit(`MOV RAX, QWORD PTR [RBP-48]`); s.emit(`SHL RAX, 2`);
  s.emit(`MOV RDI, RAX`); s.emit(`MOV ESI, DWORD PTR [RBP-32]`);
  s.emit(`CALL json_mulpow2`);
  s.emit(`TEST RAX, RAX`); s.emit(`JZ ${d2dAfter}`);
  s.emit(`MOV RAX, QWORD PTR [RBP-16]`); s.emit(`OR RAX, 2`);
  s.emit(`MOV QWORD PTR [RBP-16], RAX`);
  s.emit(`${d2dAfter}:`);
  // ---- Step 4: digit loop ----
  // RBX=vr R12=vp R13=vm R14=e10 R15=removed; [RBP-8]=lastRemoved [RBP-16]=flags
  const dGen = s.lbl("d2d"), dCom = s.lbl("d2d"), dOut = s.lbl("d2d");
  s.emit(`MOV RAX, QWORD PTR [RBP-16]`);
  s.emit(`TEST RAX, 3`); s.emit(`JNZ ${dGen}`); s.emit(`JMP ${dCom}`);
  // general case
  s.emit(`${dGen}:`);
  const gL = s.lbl("d2dg"), gB = s.lbl("d2dg");
  s.emit(`${gL}:`);
  s.emit(`MOV RDI, R12`); s.emit(`CALL json_divmod10`); s.emit(`MOV R8, RAX`);
  s.emit(`MOV RDI, R13`); s.emit(`CALL json_divmod10`);
  s.emit(`MOV R9, RAX`); s.emit(`MOV R10, RDX`);
  s.emit(`CMP R8, R9`); s.emit(`JLE ${gB}`);
  s.emit(`MOV RDI, RBX`); s.emit(`CALL json_divmod10`); // RAX=vrD10,RDX=vrM10
  s.emit(`MOV R11, RAX`);
  s.emit(`TEST R10, R10`); // vmTz &= (vmMod10==0)
  const gC1 = s.lbl("d2dg");
  s.emit(`JZ ${gC1}`);
  s.emit(`MOV R10, QWORD PTR [RBP-16]`); s.emit(`AND R10, -2`);
  s.emit(`MOV QWORD PTR [RBP-16], R10`);
  s.emit(`${gC1}:`);
  s.emit(`MOV R10, QWORD PTR [RBP-8]`); s.emit(`TEST R10, R10`); // vrTz &= (last==0)
  const gC2 = s.lbl("d2dg");
  s.emit(`JZ ${gC2}`);
  s.emit(`MOV R10, QWORD PTR [RBP-16]`); s.emit(`AND R10, -3`);
  s.emit(`MOV QWORD PTR [RBP-16], R10`);
  s.emit(`${gC2}:`);
  s.emit(`MOV QWORD PTR [RBP-8], RDX`);
  s.emit(`MOV RBX, R11`); s.emit(`MOV R12, R8`); s.emit(`MOV R13, R9`);
  s.emit(`INC R15`); s.emit(`JMP ${gL}`);
  s.emit(`${gB}:`);
  s.emit(`MOV RAX, QWORD PTR [RBP-16]`); s.emit(`TEST RAX, 1`);
  const g2D = s.lbl("d2dg");
  s.emit(`JZ ${g2D}`);
  const g2L = s.lbl("d2dg"), g2B = s.lbl("d2dg");
  s.emit(`${g2L}:`);
  s.emit(`MOV RDI, R13`); s.emit(`CALL json_divmod10`); // RAX=vmD10,RDX=vmM10
  s.emit(`TEST RDX, RDX`); s.emit(`JNZ ${g2B}`);
  s.emit(`MOV R8, RAX`);
  s.emit(`MOV RDI, R12`); s.emit(`CALL json_divmod10`); s.emit(`MOV R9, RAX`);
  s.emit(`MOV RDI, RBX`); s.emit(`CALL json_divmod10`); // RAX=vrD10,RDX=vrM10
  s.emit(`MOV R10, RAX`); s.emit(`MOV R11, RDX`);
  s.emit(`MOV RDX, QWORD PTR [RBP-8]`); s.emit(`TEST RDX, RDX`);
  const g2C = s.lbl("d2dg");
  s.emit(`JZ ${g2C}`);
  s.emit(`MOV RDX, QWORD PTR [RBP-16]`); s.emit(`AND RDX, -3`);
  s.emit(`MOV QWORD PTR [RBP-16], RDX`);
  s.emit(`${g2C}:`);
  s.emit(`MOV QWORD PTR [RBP-8], R11`);
  s.emit(`MOV QWORD PTR [RBP-64], R8`); // stash vmD10
  s.emit(`MOV RBX, R10`); s.emit(`MOV R12, R9`);
  s.emit(`MOV R13, QWORD PTR [RBP-64]`);
  s.emit(`INC R15`); s.emit(`JMP ${g2L}`);
  s.emit(`${g2B}:`);
  s.emit(`${g2D}:`);
  // if vrTz && lastRemoved==5 && vr%2==0: lastRemoved=4
  s.emit(`MOV RAX, QWORD PTR [RBP-16]`); s.emit(`TEST RAX, 2`);
  const gS = s.lbl("d2dg");
  s.emit(`JZ ${gS}`);
  s.emit(`MOV RAX, QWORD PTR [RBP-8]`); s.emit(`CMP RAX, 5`); s.emit(`JNE ${gS}`);
  s.emit(`TEST RBX, 1`); s.emit(`JNZ ${gS}`);
  s.emit(`MOV QWORD PTR [RBP-8], 4`);
  s.emit(`${gS}:`);
  // output = vr + ((vr==vm && (!accept || !vmTz)) || lastRemoved>=5)
  s.emit(`XOR R8D, R8D`);
  s.emit(`CMP RBX, R13`); 
  const gO1 = s.lbl("d2dg"), gO2 = s.lbl("d2dg");
  s.emit(`JNE ${gO1}`);
  s.emit(`MOV RAX, QWORD PTR [RBP-16]`);
  s.emit(`TEST RAX, 4`); s.emit(`JZ ${gO2}`);
  s.emit(`TEST RAX, 1`); s.emit(`JNZ ${gO1}`);
  s.emit(`${gO2}:`); s.emit(`MOV R8D, 1`); s.emit(`JMP ${dOut}`);
  s.emit(`${gO1}:`);
  s.emit(`MOV RAX, QWORD PTR [RBP-8]`); s.emit(`CMP RAX, 5`);
  s.emit(`SETGE AL`); s.emit(`MOVZX R8D, AL`);
  s.emit(`${dOut}:`);
  s.emit(`ADD RBX, R8`);
  s.emit(`JMP ${dCom}_ret`);
  // common case
  s.emit(`${dCom}:`);
  s.emit(`MOV QWORD PTR [RBP-64], 0`); // roundUp = false
  s.emit(`MOV RDI, R12`); s.emit(`CALL json_div100`); s.emit(`MOV R8, RAX`);
  s.emit(`MOV RDI, R13`); s.emit(`CALL json_div100`); s.emit(`MOV R9, RAX`);
  s.emit(`CMP R8, R9`);
  const cS = s.lbl("d2dc");
  s.emit(`JLE ${cS}`);
  s.emit(`MOV RDI, RBX`); s.emit(`CALL json_div100`); s.emit(`MOV R10, RAX`);
  s.emit(`IMUL RCX, R10, 100`);
  s.emit(`MOV RDX, RBX`); s.emit(`SUB RDX, RCX`);
  s.emit(`CMP RDX, 50`); s.emit(`SETGE AL`); s.emit(`MOVZX RAX, AL`);
  s.emit(`MOV QWORD PTR [RBP-64], RAX`);
  s.emit(`MOV RBX, R10`); s.emit(`MOV R12, R8`); s.emit(`MOV R13, R9`);
  s.emit(`ADD R15, 2`);
  s.emit(`${cS}:`);
  const cL = s.lbl("d2dc"), cB = s.lbl("d2dc");
  s.emit(`${cL}:`);
  s.emit(`MOV RDI, R12`); s.emit(`CALL json_divmod10`); s.emit(`MOV R8, RAX`);
  s.emit(`MOV RDI, R13`); s.emit(`CALL json_divmod10`); s.emit(`MOV R9, RAX`);
  s.emit(`CMP R8, R9`); s.emit(`JLE ${cB}`);
  s.emit(`MOV RDI, RBX`); s.emit(`CALL json_divmod10`); // RAX=vrD10,RDX=vrM10
  s.emit(`CMP RDX, 5`); s.emit(`SETGE CL`); s.emit(`MOVZX RCX, CL`);
  s.emit(`MOV QWORD PTR [RBP-64], RCX`);
  s.emit(`MOV RBX, RAX`); s.emit(`MOV R12, R8`); s.emit(`MOV R13, R9`);
  s.emit(`INC R15`); s.emit(`JMP ${cL}`);
  s.emit(`${cB}:`);
  s.emit(`MOV RAX, QWORD PTR [RBP-64]`);
  s.emit(`CMP RBX, R13`); 
  const cO = s.lbl("d2dc");
  s.emit(`JNE ${cO}`); s.emit(`MOV RAX, 1`);
  s.emit(`${cO}:`); s.emit(`ADD RBX, RAX`);
  s.emit(`${dCom}_ret:`);
  s.emit(`MOV RAX, RBX`);              // mantissa
  s.emit(`MOV RDX, R14`); s.emit(`ADD RDX, R15`); // exponent = e10+removed
  s.emit(`ADD RSP, 96`);
  s.emit(`POP R15`); s.emit(`POP R14`); s.emit(`POP R13`);
  s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
}

// json_write_double: RDI = double bits, RSI = out u16 ptr -> RAX = new out ptr.
// Writes shortest round-trip decimal per JS rules. Caller guarantees finite nonzero or zero.
function emitWriteDouble(s) {
  if (s.done.has("wrdbl")) return; s.done.add("wrdbl");
  emitDigitsRev(s);
  s.emit(`json_write_double:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`PUSH RBX`); s.emit(`PUSH R12`); s.emit(`PUSH R13`);
  s.emit(`PUSH R14`); s.emit(`PUSH R15`);
  s.emit(`SUB RSP, 64`);
  s.emit(`MOV R14, RSI`); s.emit(`MOV R15, RDI`); // R14=out, R15=bits
  s.emit(`MOV RAX, R15`); emitShr64(s, "RAX", "R10", 63);
  s.emit(`TEST RAX, RAX`);
  const wPos = s.lbl("wd");
  s.emit(`JZ ${wPos}`);
  s.emit(`MOV WORD PTR [R14], 45`); s.emit(`ADD R14, 2`);
  s.emit(`${wPos}:`);
  s.emit(`MOV R10, 0x7FFFFFFFFFFFFFFF`);
  s.emit(`MOV RAX, R15`); s.emit(`AND RAX, R10`);
  s.emit(`TEST RAX, RAX`);
  const wNz = s.lbl("wd"), wDone = s.lbl("wd");
  s.emit(`JNZ ${wNz}`);
  s.emit(`MOV WORD PTR [R14], 48`); s.emit(`ADD R14, 2`);
  s.emit(`JMP ${wDone}`);
  s.emit(`${wNz}:`);
  s.emit(`MOV RDI, RAX`); s.emit(`CALL json_d2d`);
  // RAX=mantissa, RDX=exp. Digits reversed -> [RSP], RCX=k.
  s.emit(`MOV RDI, RAX`); s.emit(`MOV RSI, RSP`);
  s.emit(`CALL json_digits_rev`);
  // R12=k, R13=n=exp+k, R14=out. Digit i (0=msd) = [RSP + k-1-i].
  s.emit(`MOV R12, RCX`);
  s.emit(`ADD RDX, RCX`); s.emit(`MOV R13, RDX`);
  // macro: emit digit R10D (0=msd). Clobbers RAX,R11.
  const putDigit = () => {
    s.emit(`MOV RAX, R12`); s.emit(`SUB RAX, R10`); s.emit(`DEC RAX`);
    s.emit(`MOVZX R11D, BYTE PTR [RSP+RAX]`);
    s.emit(`MOV WORD PTR [R14], R11W`); s.emit(`ADD R14, 2`);
  };
  // macro: emit char imm C. Clobbers R11.
  const putChar = (c) => {
    s.emit(`MOV R11W, ${c}`); s.emit(`MOV WORD PTR [R14], R11W`); s.emit(`ADD R14, 2`);
  };
  const wA = s.lbl("wd"), wB = s.lbl("wd"), wC = s.lbl("wd"), wD = s.lbl("wd");
  s.emit(`CMP R13, 0`); s.emit(`JLE ${wC}_chk`);
  s.emit(`CMP R13, 21`); s.emit(`JG ${wD}`);
  s.emit(`CMP R12, R13`); s.emit(`JLE ${wA}`); s.emit(`JMP ${wB}`);
  s.emit(`${wC}_chk:`);
  s.emit(`CMP R13, -6`); s.emit(`JG ${wC}`); s.emit(`JMP ${wD}`);
  // A: k<=n<=21: digits then (n-k) zeros
  s.emit(`${wA}:`);
  s.emit(`XOR R10D, R10D`);
  const wAl = s.lbl("wd");
  s.emit(`${wAl}:`); s.emit(`CMP R10, R12`); s.emit(`JGE ${wAl}_z`);
  putDigit(); s.emit(`INC R10`); s.emit(`JMP ${wAl}`);
  s.emit(`${wAl}_z:`);
  s.emit(`MOV RAX, R13`); s.emit(`SUB RAX, R12`); // zeros = n-k
  s.emit(`TEST RAX, RAX`); const wAl2 = s.lbl("wd");
  s.emit(`JZ ${wAl2}`);
  s.emit(`${wAl2}_l:`); putChar(48); s.emit(`DEC RAX`); s.emit(`JNZ ${wAl2}_l`);
  s.emit(`${wAl2}:`); s.emit(`JMP ${wDone}`);
  // B: 0<n<=21, n<k: first n digits, '.', rest
  s.emit(`${wB}:`);
  s.emit(`XOR R10D, R10D`);
  const wBl = s.lbl("wd");
  s.emit(`${wBl}:`); s.emit(`CMP R10, R13`); s.emit(`JGE ${wBl}_d`);
  putDigit(); s.emit(`INC R10`); s.emit(`JMP ${wBl}`);
  s.emit(`${wBl}_d:`); putChar(46);
  const wBl2 = s.lbl("wd");
  s.emit(`${wBl2}:`); s.emit(`CMP R10, R12`); s.emit(`JGE ${wDone}`);
  putDigit(); s.emit(`INC R10`); s.emit(`JMP ${wBl2}`);
  // C: -6<n<=0: "0.", (-n) zeros, digits
  s.emit(`${wC}:`);
  putChar(48); putChar(46);
  s.emit(`MOV RAX, R13`); s.emit(`NEG RAX`); // zeros = -n
  s.emit(`TEST RAX, RAX`); const wCl2 = s.lbl("wd");
  s.emit(`JZ ${wCl2}`);
  s.emit(`${wCl2}_l:`); putChar(48); s.emit(`DEC RAX`); s.emit(`JNZ ${wCl2}_l`);
  s.emit(`${wCl2}:`);
  s.emit(`XOR R10D, R10D`);
  const wCl = s.lbl("wd");
  s.emit(`${wCl}:`); s.emit(`CMP R10, R12`); s.emit(`JGE ${wDone}`);
  putDigit(); s.emit(`INC R10`); s.emit(`JMP ${wCl}`);
  // D: d0 '.' rest 'e' sign exp(n-1)
  s.emit(`${wD}:`);
  s.emit(`XOR R10D, R10D`); putDigit();
  s.emit(`CMP R12, 1`); const wDl = s.lbl("wd");
  s.emit(`JLE ${wDl}_e`);
  putChar(46);
  s.emit(`MOV R10D, 1`);
  s.emit(`${wDl}:`); s.emit(`CMP R10, R12`); s.emit(`JGE ${wDl}_e`);
  putDigit(); s.emit(`INC R10`); s.emit(`JMP ${wDl}`);
  s.emit(`${wDl}_e:`); putChar(101); // 'e'
  s.emit(`MOV RAX, R13`); s.emit(`DEC RAX`); // exp = n-1 (signed)
  s.emit(`TEST RAX, RAX`);
  const wDp = s.lbl("wd"), wDq = s.lbl("wd");
  s.emit(`JGE ${wDp}`);
  putChar(45); // '-'
  s.emit(`NEG RAX`);
  s.emit(`JMP ${wDq}`);
  s.emit(`${wDp}:`); putChar(43); // '+'
  s.emit(`${wDq}:`);
  // RAX = |exp|; write decimal digits (via json_digits_rev into [RSP+32], then forward)
  s.emit(`MOV RDI, RAX`); s.emit(`LEA RSI, [RSP+32]`);
  s.emit(`CALL json_digits_rev`); // RCX = count, reversed at [RSP+32]
  s.emit(`XOR R10D, R10D`);
  const wDe = s.lbl("wd");
  s.emit(`${wDe}:`); s.emit(`CMP R10, RCX`); s.emit(`JGE ${wDone}`);
  s.emit(`MOV RAX, RCX`); s.emit(`SUB RAX, R10`); s.emit(`DEC RAX`);
  s.emit(`MOVZX R11D, BYTE PTR [RSP+32+RAX]`);
  s.emit(`MOV WORD PTR [R14], R11W`); s.emit(`ADD R14, 2`);
  s.emit(`INC R10`); s.emit(`JMP ${wDe}`);
  s.emit(`${wDone}:`);
  s.emit(`MOV RAX, R14`);
  s.emit(`ADD RSP, 64`);
  s.emit(`POP R15`); s.emit(`POP R14`); s.emit(`POP R13`);
  s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
}
// json_digits_rev: RDI = mantissa (>0), RSI = buf -> RCX = count; buf[i] = digit byte (reversed).
function emitDigitsRev(s) {
  if (s.done.has("drev")) return; s.done.add("drev");
  s.emit(`json_digits_rev:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`); s.emit(`PUSH RBX`);
  s.emit(`MOV RBX, RDI`); s.emit(`XOR ECX, ECX`);
  const l = s.lbl("dr");
  s.emit(`${l}:`);
  s.emit(`MOV RDI, RBX`); s.emit(`CALL json_divmod10`); // RAX=q,RDX=r
  s.emit(`ADD RDX, 48`);
  s.emit(`MOV BYTE PTR [RSI+RCX], DL`);
  s.emit(`INC RCX`);
  s.emit(`MOV RBX, RAX`);
  s.emit(`TEST RAX, RAX`); s.emit(`JNZ ${l}`);
  s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
}

// ---------------------------------------------------------------------------
// Value constructors (S1-conformant). All preserve RBX,R12-R15.
// ---------------------------------------------------------------------------
function emitValues(s) {
  if (s.done.has("vals")) return; s.done.add("vals");

  // json_alloc_double: RDI = ieee bits -> RAX = doubleref (TYPE_DOUBLE).
  s.emit(`json_alloc_double:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`PUSH RBX`); s.emit(`PUSH R12`);
  s.emit(`MOV RBX, RDI`);
  s.emit(`MOV RDI, 32`);
  s.emit(`CALL __merkava_alloc`);
  s.emit(`MOV DWORD PTR [RAX], ${TYPE_DOUBLE}`);
  s.emit(`MOV DWORD PTR [RAX+4], 0`);
  s.emit(`MOV QWORD PTR [RAX+8], 0`);
  s.emit(`MOV QWORD PTR [RAX+16], RBX`);
  s.emit(`OR RAX, 2`);
  s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // (Fixnum-vs-double for parse is decided in the decimal domain by
  // json_parse_number; no bits->fixnum path is needed.)

  // json_new_string: RDI = src u16 ptr, RSI = len units -> RAX = tagged string.
  // len<=3 -> smallstr immediate; else heap STRING.
  s.emit(`json_new_string:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`PUSH RBX`); s.emit(`PUSH R12`); s.emit(`PUSH R13`); s.emit(`PUSH R14`);
  s.emit(`CMP RSI, 3`);
  const nsHeap = s.lbl("ns");
  s.emit(`JG ${nsHeap}`);
  s.emit(`MOV RBX, RDI`); s.emit(`MOV R12, RSI`);
  s.emit(`XOR RAX, RAX`);
  s.emit(`TEST R12, R12`);
  const ns0 = s.lbl("ns");
  s.emit(`JZ ${ns0}`);
  s.emit(`MOVZX R13D, WORD PTR [RBX]`);
  s.emit(`SHL R13, 5`); s.emit(`OR RAX, R13`);
  s.emit(`CMP R12, 1`); s.emit(`JLE ${ns0}`);
  s.emit(`MOVZX R13D, WORD PTR [RBX+2]`);
  s.emit(`SHL R13, 21`); s.emit(`OR RAX, R13`);
  s.emit(`CMP R12, 2`); s.emit(`JLE ${ns0}`);
  s.emit(`MOVZX R13D, WORD PTR [RBX+4]`);
  s.emit(`SHL R13, 37`); s.emit(`OR RAX, R13`);
  s.emit(`${ns0}:`);
  s.emit(`MOV R13, R12`); s.emit(`SHL R13, 3`); s.emit(`OR RAX, R13`);
  s.emit(`OR RAX, 3`);
  s.emit(`POP R14`); s.emit(`POP R13`); s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
  s.emit(`${nsHeap}:`);
  s.emit(`MOV RBX, RDI`); s.emit(`MOV R12, RSI`);
  s.emit(`MOV RDI, RSI`); s.emit(`SHL RDI, 1`); s.emit(`ADD RDI, 16`);
  s.emit(`CALL __merkava_alloc`);   // RAX = ptr (size already rounded by alloc)
  s.emit(`MOV DWORD PTR [RAX], ${TYPE_STRING}`);
  s.emit(`MOV DWORD PTR [RAX+4], 0`);
  s.emit(`MOV QWORD PTR [RAX+8], R12`);
  s.emit(`LEA R13, [RAX+16]`);
  const nsCp = s.lbl("ns"), nsCpD = s.lbl("ns");
  s.emit(`${nsCp}:`);
  s.emit(`TEST R12, R12`); s.emit(`JZ ${nsCpD}`);
  s.emit(`MOVZX R14D, WORD PTR [RBX]`);
  s.emit(`MOV WORD PTR [R13], R14W`);
  s.emit(`ADD RBX, 2`); s.emit(`ADD R13, 2`);
  s.emit(`DEC R12`); s.emit(`JMP ${nsCp}`);
  s.emit(`${nsCpD}:`);
  s.emit(`OR RAX, 1`);
  s.emit(`POP R14`); s.emit(`POP R13`); s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_string_len: RDI = tagged string -> RAX = len units.
  s.emit(`json_string_len:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`MOV RAX, RDI`); s.emit(`AND RAX, 7`);
  s.emit(`CMP RAX, 3`);
  const slHeap = s.lbl("sl"), slDone = s.lbl("sl");
  s.emit(`JNE ${slHeap}`);
  s.emit(`MOV RAX, RDI`); s.emit(`SAR RAX, 3`); s.emit(`AND RAX, 3`); // smallstr: top bits 0, SAR==SHR
  s.emit(`JMP ${slDone}`);
  s.emit(`${slHeap}:`);
  s.emit(`MOV RAX, RDI`); s.emit(`AND RAX, -8`);
  s.emit(`MOV RAX, QWORD PTR [RAX+8]`);
  s.emit(`${slDone}:`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_string_unit: RDI = tagged string, RSI = idx -> RAX = unit u16.
  s.emit(`json_string_unit:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`); s.emit(`PUSH R10`);
  s.emit(`MOV RAX, RDI`); s.emit(`AND RAX, 7`);
  s.emit(`CMP RAX, 3`);
  const suHeap = s.lbl("su");
  s.emit(`JNE ${suHeap}`);
  // smallstr: shift = 5+16*idx; idx in 0..2
  s.emit(`CMP RSI, 0`); const su1 = s.lbl("su"), su2 = s.lbl("su"), suD = s.lbl("su");
  s.emit(`JE ${su1}`); s.emit(`CMP RSI, 1`); s.emit(`JE ${su2}`);
  s.emit(`MOV RAX, RDI`); emitShr64(s, "RAX", "R10", 37); s.emit(`JMP ${suD}`);
  s.emit(`${su1}:`); s.emit(`MOV RAX, RDI`); emitShr64(s, "RAX", "R10", 5); s.emit(`JMP ${suD}`);
  s.emit(`${su2}:`); s.emit(`MOV RAX, RDI`); emitShr64(s, "RAX", "R10", 21);
  s.emit(`${suD}:`); s.emit(`AND RAX, 0xFFFF`);
  s.emit(`POP R10`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
  s.emit(`${suHeap}:`);
  s.emit(`MOV RAX, RDI`); s.emit(`AND RAX, -8`);
  s.emit(`MOV R10, RSI`); s.emit(`SHL R10, 1`);
  s.emit(`ADD RAX, R10`); s.emit(`ADD RAX, 16`);
  s.emit(`MOVZX RAX, WORD PTR [RAX]`);
  s.emit(`POP R10`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_string_equals: RDI, RSI = tagged strings -> RAX = 1/0.
  s.emit(`json_string_equals:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`PUSH RBX`); s.emit(`PUSH R12`); s.emit(`PUSH R13`); s.emit(`PUSH R14`);
  s.emit(`MOV RBX, RDI`); s.emit(`MOV R12, RSI`);
  s.emit(`MOV RAX, RDI`); s.emit(`AND RAX, 7`);
  s.emit(`MOV RDX, RSI`); s.emit(`AND RDX, 7`);
  s.emit(`CMP RAX, 3`); const seS = s.lbl("se"), seD = s.lbl("se");
  s.emit(`JNE ${seS}`);
  s.emit(`CMP RDX, 3`); s.emit(`JNE ${seS}`);
  s.emit(`CMP RBX, R12`); s.emit(`SETE AL`); s.emit(`MOVZX RAX, AL`);
  s.emit(`JMP ${seD}`);
  s.emit(`${seS}:`);
  s.emit(`MOV RDI, RBX`); s.emit(`CALL json_string_len`); s.emit(`MOV R13, RAX`);
  s.emit(`MOV RDI, R12`); s.emit(`CALL json_string_len`);
  s.emit(`CMP R13, RAX`); const se2 = s.lbl("se");
  s.emit(`JNE ${se2}`);
  s.emit(`XOR R14D, R14D`);
  const seL = s.lbl("se");
  s.emit(`${seL}:`);
  s.emit(`CMP R14, R13`); s.emit(`JGE ${seD}`); // all equal -> return 1 (RAX preset below)
  s.emit(`MOV RDI, RBX`); s.emit(`MOV RSI, R14`); s.emit(`CALL json_string_unit`);
  s.emit(`MOV R10, RAX`);
  s.emit(`MOV RDI, R12`); s.emit(`MOV RSI, R14`); s.emit(`CALL json_string_unit`);
  s.emit(`CMP R10, RAX`); s.emit(`JNE ${se2}`);
  s.emit(`INC R14`); s.emit(`JMP ${seL}`);
  s.emit(`${se2}:`); s.emit(`XOR RAX, RAX`); s.emit(`JMP ${seD}_x`);
  s.emit(`${seD}:`); s.emit(`MOV RAX, 1`);
  s.emit(`${seD}_x:`);
  s.emit(`POP R14`); s.emit(`POP R13`); s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_new_array: RDI = capacity -> RAX = tagged array (len 0).
  s.emit(`json_new_array:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`); s.emit(`PUSH RBX`); s.emit(`PUSH R12`);
  s.emit(`MOV RBX, RDI`);
  s.emit(`SHL RDI, 3`); s.emit(`ADD RDI, 16`);
  s.emit(`CALL __merkava_alloc`);
  s.emit(`MOV DWORD PTR [RAX], ${TYPE_ARRAY}`);
  s.emit(`MOV DWORD PTR [RAX+4], 0`);
  s.emit(`MOV R12, RBX`); s.emit(`AND R12, 0xFFFFFFFF`);
  s.emit(`MOV QWORD PTR [RAX+8], R12`); // meta = (0<<32)|cap
  s.emit(`OR RAX, 1`);
  s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_array_push: RDI = array tagged, RSI = value -> RAX = new array tagged.
  s.emit(`json_array_push:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`PUSH RBX`); s.emit(`PUSH R12`); s.emit(`PUSH R13`); s.emit(`PUSH R14`); s.emit(`PUSH R15`);
  s.emit(`MOV RBX, RDI`); s.emit(`MOV R15, RSI`);
  s.emit(`MOV R12, RDI`); s.emit(`AND R12, -8`);
  s.emit(`MOV R13, QWORD PTR [R12+8]`); // meta
  s.emit(`MOV RAX, R13`); emitShr64(s, "RAX", "R10", 32); // len
  s.emit(`MOV R14, R13`); s.emit(`AND R14, 0xFFFFFFFF`); // cap
  s.emit(`CMP RAX, R14`);
  const apGrow = s.lbl("ap");
  s.emit(`JGE ${apGrow}`);
  s.emit(`MOV R10, RAX`); s.emit(`SHL R10, 3`);
  s.emit(`MOV QWORD PTR [R12+16+R10], R15`);
  s.emit(`INC RAX`); s.emit(`SHL RAX, 32`); s.emit(`OR RAX, R14`);
  s.emit(`MOV QWORD PTR [R12+8], RAX`);
  s.emit(`MOV RAX, RBX`);
  const apDone = s.lbl("ap");
  s.emit(`JMP ${apDone}`);
  s.emit(`${apGrow}:`);
  // newcap = cap ? cap*2 : 4
  s.emit(`MOV RDI, R14`); s.emit(`SHL RDI, 1`);
  s.emit(`TEST R14, R14`); const apC4 = s.lbl("ap");
  s.emit(`JNZ ${apC4}`); s.emit(`MOV RDI, 4`);
  s.emit(`${apC4}:`);
  s.emit(`PUSH RAX`); // len
  s.emit(`CALL json_new_array`); // RAX = new array
  s.emit(`MOV R12, RAX`); s.emit(`AND R12, -8`); // new ptr
  s.emit(`POP RAX`); // len
  // copy len values: old ptr in RBX&~7
  s.emit(`MOV R10, RBX`); s.emit(`AND R10, -8`);
  s.emit(`XOR ECX, ECX`);
  const apCp = s.lbl("ap"), apCpD = s.lbl("ap");
  s.emit(`${apCp}:`); s.emit(`CMP RCX, RAX`); s.emit(`JGE ${apCpD}`);
  s.emit(`MOV R11, QWORD PTR [R10+16+RCX*8]`);
  s.emit(`MOV QWORD PTR [R12+16+RCX*8], R11`);
  s.emit(`INC RCX`); s.emit(`JMP ${apCp}`);
  s.emit(`${apCpD}:`);
  s.emit(`MOV R10, RAX`); s.emit(`SHL R10, 3`);
  s.emit(`MOV QWORD PTR [R12+16+R10], R15`);
  s.emit(`INC RAX`);
  s.emit(`MOV R10, QWORD PTR [R12+8]`); s.emit(`AND R10, 0xFFFFFFFF`);
  s.emit(`SHL RAX, 32`); s.emit(`OR RAX, R10`);
  s.emit(`MOV QWORD PTR [R12+8], RAX`);
  s.emit(`MOV RAX, R12`); s.emit(`OR RAX, 1`);
  s.emit(`${apDone}:`);
  s.emit(`POP R15`); s.emit(`POP R14`); s.emit(`POP R13`);
  s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_array_len: RDI = array -> RAX = len.
  s.emit(`json_array_len:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`MOV RAX, RDI`); s.emit(`AND RAX, -8`);
  s.emit(`MOV RAX, QWORD PTR [RAX+8]`);
  emitShr64(s, "RAX", "R10", 32);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
  // json_array_get: RDI = array, RSI = idx -> RAX = value.
  s.emit(`json_array_get:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`MOV RAX, RDI`); s.emit(`AND RAX, -8`);
  s.emit(`MOV R10, RSI`); s.emit(`SHL R10, 3`);
  s.emit(`ADD RAX, R10`); s.emit(`MOV RAX, QWORD PTR [RAX+16]`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
  // json_array_set: RDI = array, RSI = idx, RDX = value.
  s.emit(`json_array_set:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`MOV RAX, RDI`); s.emit(`AND RAX, -8`);
  s.emit(`MOV R10, RSI`); s.emit(`SHL R10, 3`);
  s.emit(`ADD RAX, R10`); s.emit(`MOV QWORD PTR [RAX+16], RDX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_new_object: -> RAX = tagged object with empty shape.
  s.emit(`json_new_object:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`PUSH RBX`); s.emit(`PUSH R12`);
  s.emit(`MOV RDI, 16`);
  s.emit(`CALL __merkava_alloc`);   // shape: type=8, N=0
  s.emit(`MOV DWORD PTR [RAX], ${TYPE_SHAPE}`);
  s.emit(`MOV DWORD PTR [RAX+4], 0`);
  s.emit(`MOV QWORD PTR [RAX+8], 0`);
  s.emit(`MOV RBX, RAX`);           // shape ptr (raw)
  s.emit(`MOV RDI, 16`);
  s.emit(`CALL __merkava_alloc`);   // object
  s.emit(`MOV DWORD PTR [RAX], ${TYPE_OBJECT}`);
  s.emit(`MOV DWORD PTR [RAX+4], 0`);
  s.emit(`MOV QWORD PTR [RAX+8], RBX`);
  s.emit(`OR RAX, 1`);
  s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_obj_set: RDI = obj tagged, RSI = key (tagged string), RDX = value -> RAX = new obj tagged.
  // Duplicate key: overwrite in place (keeps first position, like V8).
  // json_obj_set: RDI = obj tagged, RSI = key (tagged string), RDX = value -> RAX = new obj tagged.
  // Duplicate key: overwrite in place (keeps first position, like V8).
  // Shapes use identity slots (slots[i] = i).
  s.emit(`json_obj_set:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`PUSH RBX`); s.emit(`PUSH R12`); s.emit(`PUSH R13`);
  s.emit(`PUSH R14`); s.emit(`PUSH R15`);
  s.emit(`SUB RSP, 32`);
  s.emit(`MOV RBX, RDI`);
  s.emit(`MOV QWORD PTR [RSP], RSI`);      // key
  s.emit(`MOV QWORD PTR [RSP+8], RDX`);    // value
  s.emit(`MOV R12, RDI`); s.emit(`AND R12, -8`);   // obj ptr
  s.emit(`MOV R13, QWORD PTR [R12+8]`);             // shape ptr (raw)
  s.emit(`MOV R14, QWORD PTR [R13+8]`);             // N
  s.emit(`XOR R15D, R15D`);
  const osL = s.lbl("os"), osF = s.lbl("os"), osNF = s.lbl("os"), osDone = s.lbl("os");
  s.emit(`${osL}:`);
  s.emit(`CMP R15, R14`); s.emit(`JGE ${osNF}`);
  s.emit(`MOV RDI, QWORD PTR [R13+16+R15*8]`);
  s.emit(`MOV RSI, QWORD PTR [RSP]`);
  s.emit(`CALL json_string_equals`);
  s.emit(`TEST RAX, RAX`); s.emit(`JNZ ${osF}`);
  s.emit(`INC R15`); s.emit(`JMP ${osL}`);
  s.emit(`${osF}:`);                       // found: values[R15] = value (identity slot)
  s.emit(`MOV RAX, QWORD PTR [RSP+8]`);
  s.emit(`MOV QWORD PTR [R12+16+R15*8], RAX`);
  s.emit(`MOV RAX, RBX`);
  s.emit(`JMP ${osDone}`);
  s.emit(`${osNF}:`);
  s.emit(`MOV RAX, R14`); s.emit(`INC RAX`);
  s.emit(`MOV QWORD PTR [RSP+16], RAX`);    // newN
  // new shape: 16 + newN*8 + newN*4
  s.emit(`MOV RDI, RAX`); s.emit(`SHL RDI, 3`);
  s.emit(`MOV R10, RAX`); s.emit(`SHL R10, 2`);
  s.emit(`ADD RDI, R10`); s.emit(`ADD RDI, 16`);
  s.emit(`CALL __merkava_alloc`);
  s.emit(`MOV DWORD PTR [RAX], ${TYPE_SHAPE}`);
  s.emit(`MOV DWORD PTR [RAX+4], 0`);
  s.emit(`MOV R10, QWORD PTR [RSP+16]`);
  s.emit(`MOV QWORD PTR [RAX+8], R10`);
  s.emit(`MOV QWORD PTR [RSP+24], RAX`);    // new shape
  s.emit(`MOV R11, RAX`);
  // copy names
  s.emit(`XOR ECX, ECX`);
  const osC1 = s.lbl("os"), osC1D = s.lbl("os");
  s.emit(`${osC1}:`); s.emit(`CMP RCX, R14`); s.emit(`JGE ${osC1D}`);
  s.emit(`MOV R10, QWORD PTR [R13+16+RCX*8]`);
  s.emit(`MOV QWORD PTR [R11+16+RCX*8], R10`);
  s.emit(`INC RCX`); s.emit(`JMP ${osC1}`);
  s.emit(`${osC1D}:`);
  s.emit(`MOV R10, QWORD PTR [RSP]`);       // key
  s.emit(`MOV QWORD PTR [R11+16+R14*8], R10`);
  // identity slots at newshape+16+newN*8
  s.emit(`MOV RDX, QWORD PTR [RSP+16]`); s.emit(`SHL RDX, 3`);
  s.emit(`ADD RDX, R11`); s.emit(`ADD RDX, 16`);
  s.emit(`XOR ECX, ECX`);
  const osC1s = s.lbl("os"), osC1sD = s.lbl("os");
  s.emit(`${osC1s}:`);
  s.emit(`CMP RCX, QWORD PTR [RSP+16]`); s.emit(`JGE ${osC1sD}`);
  s.emit(`MOV DWORD PTR [RDX+RCX*4], ECX`);
  s.emit(`INC RCX`); s.emit(`JMP ${osC1s}`);
  s.emit(`${osC1sD}:`);
  // new object: 16 + newN*8
  s.emit(`MOV RDI, QWORD PTR [RSP+16]`); s.emit(`SHL RDI, 3`); s.emit(`ADD RDI, 16`);
  s.emit(`CALL __merkava_alloc`);
  s.emit(`MOV DWORD PTR [RAX], ${TYPE_OBJECT}`);
  s.emit(`MOV DWORD PTR [RAX+4], 0`);
  s.emit(`MOV R10, QWORD PTR [RSP+24]`);
  s.emit(`MOV QWORD PTR [RAX+8], R10`);
  s.emit(`MOV R11, RAX`);
  s.emit(`XOR ECX, ECX`);
  const osC2 = s.lbl("os"), osC2D = s.lbl("os");
  s.emit(`${osC2}:`); s.emit(`CMP RCX, R14`); s.emit(`JGE ${osC2D}`);
  s.emit(`MOV R10, QWORD PTR [R12+16+RCX*8]`);
  s.emit(`MOV QWORD PTR [R11+16+RCX*8], R10`);
  s.emit(`INC RCX`); s.emit(`JMP ${osC2}`);
  s.emit(`${osC2D}:`);
  s.emit(`MOV R10, QWORD PTR [RSP+8]`);
  s.emit(`MOV QWORD PTR [R11+16+R14*8], R10`);
  s.emit(`MOV RAX, R11`); s.emit(`OR RAX, 1`);
  s.emit(`${osDone}:`);
  s.emit(`ADD RSP, 32`);
  s.emit(`POP R15`); s.emit(`POP R14`); s.emit(`POP R13`);
  s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_obj_nkeys: RDI = obj -> RAX = N.
  s.emit(`json_obj_nkeys:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`MOV RAX, RDI`); s.emit(`AND RAX, -8`);
  s.emit(`MOV RAX, QWORD PTR [RAX+8]`);
  s.emit(`MOV RAX, QWORD PTR [RAX+8]`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
  // json_obj_key: RDI = obj, RSI = i -> RAX = key tagged.
  s.emit(`json_obj_key:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`MOV RAX, RDI`); s.emit(`AND RAX, -8`);
  s.emit(`MOV RAX, QWORD PTR [RAX+8]`);
  s.emit(`MOV R10, RSI`); s.emit(`SHL R10, 3`);
  s.emit(`ADD RAX, R10`);
  s.emit(`MOV RAX, QWORD PTR [RAX+16]`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
  // json_obj_val: RDI = obj, RSI = i -> RAX = value tagged (via slot).
  s.emit(`json_obj_val:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`); s.emit(`PUSH R10`);
  s.emit(`MOV RAX, RDI`); s.emit(`AND RAX, -8`);
  s.emit(`MOV R10, QWORD PTR [RAX+8]`); // shape
  s.emit(`MOV R11, QWORD PTR [R10+8]`); // N
  s.emit(`SHL R11, 3`); s.emit(`ADD R10, R11`); s.emit(`ADD R10, 16`);
  s.emit(`MOV EAX, DWORD PTR [R10+RSI*4]`); // slot
  s.emit(`MOV R10, RAX`); s.emit(`SHL R10, 3`);
  // RAX was obj ptr&~7? No, RAX got clobbered. Reload.
  s.emit(`MOV RAX, RDI`); s.emit(`AND RAX, -8`);
  s.emit(`ADD RAX, R10`); s.emit(`MOV RAX, QWORD PTR [RAX+16]`);
  s.emit(`POP R10`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
  // json_obj_find: RDI = obj, RSI = key -> RAX = value or V_UNDEFINED.
  s.emit(`json_obj_find:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`PUSH RBX`); s.emit(`PUSH R12`); s.emit(`PUSH R13`); s.emit(`PUSH R14`);
  s.emit(`MOV RBX, RDI`); s.emit(`MOV R14, RSI`);
  s.emit(`CALL json_obj_nkeys`); s.emit(`MOV R13, RAX`);
  s.emit(`XOR R12D, R12D`);
  const ofL = s.lbl("of"), ofF = s.lbl("of"), ofNF = s.lbl("of");
  s.emit(`${ofL}:`); s.emit(`CMP R12, R13`); s.emit(`JGE ${ofNF}`);
  s.emit(`MOV RDI, RBX`); s.emit(`MOV RSI, R12`); s.emit(`CALL json_obj_key`);
  s.emit(`MOV RDI, RAX`); s.emit(`MOV RSI, R14`); s.emit(`CALL json_string_equals`);
  s.emit(`TEST RAX, RAX`); s.emit(`JNZ ${ofF}`);
  s.emit(`INC R12`); s.emit(`JMP ${ofL}`);
  s.emit(`${ofF}:`);
  s.emit(`MOV RDI, RBX`); s.emit(`MOV RSI, R12`); s.emit(`CALL json_obj_val`);
  const ofD = s.lbl("of");
  s.emit(`JMP ${ofD}`);
  s.emit(`${ofNF}:`); s.emit(`MOV RAX, ${asmImm(V_UNDEFINED)}`);
  s.emit(`${ofD}:`);
  s.emit(`POP R14`); s.emit(`POP R13`); s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
}

// ---------------------------------------------------------------------------
// Number parsing: decimal -> tagged value.
// ---------------------------------------------------------------------------
function emitParseNumber(s) {
  if (s.done.has("pnum")) return; s.done.add("pnum");
  const T = parseTables();
  s.dataQwords("j_parse_p5", T.p5);
  s.dataQwords("j_parse_sq", T.sq);
  s.dataQwords("j_parse_inv5", T.inv5);
  s.dataQwords("j_parse_tq", T.tq);

  // json_try_fixnum: RDI=D(!=0,<2^64), RSI=e10, RDX=neg -> RAX=fixnum or 0.
  s.emit(`json_try_fixnum:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`PUSH RBX`); s.emit(`PUSH R12`); s.emit(`PUSH R13`);
  s.emit(`MOV RBX, RDI`); s.emit(`MOV R12, RSI`); s.emit(`MOV R13, RDX`);
  s.emit(`TEST R12, R12`);
  const tfNeg = s.lbl("tf"), tfNo = s.lbl("tf"), tfYes = s.lbl("tf");
  s.emit(`JL ${tfNeg}`);
  // e10 >= 0
  s.emit(`CMP R12, 18`); s.emit(`JG ${tfNo}`);
  s.emit(`MOV RAX, RBX`);
  s.emit(`TEST R12, R12`); s.emit(`JZ ${tfYes}_chk`);
  s.emit(`MOV R10, 115292150460684697`); // (2^60-1)/10
  const tfL = s.lbl("tf");
  s.emit(`${tfL}:`);
  s.emit(`CMP RAX, R10`); s.emit(`JG ${tfNo}`);
  s.emit(`IMUL RAX, RAX, 10`);
  s.emit(`DEC R12`); s.emit(`JNZ ${tfL}`);
  s.emit(`JMP ${tfYes}_chk`);
  s.emit(`${tfNeg}:`);
  // e10 < 0: k = -e10; if k > 19: no
  s.emit(`NEG R12`);
  s.emit(`CMP R12, 19`); s.emit(`JG ${tfNo}`);
  s.emit(`MOV RAX, RBX`);
  s.emit(`TEST R12, R12`); s.emit(`JZ ${tfYes}_chk`);
  const tfL2 = s.lbl("tf");
  s.emit(`${tfL2}:`);
  s.emit(`MOV RDI, RAX`); s.emit(`CALL json_divmod10`); // RAX=q,RDX=r
  s.emit(`TEST RDX, RDX`); s.emit(`JNZ ${tfNo}`);
  s.emit(`DEC R12`); s.emit(`JNZ ${tfL2}`);
  s.emit(`${tfYes}_chk:`);
  // RAX = v; check < 2^60
  s.emit(`MOV R10, 1152921504606846976`); // 2^60
  s.emit(`CMP RAX, R10`); s.emit(`JGE ${tfNo}`);
  s.emit(`TEST R13, R13`); s.emit(`JZ ${tfYes}`);
  s.emit(`NEG RAX`); // -v
  s.emit(`CMP RAX, R10`); // RAX >= -2^60?
  // signed: RAX < -2^60  <=>  RAX < -R10. Compute -R10.
  s.emit(`NEG R10`); // -2^60
  s.emit(`CMP RAX, R10`); s.emit(`JL ${tfNo}`);
  s.emit(`${tfYes}:`);
  s.emit(`SHL RAX, 3`); // fixnum
  const tfDone = s.lbl("tf");
  s.emit(`JMP ${tfDone}`);
  s.emit(`${tfNo}:`); s.emit(`XOR RAX, RAX`);
  s.emit(`${tfDone}:`);
  s.emit(`POP R13`); s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);

  // json_eisel_lemire: RDI=D(!=0,<2^64), RSI=q, RDX=neg -> RAX=double bits.
  // Falls back to json_parse_exact (tail call) when the 128-bit result is ambiguous.
  s.emit(`json_eisel_lemire:`);
  s.emit(`PUSH RBP`); s.emit(`MOV RBP, RSP`);
  s.emit(`PUSH RBX`); s.emit(`PUSH R12`); s.emit(`PUSH R13`);
  s.emit(`PUSH R14`); s.emit(`PUSH R15`);
  s.emit(`SUB RSP, 80`);
  // [RSP]=D [RSP+8]=q [RSP+16]=neg [RSP+24]=lz [RSP+32]=E2 [RSP+40]=Mlo [RSP+48]=Mhi [RSP+56]=Q
  s.emit(`MOV QWORD PTR [RSP], RDI`);
  s.emit(`MOV QWORD PTR [RSP+8], RSI`);
  s.emit(`MOV QWORD PTR [RSP+16], RDX`);
  s.emit(`CALL json_clz64`);             // RDI=D -> RAX=lz
  s.emit(`MOV QWORD PTR [RSP+24], RAX`);
  // wp = D << lz (shift loop; lz<64)
  s.emit(`MOV RAX, QWORD PTR [RSP]`);
  s.emit(`MOV RCX, QWORD PTR [RSP+24]`);
  s.emit(`TEST RCX, RCX`);
  const elSh = s.lbl("el"), elShD = s.lbl("el");
  s.emit(`JZ ${elShD}`);
  s.emit(`${elSh}:`); s.emit(`SHL RAX, 1`); s.emit(`DEC RCX`); s.emit(`JNZ ${elSh}`);
  s.emit(`${elShD}:`);
  s.emit(`MOV R14, RAX`);               // R14 = wp
  // Q = |q|
  s.emit(`MOV RAX, QWORD PTR [RSP+8]`);
  s.emit(`MOV R13, RAX`); s.emit(`SAR R13, 63`);
  s.emit(`XOR RAX, R13`); s.emit(`SUB RAX, R13`);
  s.emit(`MOV QWORD PTR [RSP+56], RAX`); // Q
  s.emit(`MOV RDX, QWORD PTR [RSP+8]`);
  s.emit(`TEST RDX, RDX`);
  const elNeg = s.lbl("el"), elMul = s.lbl("el");
  s.emit(`JL ${elNeg}`);
  // q >= 0: V=j_parse_p5[Q], s=j_parse_sq[Q]; E2 = 191+s+q-lz
  s.emit(`LEA RDI, j_parse_p5`);
  s.emit(`MOV RAX, QWORD PTR [RSP+56]`); s.emit(`SHL RAX, 4`); s.emit(`ADD RDI, RAX`);
  s.emit(`LEA RAX, j_parse_sq`);
  s.emit(`MOV R10, QWORD PTR [RSP+56]`); s.emit(`SHL R10, 3`); s.emit(`ADD RAX, R10`);
  s.emit(`MOV R10, QWORD PTR [RAX]`);    // s (signed)
  s.emit(`MOV RAX, 191`); s.emit(`ADD RAX, R10`);
  s.emit(`ADD RAX, QWORD PTR [RSP+8]`);  // +q
  s.emit(`SUB RAX, QWORD PTR [RSP+24]`); // -lz
  s.emit(`MOV QWORD PTR [RSP+32], RAX`); // E2
  s.emit(`JMP ${elMul}`);
  s.emit(`${elNeg}:`);
  // q < 0: V=j_parse_inv5[Q], t=j_parse_tq[Q]; E2 = 191-lz-Q-t
  s.emit(`LEA RDI, j_parse_inv5`);
  s.emit(`MOV RAX, QWORD PTR [RSP+56]`); s.emit(`SHL RAX, 4`); s.emit(`ADD RDI, RAX`);
  s.emit(`LEA RAX, j_parse_tq`);
  s.emit(`MOV R10, QWORD PTR [RSP+56]`); s.emit(`SHL R10, 3`); s.emit(`ADD RAX, R10`);
  s.emit(`MOV R10, QWORD PTR [RAX]`);    // t
  s.emit(`MOV RAX, 191`);
  s.emit(`SUB RAX, QWORD PTR [RSP+24]`); // -lz
  s.emit(`SUB RAX, QWORD PTR [RSP+56]`); // -Q
  s.emit(`SUB RAX, R10`);                // -t
  s.emit(`MOV QWORD PTR [RSP+32], RAX`); // E2
  s.emit(`${elMul}:`);
  // M128 = (wp * V) >> 64. V=[lo,hi] at RDI. R14=wp.
  s.emit(`MOV RAX, R14`);
  s.emit(`MOV R8, QWORD PTR [RDI]`); s.emit(`MUL R8`); // RDX=r1_hi
  s.emit(`MOV R15, RDX`);               // r1_hi
  s.emit(`MOV RAX, R14`);
  s.emit(`MOV R8, QWORD PTR [RDI+8]`); s.emit(`MUL R8`); // RDX=r2_hi,RAX=r2_lo
  s.emit(`ADD R15, RAX`);               // Mlo = r1_hi + r2_lo
  // carry = (Mlo < r2_lo) unsigned
  s.emit(`MOV R10, 0x8000000000000000`);
  s.emit(`MOV R11, R15`); s.emit(`XOR R11, R10`);
  s.emit(`MOV R8, RAX`); s.emit(`XOR R8, R10`);
  s.emit(`XOR R9, R9`);
  s.emit(`CMP R11, R8`); s.emit(`SETL R9B`); s.emit(`MOVZX R9, R9B`);
  s.emit(`ADD RDX, R9`);                // Mhi = r2_hi + carry
  s.emit(`MOV QWORD PTR [RSP+40], R15`); // Mlo
  s.emit(`MOV QWORD PTR [RSP+48], RDX`); // Mhi
  // renormalize: if (Mhi>>63)==0 { M128<<=1; E2-- }
  s.emit(`TEST RDX, RDX`);
  const elRn = s.lbl("el");
  s.emit(`JL ${elRn}`);                 // bit63 set -> no renormalize
  // M128 <<= 1: hi=(hi<<1)|(lo>>63); lo<<=1
  s.emit(`MOV R10, R15`); emitShr64(s, "R10", "R11", 63); // R10 = lo>>63
  s.emit(`SHL RDX, 1`); s.emit(`OR RDX, R10`);
  s.emit(`SHL R15, 1`);
  s.emit(`MOV QWORD PTR [RSP+40], R15`); s.emit(`MOV QWORD PTR [RSP+48], RDX`);
  s.emit(`MOV RAX, QWORD PTR [RSP+32]`); s.emit(`DEC RAX`);
  s.emit(`MOV QWORD PTR [RSP+32], RAX`);
  s.emit(`${elRn}:`);
  // if E2 > 1023: Inf; if E2 < -1022: exact fallback
  s.emit(`MOV RAX, QWORD PTR [RSP+32]`);
  s.emit(`CMP RAX, 1023`);
  const elInf = s.lbl("el"), elSub = s.lbl("el");
  s.emit(`JG ${elInf}`);
  s.emit(`CMP RAX, -1022`);
  s.emit(`JL ${elSub}`);
  // m53 = Mhi >> 11; bit74 = (Mhi>>10)&1; hi10 = Mhi & 0x3FF; lo64 = Mlo
  s.emit(`MOV RAX, QWORD PTR [RSP+48]`);
  s.emit(`MOV R10, RAX`); emitShr64(s, "R10", "R11", 11); // m53
  s.emit(`MOV R11, RAX`); emitShr64(s, "R11", "R8", 10);
  s.emit(`AND R11, 1`);                 // bit74
  s.emit(`AND RAX, 0x3FF`);             // hi10
  s.emit(`MOV R12, QWORD PTR [RSP+40]`); // lo64
  // ambiguous check: f in [2^74-2, 2^74+2]?
  // bit74==0: hi10==0x3FF && lo64>=0xFFFFFFFFFFFFFFFE
  // bit74==1: hi10==0 && lo64<=2
  s.emit(`TEST R11, R11`);
  const elAmb0 = s.lbl("el"), elAmb1 = s.lbl("el"), elAmb = s.lbl("el"), elNoAmb = s.lbl("el");
  s.emit(`JZ ${elAmb0}`);
  s.emit(`TEST RAX, RAX`); s.emit(`JNZ ${elNoAmb}`);
  s.emit(`CMP R12, 2`); s.emit(`JLE ${elAmb}`); s.emit(`JMP ${elNoAmb}`);
  s.emit(`${elAmb0}:`);
  s.emit(`CMP RAX, 0x3FF`); s.emit(`JNE ${elNoAmb}`);
  s.emit(`MOV R8, 0xFFFFFFFFFFFFFFFE`);
  s.emit(`CMP R12, R8`); // unsigned >= ? use flip
  s.emit(`MOV R9, 0x8000000000000000`);
  s.emit(`XOR R12, R9`); s.emit(`XOR R8, R9`);
  s.emit(`CMP R12, R8`); s.emit(`JGE ${elAmb}`); s.emit(`JMP ${elNoAmb}`);
  s.emit(`${elAmb}:`);
  // -> exact fallback (tail call)
  s.emit(`MOV RDI, QWORD PTR [RSP]`);
  s.emit(`MOV RSI, QWORD PTR [RSP+8]`);
  s.emit(`MOV RDX, QWORD PTR [RSP+16]`);
  s.emit(`MOV RCX, QWORD PTR [RSP+32]`);
  s.emit(`ADD RSP, 80`);
  s.emit(`POP R15`); s.emit(`POP R14`); s.emit(`POP R13`);
  s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`);
  s.emit(`JMP json_parse_exact`);       // (D,q,neg,E2) -> bits
  s.emit(`${elSub}:`);
  s.emit(`JMP ${elAmb}`);               // subnormal -> exact (reuse tail call)
  s.emit(`${elInf}:`);
  // Inf: bits = negbit | 0x7FF0000000000000
  s.emit(`MOV RAX, 0x7FF0000000000000`);
  s.emit(`MOV RDX, QWORD PTR [RSP+16]`);
  s.emit(`TEST RDX, RDX`); const elInfN = s.lbl("el");
  s.emit(`JZ ${elInfN}`);
  s.emit(`MOV RDX, 0x8000000000000000`); s.emit(`OR RAX, RDX`);
  s.emit(`${elInfN}:`);
  const elRet = s.lbl("el");
  s.emit(`JMP ${elRet}`);
  s.emit(`${elNoAmb}:`);
  // rounding: f>HALF || (f==HALF && m odd) -> m++. R10=m, R11=bit74, RAX=hi10, R12=lo64.
  s.emit(`TEST R11, R11`);
  const elRUp = s.lbl("el"), elRD = s.lbl("el");
  s.emit(`JZ ${elRD}`);
  s.emit(`MOV R8, RAX`); s.emit(`OR R8, R12`);
  s.emit(`TEST R8, R8`); s.emit(`JNZ ${elRUp}`);
  s.emit(`TEST R10, 1`); s.emit(`JZ ${elRD}`);
  s.emit(`${elRUp}:`);
  s.emit(`ADD R10, 1`);
  s.emit(`MOV R8, 0x20000000000000`);   // 2^53
  s.emit(`CMP R10, R8`); s.emit(`JNE ${elRD}`);
  s.emit(`MOV R10, 0x10000000000000`);  // m = 2^52
  s.emit(`MOV RAX, QWORD PTR [RSP+32]`); s.emit(`INC RAX`);
  s.emit(`MOV QWORD PTR [RSP+32], RAX`); // E2++
  // E2 could become 1024 -> Inf. Handle: if E2>1023 return Inf.
  s.emit(`CMP RAX, 1023`); s.emit(`JLE ${elRD}`);
  s.emit(`MOV RAX, 0x7FF0000000000000`);
  s.emit(`MOV RDX, QWORD PTR [RSP+16]`);
  s.emit(`TEST RDX, RDX`); const elInfN2 = s.lbl("el");
  s.emit(`JZ ${elInfN2}`);
  s.emit(`MOV RDX, 0x8000000000000000`); s.emit(`OR RAX, RDX`);
  s.emit(`${elInfN2}:`);
  s.emit(`JMP ${elRet}`);
  s.emit(`${elRD}:`);
  // bits = negbit | ((E2+1023)<<52) | (m & 0xFFFFFFFFFFFFF)
  s.emit(`MOV RAX, QWORD PTR [RSP+32]`);
  s.emit(`ADD RAX, 1023`); s.emit(`SHL RAX, 52`);
  s.emit(`MOV R8, 0xFFFFFFFFFFFFF`); s.emit(`AND R8, R10`);
  s.emit(`OR RAX, R8`);
  s.emit(`MOV RDX, QWORD PTR [RSP+16]`);
  s.emit(`TEST RDX, RDX`); const elNegB = s.lbl("el");
  s.emit(`JZ ${elNegB}`);
  s.emit(`MOV RDX, 0x8000000000000000`); s.emit(`OR RAX, RDX`);
  s.emit(`${elNegB}:`);
  s.emit(`${elRet}:`);
  s.emit(`ADD RSP, 80`);
  s.emit(`POP R15`); s.emit(`POP R14`); s.emit(`POP R13`);
  s.emit(`POP R12`); s.emit(`POP RBX`);
  s.emit(`MOV RSP, RBP`); s.emit(`POP RBP`); s.emit(`RET`);
}
