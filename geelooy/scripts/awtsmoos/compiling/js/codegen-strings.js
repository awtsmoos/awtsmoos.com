// B"H
// Native tier v2 — STREAM 3/8: NATIVE STRINGS.
//
// String codegen for the Merkava JS -> x86_64 direct-assembly backend.
// This module owns EXCLUSIVELY the string emitters; Stream 7 (asm.js wiring)
// calls these. Pure emitters: input = string-codegen context (cx) + AST nodes,
// output = assembly lines appended to the context's emitter.
//
// VALUE MODEL: the authoritative contract is OBJECT_MODEL.md + value-model.js
// (Stream 1) in this directory. This module imports them and FAILS LOUD if
// they are absent or drift — never a silent fallback.
//
//   - Tagged 64-bit values: tag = v & 7.
//       000 = fixnum61  (signed 61-bit payload: v >> 3, arithmetic)
//       001 = heapref   (raw pointer: v & ~7; 16-aligned by the allocator)
//       011 = smallstr  (≤3 UTF-16 units inline: len=(v>>3)&3, unit i at bit 5+16i)
//       100 = immediate (NaN = (4<<3)|4 = 36 — no allocation on the cold path)
//   - Heap string: 16-byte header (u32 type=1, u32 flags=0, u64 meta=length),
//     then length × u16 code units inline at +16. Leaf for GC (no outgoing refs).
//   - Concat is EAGER per spec §5b: allocate len(a)+len(b) units, memcpy.
//     (No ropes: the type table is closed and STRING must stay GC-leaf.)
//   - Allocation: __merkava_alloc(size) -> 16-aligned ptr (stub here; the
//     production runtime provides it per spec §15).
//
// REGISTER DISCIPLINE (emitted code):
//   RAX = result (tagged). R10/R11 = scratch, dead across CALLs by
//   construction. RBX, R12-R15, RBP, RSP preserved across helpers.
//   Helpers may clobber RAX RCX RDX RSI RDI R8 R9 R10 R11.
//
// ASSEMBLER QUIRKS (self-hosted portable asm; verified empirically):
//   - No SHR: use SAR (lengths/counts are non-negative, identical result).
//   - No unsigned Jcc (JBE/JAE/JB/JA): use signed (values are non-negative).
//   - No REP MOVSW: copies are explicit MOV loops.
//   - BROKEN: `MOVZX r64, WORD PTR [mem]` mis-encodes (byte load). Use
//     `XOR r64,r64` + `MOV r16,[mem]` (AX/CX/DX/BX/SI/DI only; NOT R10W etc).
//   - BROKEN: `[base+disp+index*scale]` addressing. Use base+disp or
//     base+index*scale only (compute with LEA when both are needed).
//   - No imm64 -> memory: stage through a register.
//   - `.data` blobs are byte lists: `label: 0,0,0,0,0,0,0,0` == one qword.
//
// CORRECTNESS NOTES:
//   - The repo's MerkavaASTParser does NOT decode string escapes:
//     Literal.value and TemplateLiteral quasi cooked values are RAW source text
//     (backslashes intact). decodeJsStringUnits() decodes them to UTF-16 code
//     units with full JS semantics (incl. \u{H+}, lone surrogates kept).
//   - charCodeAt out-of-range: JS yields NaN. We return the V_NAN immediate
//     (36) per the spec — no allocation, exact semantics.

import { createRequire } from "module";

// ---------------------------------------------------------------------------
// Stream 1 contract: import ./value-model.js, FAIL LOUD on any problem.
// ---------------------------------------------------------------------------
let VM;
try {
  VM = await import("./value-model.js");
} catch (e) {
  throw new Error(
    "codegen-strings: ./value-model.js is REQUIRED (Stream 1 contract). " +
    "Refusing silent fallback. Underlying: " + (e && e.message));
}
// Pin the exact contract values we codegen against. Any drift fails here,
// at import time, not as a silent miscompile later.
{
  const need = [
    ["TAG_FIXNUM", 0n], ["TAG_HEAPREF", 1n], ["TAG_SMALLSTR", 3n],
    ["TAG_IMM", 4n], ["TAG_MASK", 7n],
    ["TYPE_STRING", 1], ["HEADER_SIZE", 16], ["SSO_MAX_UNITS", 3],
  ];
  for (const [k, v] of need) {
    if (VM[k] !== v)
      throw new Error(`codegen-strings: value-model.js contract drift: ${k} is ${String(VM[k])}, need ${String(v)}`);
  }
  if (VM.V_NAN !== 36n)
    throw new Error(`codegen-strings: V_NAN is ${String(VM.V_NAN)}, need 36n`);
}

/** Where the tag/header constants came from (always value-model.js now). */
export function valueModelSource() { return "value-model.js"; }

export const TAG_FIXNUM = Number(VM.TAG_FIXNUM);
export const TAG_HEAPREF = Number(VM.TAG_HEAPREF);
export const TAG_SMALLSTR = Number(VM.TAG_SMALLSTR);
export const TAG_IMM = Number(VM.TAG_IMM);
export const TAG_MASK = Number(VM.TAG_MASK);
export const TYPE_STRING = VM.TYPE_STRING;
export const HEADER_SIZE = VM.HEADER_SIZE;
export const SSO_MAX = VM.SSO_MAX_UNITS;
export const V_NAN = Number(VM.V_NAN); // 36

/** Encode ≤3 UTF-16 units as a smallstr tagged value (authoritative encoder). */
export function encodeSmallString(units) {
  if (units.length > SSO_MAX) throw new Error("encodeSmallString: >3 units");
  return VM.smallString(unitsToJsString(units)); // BigInt, canonical
}

// ---------------------------------------------------------------------------
// JS string-escape decoder: raw source text -> UTF-16 code units.
// The Merkava parser hands us escapes undecoded; we decode here so codegen
// matches V8 string semantics exactly (verified differentially).
// ---------------------------------------------------------------------------
function parseOctalTail(raw, i, units) {
  let j = i, digits = "";
  while (j < raw.length && digits.length < 3) {
    const c = raw[j];
    if (c < "0" || c > "7") break;
    digits += c; j++;
  }
  units.push(parseInt(digits, 8) & 0x1ff);
  return j - 1;
}

/** @returns {number[]} UTF-16 code units for raw (quotes stripped, escapes raw). */
export function decodeJsStringUnits(raw) {
  const units = [];
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);
    if (c !== 0x5c) { units.push(c); continue; } // not a backslash
    i++;
    if (i >= raw.length) { units.push(0x5c); break; }
    const e = raw[i];
    switch (e) {
      case "n": units.push(0x0a); break;
      case "r": units.push(0x0d); break;
      case "t": units.push(0x09); break;
      case "b": units.push(0x08); break;
      case "f": units.push(0x0c); break;
      case "v": units.push(0x0b); break;
      case "0": {
        const nx = raw[i + 1];
        if (nx >= "0" && nx <= "9") i = parseOctalTail(raw, i, units);
        else units.push(0);
        break;
      }
      case "1": case "2": case "3": case "4":
      case "5": case "6": case "7":
        i = parseOctalTail(raw, i, units); break;
      case "x": {
        const h = raw.substr(i + 1, 2);
        if (/^[0-9A-Fa-f]{2}$/.test(h)) { units.push(parseInt(h, 16)); i += 2; }
        else units.push(0x78);
        break;
      }
      case "u": {
        if (raw[i + 1] === "{") {
          const j = raw.indexOf("}", i + 2);
          if (j < 0) throw new Error("jsStr: unterminated \\u{...}");
          const cp = parseInt(raw.slice(i + 2, j), 16);
          if (!(cp >= 0 && cp <= 0x10ffff) || !/^[0-9A-Fa-f]+$/.test(raw.slice(i + 2, j)))
            throw new Error("jsStr: bad code point escape");
          if (cp >= 0x10000) {
            const v = cp - 0x10000;
            units.push(0xd800 + (v >> 10), 0xdc00 + (v & 0x3ff));
          } else units.push(cp);
          i = j;
        } else {
          const h = raw.substr(i + 1, 4);
          if (/^[0-9A-Fa-f]{4}$/.test(h)) { units.push(parseInt(h, 16)); i += 4; }
          else units.push(0x75);
        }
        break;
      }
      case "\n": break;
      case "\r": if (raw[i + 1] === "\n") i++; break;
      case "\u2028": case "\u2029": break;
      default: units.push(e.charCodeAt(0)); break;
    }
  }
  return units;
}

/** UTF-16 units -> JS string (chunked to avoid arg-list limits). */
export function unitsToJsString(units) {
  let s = "";
  for (let i = 0; i < units.length; i += 32768)
    s += String.fromCharCode.apply(null, units.slice(i, i + 32768));
  return s;
}

// ---------------------------------------------------------------------------
// Codegen context.
// ---------------------------------------------------------------------------
export function makeStrCx(gen, exprFn) {
  if (!gen || typeof gen.emit !== "function" || typeof gen.lbl !== "function")
    throw new Error("codegen-strings: gen needs emit() and lbl()");
  return {
    gen,
    emit: (s) => gen.emit(s),
    lbl: (p) => gen.lbl(p),
    expr: exprFn || (() => { throw new Error("codegen-strings: no expr compiler"); }),
    strData: [],
    litCache: new Map(),
    litSeq: 0,
    strRuntimeEmitted: false,
  };
}

function fail(msg, node) {
  const where = node && node.start !== undefined ? ` at offset ${node.start}` : "";
  throw new Error(`codegen-strings: ${msg}${where}`);
}
// ---------------------------------------------------------------------------
// Runtime helpers (emitted once per program; see ensureStringRuntime).
// All conform to OBJECT_MODEL.md: 16-byte headers, 16-aligned heap.
// ---------------------------------------------------------------------------
function stringRuntimeLines(cx) {
  const L = [];
  const emit = (s) => L.push(s);

  // -- __merkava_alloc -------------------------------------------------------
  // Spec §15 entry point: __merkava_alloc(size_bytes) -> RAX = 16-aligned ptr.
  // Stub bump allocator; the production runtime provides the real one.
  // Stream 2's heap.js will swap this when it lands (same symbol).
  emit("__merkava_alloc:");
  emit("PUSH RBP"); emit("MOV RBP, RSP"); emit("PUSH RBX");
  emit("PUSH RDI");
  emit("MOV RAX, QWORD PTR [awts_heap_brk]");
  emit("TEST RAX, RAX"); emit("JNZ awtsma_have");
  emit("MOV RAX, 9"); emit("XOR RDI, RDI");
  emit("MOV RSI, 1073741824"); emit("MOV RDX, 3"); emit("MOV R10, 34");
  emit("MOV R8, -1"); emit("XOR R9, R9"); emit("SYSCALL");
  emit("MOV QWORD PTR [awts_heap_base], RAX");
  emit("MOV QWORD PTR [awts_heap_brk], RAX");
  emit("awtsma_have:");
  emit("POP RDI");
  emit("MOV RBX, RDI"); emit("ADD RBX, 15"); emit("AND RBX, -16");
  emit("MOV RAX, QWORD PTR [awts_heap_brk]");
  emit("ADD QWORD PTR [awts_heap_brk], RBX");
  emit("POP RBX"); emit("MOV RSP, RBP"); emit("POP RBP"); emit("RET");

  // -- awts_str_alloc ---------------------------------------------------------
  // RDI = nunits -> RAX = tagged heap string (16-byte header, units at +16).
  emit("awts_str_alloc:");
  emit("PUSH RBP"); emit("MOV RBP, RSP"); emit("PUSH RBX");
  emit("MOV RBX, RDI");
  emit("MOV RDI, RBX"); emit("SHL RDI, 1"); emit("ADD RDI, 16");
  emit("CALL __merkava_alloc");
  emit("MOV RCX, 1"); emit("MOV QWORD PTR [RAX], RCX");
  emit("MOV QWORD PTR [RAX+8], RBX");
  emit("OR RAX, 1");
  emit("POP RBX"); emit("MOV RSP, RBP"); emit("POP RBP"); emit("RET");

  // -- awts_str_from_bytes ------------------------------------------------------
  // RDI = src ptr (2*nunits bytes, LE units), RSI = nunits -> RAX = tagged heap.
  emit("awts_str_from_bytes:");
  emit("PUSH RBP"); emit("MOV RBP, RSP");
  emit("PUSH RBX"); emit("PUSH R12"); emit("PUSH R13");
  emit("MOV RBX, RDI"); emit("MOV R12, RSI");
  emit("MOV RDI, R12"); emit("CALL awts_str_alloc");
  emit("MOV R13, RAX");
  emit("MOV R10, RAX"); emit("AND R10, -8"); emit("ADD R10, 16");
  emit("MOV R11, RBX"); emit("MOV RCX, R12");
  emit("MOV RDX, RCX"); emit("SAR RDX, 2"); emit("JZ awtssfb_w");
  emit("awtssfb_q:");
  emit("MOV RAX, [R11]"); emit("MOV [R10], RAX");
  emit("ADD R11, 8"); emit("ADD R10, 8");
  emit("DEC RDX"); emit("JNZ awtssfb_q");
  emit("awtssfb_w:");
  emit("AND RCX, 3"); emit("JZ awtssfb_done");
  emit("awtssfb_wl:");
  emit("XOR RAX, RAX"); emit("MOV AX, [R11]"); emit("MOV [R10], AX");
  emit("ADD R11, 2"); emit("ADD R10, 2");
  emit("DEC RCX"); emit("JNZ awtssfb_wl");
  emit("awtssfb_done:");
  emit("MOV RAX, R13");
  emit("POP R13"); emit("POP R12"); emit("POP RBX");
  emit("MOV RSP, RBP"); emit("POP RBP"); emit("RET");

  // -- awts_str_norm ----------------------------------------------------------
  // RDI = tagged string, RSI = 8-byte spill ptr.
  // -> RAX = data ptr (u16 units), RDX = length (untagged).
  // Small strings are spilled to [RSI]; heap strings use ptr+16 directly.
  // Traps (exit 99) on non-string input.
  emit("awts_str_norm:");
  emit("PUSH RBP"); emit("MOV RBP, RSP");
  emit("MOV RAX, RDI"); emit("AND RAX, 7");
  emit("CMP RAX, 3"); emit("JE awtsn_small");
  emit("CMP RAX, 1"); emit("JNE awtsn_trap");
  emit("MOV RAX, RDI"); emit("AND RAX, -8");
  emit("MOV RCX, QWORD PTR [RAX]"); emit("CMP RCX, 1");
  emit("JNE awtsn_trap");
  emit("MOV RDX, QWORD PTR [RAX+8]");
  emit("ADD RAX, 16");
  emit("JMP awtsn_ret");
  emit("awtsn_small:");
  emit("MOV RDX, RDI"); emit("SAR RDX, 3"); emit("AND RDX, 3");
  emit("MOV RAX, RDI"); emit("SAR RAX, 5");
  emit("MOV WORD PTR [RSI], AX");
  emit("SAR RAX, 16"); emit("MOV WORD PTR [RSI+2], AX");
  emit("SAR RAX, 16"); emit("MOV WORD PTR [RSI+4], AX");
  emit("MOV RAX, RSI");
  emit("awtsn_ret:");
  emit("MOV RSP, RBP"); emit("POP RBP"); emit("RET");
  emit("awtsn_trap:");
  emit("MOV RAX, 60"); emit("MOV RDI, 99"); emit("SYSCALL");

  // -- awts_small_from_ptr ----------------------------------------------------
  // RDI = data ptr, RSI = n (<=3, untagged) -> RAX = smallstr tagged value.
  // Builds high-to-low so no variable shift is needed (SHL reg,CL unsupported).
  emit("awts_small_from_ptr:");
  emit("PUSH RBP"); emit("MOV RBP, RSP");
  emit("XOR RAX, RAX");
  emit("MOV RCX, RSI"); emit("DEC RCX");
  emit("awtssfp_loop:");
  emit("CMP RCX, 0"); emit("JL awtssfp_done");
  emit("XOR RDX, RDX"); emit("MOV DX, [RDI+RCX*2]");
  emit("SHL RAX, 16"); emit("OR RAX, RDX");
  emit("DEC RCX"); emit("JMP awtssfp_loop");
  emit("awtssfp_done:");
  emit("SHL RAX, 5");
  emit("OR RAX, 3");
  emit("MOV RCX, RSI"); emit("SHL RCX, 3"); emit("OR RAX, RCX");
  emit("MOV RSP, RBP"); emit("POP RBP"); emit("RET");

  // -- awts_str_concat ---------------------------------------------------------
  // RDI, RSI = tagged (fixnum|smallstr|heapref) -> RAX = tagged string|fixnum.
  // Spec §5b: eager — allocate len(a)+len(b) units, memcpy. Total ≤3 → smallstr.
  emit("awts_str_concat:");
  emit("PUSH RBP"); emit("MOV RBP, RSP");
  emit("PUSH RBX"); emit("PUSH R12"); emit("PUSH R13"); emit("PUSH R14"); emit("PUSH R15");
  emit("SUB RSP, 48");
  emit("MOV RBX, RDI"); emit("MOV R12, RSI");
  emit("MOV RAX, RBX"); emit("AND RAX, 7");
  emit("MOV RCX, R12"); emit("AND RCX, 7");
  emit("CMP RAX, 0"); emit("JNE awtsc_astr");
  emit("CMP RCX, 0"); emit("JNE awtsc_convA");
  emit("MOV RAX, RBX"); emit("ADD RAX, R12"); emit("JMP awtsc_ret");
  emit("awtsc_astr:");
  emit("CMP RAX, 3"); emit("JE awtsc_aok");
  emit("CMP RAX, 1"); emit("JE awtsc_aok");
  emit("JMP awtsn_trap");
  emit("awtsc_aok:");
  emit("CMP RCX, 0"); emit("JE awtsc_convB");
  emit("CMP RCX, 3"); emit("JE awtsc_both");
  emit("CMP RCX, 1"); emit("JE awtsc_both");
  emit("JMP awtsn_trap");
  emit("awtsc_convA:");
  emit("MOV RDI, RBX"); emit("CALL awts_int_to_str"); emit("MOV RBX, RAX");
  emit("JMP awtsc_both");
  emit("awtsc_convB:");
  emit("MOV RDI, R12"); emit("CALL awts_int_to_str"); emit("MOV R12, RAX");
  emit("awtsc_both:");
  emit("MOV RDI, RBX"); emit("LEA RSI, [RSP]");
  emit("CALL awts_str_norm");
  emit("MOV R15, RAX"); emit("MOV R13, RDX");
  emit("MOV RDI, R12"); emit("LEA RSI, [RSP+16]");
  emit("CALL awts_str_norm");
  emit("MOV R14, RAX"); emit("MOV R12, RDX");
  emit("MOV RBX, R13"); emit("ADD RBX, R12");
  emit("CMP RBX, 3"); emit("JG awtsc_heap");
  emit("LEA R10, [RSP+32]");
  emit("MOV R11, R15"); emit("MOV RCX, R13"); emit("CALL awtsc_copyw");
  emit("MOV R11, R14"); emit("MOV RCX, R12"); emit("CALL awtsc_copyw");
  emit("LEA RDI, [RSP+32]"); emit("MOV RSI, RBX");
  emit("CALL awts_small_from_ptr");
  emit("JMP awtsc_ret");
  emit("awtsc_heap:");
  emit("MOV RDI, RBX"); emit("CALL awts_str_alloc");
  emit("PUSH RAX");
  emit("MOV R10, RAX"); emit("AND R10, -8"); emit("ADD R10, 16");
  emit("MOV R11, R15"); emit("MOV RCX, R13"); emit("CALL awtsc_copy");
  emit("MOV R11, R14"); emit("MOV RCX, R12"); emit("CALL awtsc_copy");
  emit("POP RAX");
  emit("awtsc_ret:");
  emit("ADD RSP, 48");
  emit("POP R15"); emit("POP R14"); emit("POP R13"); emit("POP R12"); emit("POP RBX");
  emit("MOV RSP, RBP"); emit("POP RBP"); emit("RET");
  emit("awtsc_copy:");
  emit("MOV RDX, RCX"); emit("SAR RDX, 2"); emit("JZ awtsc_cw");
  emit("awtsc_cq:");
  emit("MOV RAX, [R11]"); emit("MOV [R10], RAX");
  emit("ADD R11, 8"); emit("ADD R10, 8");
  emit("DEC RDX"); emit("JNZ awtsc_cq");
  emit("awtsc_cw:");
  emit("AND RCX, 3"); emit("JZ awtsc_cdone");
  emit("awtsc_cwl:");
  emit("XOR RAX, RAX"); emit("MOV AX, [R11]"); emit("MOV [R10], AX");
  emit("ADD R11, 2"); emit("ADD R10, 2");
  emit("DEC RCX"); emit("JNZ awtsc_cwl");
  emit("awtsc_cdone:");
  emit("RET");
  emit("awtsc_copyw:");
  emit("JZ awtsc_cwdone");
  emit("awtsc_cwl2:");
  emit("XOR RAX, RAX"); emit("MOV AX, [R11]"); emit("MOV [R10], AX");
  emit("ADD R11, 2"); emit("ADD R10, 2");
  emit("DEC RCX"); emit("JNZ awtsc_cwl2");
  emit("awtsc_cwdone:");
  emit("RET");

  // -- awts_str_slice ------------------------------------------------------------
  // RDI = tagged string, RSI = start (fixnum), RDX = end (fixnum) -> RAX.
  emit("awts_str_slice:");
  emit("PUSH RBP"); emit("MOV RBP, RSP");
  emit("PUSH RBX"); emit("PUSH R12"); emit("PUSH R13"); emit("PUSH R14"); emit("PUSH R15");
  emit("SUB RSP, 16");
  emit("MOV RBX, RDI"); emit("MOV R12, RSI"); emit("MOV R13, RDX");
  emit("MOV RDI, RBX"); emit("LEA RSI, [RSP]");
  emit("CALL awts_str_norm");
  emit("MOV R15, RAX"); emit("MOV R14, RDX");
  emit("SAR R12, 3"); emit("SAR R13, 3");
  emit("CMP R12, 0"); emit("JGE awtssl_s1");
  emit("ADD R12, R14"); emit("CMP R12, 0"); emit("JGE awtssl_s1");
  emit("XOR R12, R12");
  emit("awtssl_s1:");
  emit("CMP R13, 0"); emit("JGE awtssl_e1");
  emit("ADD R13, R14"); emit("CMP R13, 0"); emit("JGE awtssl_e1");
  emit("XOR R13, R13");
  emit("awtssl_e1:");
  emit("CMP R12, R14"); emit("JLE awtssl_s2");
  emit("MOV R12, R14");
  emit("awtssl_s2:");
  emit("CMP R13, R14"); emit("JLE awtssl_e3");
  emit("MOV R13, R14");
  emit("awtssl_e3:");
  emit("CMP R13, R12"); emit("JGE awtssl_ok");
  emit("MOV R13, R12");
  emit("awtssl_ok:");
  emit("MOV RBX, R13"); emit("SUB RBX, R12");
  emit("CMP RBX, 3"); emit("JG awtssl_heap");
  emit("MOV RDI, R15"); emit("MOV RAX, R12"); emit("SHL RAX, 1");
  emit("ADD RDI, RAX"); emit("MOV RSI, RBX");
  emit("CALL awts_small_from_ptr");
  emit("JMP awtssl_ret");
  emit("awtssl_heap:");
  emit("MOV RDI, RBX"); emit("CALL awts_str_alloc");
  emit("PUSH RAX");
  emit("MOV R10, RAX"); emit("AND R10, -8"); emit("ADD R10, 16");
  emit("MOV R11, R15"); emit("MOV RAX, R12"); emit("SHL RAX, 1");
  emit("ADD R11, RAX");
  emit("MOV RCX, RBX"); emit("CALL awtsc_copy");
  emit("POP RAX");
  emit("awtssl_ret:");
  emit("ADD RSP, 16");
  emit("POP R15"); emit("POP R14"); emit("POP R13"); emit("POP R12"); emit("POP RBX");
  emit("MOV RSP, RBP"); emit("POP RBP"); emit("RET");

  // -- awts_str_char_at ------------------------------------------------------------
  // RDI = tagged string, RSI = index (fixnum) -> RAX = 1-unit smallstr | "".
  emit("awts_str_char_at:");
  emit("PUSH RBP"); emit("MOV RBP, RSP");
  emit("PUSH RBX"); emit("PUSH R12"); emit("PUSH R13");
  emit("SUB RSP, 16");
  emit("MOV RBX, RDI"); emit("MOV R12, RSI"); emit("SAR R12, 3");
  emit("MOV RDI, RBX"); emit("LEA RSI, [RSP]");
  emit("CALL awts_str_norm");
  emit("MOV R13, RAX");
  emit("CMP R12, 0"); emit("JL awtsca_empty");
  emit("CMP R12, RDX"); emit("JGE awtsca_empty");
  emit("XOR RAX, RAX"); emit("MOV AX, [R13+R12*2]");
  emit("SHL RAX, 5"); emit("OR RAX, 11");
  emit("JMP awtsca_ret");
  emit("awtsca_empty:");
  emit("MOV RAX, 3");
  emit("awtsca_ret:");
  emit("ADD RSP, 16");
  emit("POP R13"); emit("POP R12"); emit("POP RBX");
  emit("MOV RSP, RBP"); emit("POP RBP"); emit("RET");

  // -- awts_str_char_code_at ---------------------------------------------------------
  // RDI = tagged string, RSI = index (fixnum) -> RAX = fixnum | V_NAN(36).
  emit("awts_str_char_code_at:");
  emit("PUSH RBP"); emit("MOV RBP, RSP");
  emit("PUSH RBX"); emit("PUSH R12"); emit("PUSH R13");
  emit("SUB RSP, 16");
  emit("MOV RBX, RDI"); emit("MOV R12, RSI"); emit("SAR R12, 3");
  emit("MOV RDI, RBX"); emit("LEA RSI, [RSP]");
  emit("CALL awts_str_norm");
  emit("MOV R13, RAX");
  emit("CMP R12, 0"); emit("JL awtscc_nan");
  emit("CMP R12, RDX"); emit("JGE awtscc_nan");
  emit("XOR RAX, RAX"); emit("MOV AX, [R13+R12*2]");
  emit("SHL RAX, 3");
  emit("JMP awtscc_ret");
  emit("awtscc_nan:");
  emit("MOV RAX, " + V_NAN);
  emit("awtscc_ret:");
  emit("ADD RSP, 16");
  emit("POP R13"); emit("POP R12"); emit("POP RBX");
  emit("MOV RSP, RBP"); emit("POP RBP"); emit("RET");

  // -- awts_str_cmp -------------------------------------------------------------------
  // RDI, RSI = tagged strings -> RAX = fixnum(-1 | 0 | 1), code-unit order.
  emit("awts_str_cmp:");
  emit("PUSH RBP"); emit("MOV RBP, RSP");
  emit("PUSH RBX"); emit("PUSH R12"); emit("PUSH R13"); emit("PUSH R14"); emit("PUSH R15");
  emit("SUB RSP, 32");
  emit("CMP RDI, RSI"); emit("JE awtscmp_eq");
  emit("MOV RBX, RDI"); emit("MOV R12, RSI");
  emit("MOV RDI, RBX"); emit("LEA RSI, [RSP]");
  emit("CALL awts_str_norm");
  emit("MOV R15, RAX"); emit("MOV R13, RDX");
  emit("MOV RDI, R12"); emit("LEA RSI, [RSP+16]");
  emit("CALL awts_str_norm");
  emit("MOV R14, RAX"); emit("MOV R12, RDX");
  emit("MOV RBX, R13"); emit("CMP RBX, R12"); emit("JLE awtscmp_min");
  emit("MOV RBX, R12");
  emit("awtscmp_min:");
  emit("XOR RCX, RCX");
  emit("awtscmp_loop:");
  emit("CMP RCX, RBX"); emit("JGE awtscmp_len");
  emit("XOR RAX, RAX"); emit("MOV AX, [R15+RCX*2]");
  emit("XOR RDX, RDX"); emit("MOV DX, [R14+RCX*2]");
  emit("CMP RAX, RDX"); emit("JL awtscmp_lt"); emit("JG awtscmp_gt");
  emit("INC RCX"); emit("JMP awtscmp_loop");
  emit("awtscmp_len:");
  emit("CMP R13, R12"); emit("JE awtscmp_eq");
  emit("JL awtscmp_lt");
  emit("awtscmp_gt:");
  emit("MOV RAX, 8"); emit("JMP awtscmp_ret");
  emit("awtscmp_lt:");
  emit("MOV RAX, -8"); emit("JMP awtscmp_ret");
  emit("awtscmp_eq:");
  emit("XOR RAX, RAX");
  emit("awtscmp_ret:");
  emit("ADD RSP, 32");
  emit("POP R15"); emit("POP R14"); emit("POP R13"); emit("POP R12"); emit("POP RBX");
  emit("MOV RSP, RBP"); emit("POP RBP"); emit("RET");

  // -- awts_int_to_str ------------------------------------------------------------------
  // RDI = fixnum -> RAX = tagged string (smallstr if <=3 digits).
  emit("awts_int_to_str:");
  emit("PUSH RBP"); emit("MOV RBP, RSP");
  emit("PUSH RBX"); emit("PUSH R12"); emit("PUSH R13");
  emit("SUB RSP, 64");
  emit("MOV RAX, RDI"); emit("SAR RAX, 3");
  emit("MOV R12, RAX");
  emit("MOV R13, 1");
  emit("CMP RAX, 0"); emit("JGE awtsi_pos");
  emit("NEG RAX"); emit("MOV R12, RAX"); emit("MOV R13, 0");
  emit("awtsi_pos:");
  emit("LEA RBX, [RSP+32]");
  emit("CMP R12, 0"); emit("JNE awtsi_loop");
  emit("MOV BYTE PTR [RBX], 48"); emit("ADD RBX, 1");
  emit("JMP awtsi_sign");
  emit("awtsi_loop:");
  emit("CMP R12, 0"); emit("JE awtsi_sign");
  emit("MOV RAX, R12"); emit("XOR RDX, RDX");
  emit("MOV RCX, 10"); emit("DIV RCX");
  emit("ADD RDX, 48"); emit("MOV BYTE PTR [RBX], DL");
  emit("ADD RBX, 1"); emit("MOV R12, RAX"); emit("JMP awtsi_loop");
  emit("awtsi_sign:");
  emit("CMP R13, 0"); emit("JNE awtsi_rev");
  emit("MOV BYTE PTR [RBX], 45"); emit("ADD RBX, 1");
  emit("awtsi_rev:");
  emit("MOV R13, RBX"); emit("SUB R13, RSP"); emit("SUB R13, 32");
  emit("CMP R13, 3"); emit("JG awtsi_heap");
  emit("LEA R10, [RSP+32]"); emit("LEA R11, [RSP]");
  emit("XOR RCX, RCX");
  emit("awtsi_widen:");
  emit("CMP RCX, R13"); emit("JGE awtsi_pack");
  emit("MOV RAX, RBX"); emit("SUB RAX, RCX"); emit("SUB RAX, 1");
  emit("XOR RDX, RDX"); emit("MOV DL, [RAX]");
  emit("MOV [R11+RCX*2], DX");
  emit("INC RCX"); emit("JMP awtsi_widen");
  emit("awtsi_pack:");
  emit("MOV RDI, R11"); emit("MOV RSI, R13");
  emit("CALL awts_small_from_ptr");
  emit("JMP awtsi_ret");
  emit("awtsi_heap:");
  emit("MOV RDI, R13"); emit("CALL awts_str_alloc");
  emit("PUSH RAX");
  emit("MOV R10, RAX"); emit("AND R10, -8"); emit("ADD R10, 16");
  emit("XOR RCX, RCX");
  emit("awtsi_fill:");
  emit("CMP RCX, R13"); emit("JGE awtsi_fdone");
  emit("MOV RAX, RBX"); emit("SUB RAX, RCX"); emit("SUB RAX, 1");
  emit("XOR RDX, RDX"); emit("MOV DL, [RAX]");
  emit("MOV [R10+RCX*2], DX");
  emit("INC RCX"); emit("JMP awtsi_fill");
  emit("awtsi_fdone:");
  emit("POP RAX");
  emit("awtsi_ret:");
  emit("ADD RSP, 64");
  emit("POP R13"); emit("POP R12"); emit("POP RBX");
  emit("MOV RSP, RBP"); emit("POP RBP"); emit("RET");

  // -- awts_str_write ---------------------------------------------------------------------
  // RDI = tagged string -> writes UTF-8 to stdout. Smallstr and heap.
  emit("awts_str_write:");
  emit("PUSH RBP"); emit("MOV RBP, RSP");
  emit("PUSH RBX"); emit("PUSH R12"); emit("PUSH R13"); emit("PUSH R14"); emit("PUSH R15");
  emit("SUB RSP, 64");
  emit("MOV RBX, RDI");
  emit("MOV RDI, RBX"); emit("LEA RSI, [RSP]");
  emit("CALL awts_str_norm");
  emit("MOV R15, RAX"); emit("MOV R14, RDX");
  emit("LEA R13, [RSP+16]");
  emit("XOR R12, R12");
  emit("awtsw_loop:");
  emit("CMP R12, R14"); emit("JGE awtsw_flush");
  emit("XOR RAX, RAX"); emit("MOV AX, [R15+R12*2]");
  emit("INC R12");
  emit("CMP RAX, 0x80"); emit("JL awtsw_1");
  emit("CMP RAX, 0x800"); emit("JL awtsw_2");
  emit("CMP RAX, 0xD800"); emit("JL awtsw_3");
  emit("CMP RAX, 0xDC00"); emit("JGE awtsw_3");
  emit("CMP R12, R14"); emit("JGE awtsw_lone");
  emit("XOR RCX, RCX"); emit("MOV CX, [R15+R12*2]");
  emit("CMP RCX, 0xDC00"); emit("JL awtsw_lone");
  emit("CMP RCX, 0xE000"); emit("JGE awtsw_lone");
  emit("INC R12");
  emit("SUB RAX, 0xD800"); emit("SHL RAX, 10");
  emit("SUB RCX, 0xDC00"); emit("ADD RAX, RCX"); emit("ADD RAX, 0x10000");
  emit("MOV RCX, RAX"); emit("SAR RCX, 18"); emit("OR RCX, 0xF0");
  emit("MOV BYTE PTR [R13], CL"); emit("ADD R13, 1");
  emit("MOV RCX, RAX"); emit("SAR RCX, 12"); emit("AND RCX, 0x3F"); emit("OR RCX, 0x80");
  emit("MOV BYTE PTR [R13], CL"); emit("ADD R13, 1");
  emit("MOV RCX, RAX"); emit("SAR RCX, 6"); emit("AND RCX, 0x3F"); emit("OR RCX, 0x80");
  emit("MOV BYTE PTR [R13], CL"); emit("ADD R13, 1");
  emit("AND RAX, 0x3F"); emit("OR RAX, 0x80");
  emit("MOV BYTE PTR [R13], AL"); emit("ADD R13, 1");
  emit("JMP awtsw_maybe");
  emit("awtsw_lone:");
  emit("MOV RAX, 0xFFFD");
  emit("awtsw_3:");
  emit("MOV RCX, RAX"); emit("SAR RCX, 12"); emit("OR RCX, 0xE0");
  emit("MOV BYTE PTR [R13], CL"); emit("ADD R13, 1");
  emit("MOV RCX, RAX"); emit("SAR RCX, 6"); emit("AND RCX, 0x3F"); emit("OR RCX, 0x80");
  emit("MOV BYTE PTR [R13], CL"); emit("ADD R13, 1");
  emit("AND RAX, 0x3F"); emit("OR RAX, 0x80");
  emit("MOV BYTE PTR [R13], AL"); emit("ADD R13, 1");
  emit("JMP awtsw_maybe");
  emit("awtsw_2:");
  emit("MOV RCX, RAX"); emit("SAR RCX, 6"); emit("OR RCX, 0xC0");
  emit("MOV BYTE PTR [R13], CL"); emit("ADD R13, 1");
  emit("AND RAX, 0x3F"); emit("OR RAX, 0x80");
  emit("MOV BYTE PTR [R13], AL"); emit("ADD R13, 1");
  emit("JMP awtsw_maybe");
  emit("awtsw_1:");
  emit("MOV BYTE PTR [R13], AL"); emit("ADD R13, 1");
  emit("awtsw_maybe:");
  emit("MOV RAX, R13"); emit("LEA RCX, [RSP+16]"); emit("SUB RAX, RCX");
  emit("CMP RAX, 32"); emit("JL awtsw_loop");
  emit("awtsw_flush:");
  emit("MOV RAX, R13"); emit("LEA RCX, [RSP+16]"); emit("SUB RAX, RCX");
  emit("JZ awtsw_done");
  emit("MOV RSI, RCX"); emit("MOV RDX, RAX");
  emit("MOV RAX, 1"); emit("MOV RDI, 1"); emit("SYSCALL");
  emit("LEA R13, [RSP+16]");
  emit("JMP awtsw_loop");
  emit("awtsw_done:");
  emit("ADD RSP, 64");
  emit("POP R15"); emit("POP R14"); emit("POP R13"); emit("POP R12"); emit("POP RBX");
  emit("MOV RSP, RBP"); emit("POP RBP"); emit("RET");

  return L;
}

const STR_DATA_LABELS = ["awts_heap_base", "awts_heap_brk"];

export function ensureStringRuntime(cx) {
  if (cx.strRuntimeEmitted) return;
  cx.strRuntimeEmitted = true;
  cx.runtimeLines = stringRuntimeLines(cx);
}

/** Runtime lines to emit BEFORE the entry label (call after all emitters). */
export function getStringRuntimeLines(cx) {
  ensureStringRuntime(cx);
  return cx.runtimeLines;
}

export function getStringDataSection(cx) {
  void cx;
  return ["awts_heap_base: 0,0,0,0,0,0,0,0", "awts_heap_brk: 0,0,0,0,0,0,0,0"];
}
export { STR_DATA_LABELS };

// ---------------------------------------------------------------------------
// Emitters.
// ---------------------------------------------------------------------------

/** Raw (escapes-undecoded) source text for a string Literal or TemplateElement. */
export function extractRawString(node) {
  if (!node || typeof node.type !== "string") fail("bad string node", node);
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  // TemplateElement: prefer raw (cooked may already be decoded or absent).
  if (node.type === "TemplateElement" && node.value) {
    if (typeof node.value.raw === "string") return node.value.raw;
    if (typeof node.value.cooked === "string") return node.value.cooked;
  }
  fail(`extractRawString: unsupported node ${node.type}`, node);
}

/** Emit a tagged string value for already-decoded units (RAX). */
function emitUnits(cx, units) {
  if (units.length <= SSO_MAX) {
    cx.emit(`MOV RAX, ${encodeSmallString(units).toString()}`);
    return;
  }
  const key = units.join(",");
  let e = cx.litCache.get(key);
  if (!e) {
    const label = `awts_strlit_${cx.litSeq++}`;
    const bytes = [];
    for (const u of units) bytes.push(u & 0xff, (u >> 8) & 0xff);
    cx.strData.push(`${label}_ptr: 0,0,0,0,0,0,0,0`);
    cx.strData.push(`${label}_bytes: ${bytes.join(",")}`);
    e = { label, len: units.length };
    cx.litCache.set(key, e);
  }
  ensureStringRuntime(cx);
  const done = cx.lbl("strlit");
  cx.emit(`MOV RAX, QWORD PTR [${e.label}_ptr]`);
  cx.emit("TEST RAX, RAX");
  cx.emit(`JNZ ${done}`);
  cx.emit(`LEA RDI, [${e.label}_bytes]`);
  cx.emit(`MOV RSI, ${e.len}`);
  cx.emit("CALL awts_str_from_bytes");
  cx.emit(`MOV QWORD PTR [${e.label}_ptr], RAX`);
  cx.emit(`${done}:`);
}

/**
 * String literal. ≤3 units -> smallstr immediate (no allocation, no cache).
 * Longer -> runtime-interned 16-byte-header heap string (allocated once,
 * 16-aligned, GC-readable).
 */
export function emitStringLit(cx, node) {
  emitUnits(cx, decodeJsStringUnits(extractRawString(node)));
}

/**
 * `+`. Constant-folds literal+literal at compile time. Otherwise evaluates
 * both sides and CALLs awts_str_concat (handles int+int add, string+int,
 * int+string, string+string incl. smallstr/heap mixes).
 */
export function emitConcat(cx, node) {
  if (!node || node.type !== "BinaryExpression" || node.operator !== "+")
    fail("emitConcat needs a BinaryExpression '+'", node);
  const L = node.left, R = node.right;
  if (L.type === "Literal" && R.type === "Literal" &&
      typeof L.value === "string" && typeof R.value === "string") {
    emitUnits(cx, decodeJsStringUnits(extractRawString(L))
      .concat(decodeJsStringUnits(extractRawString(R))));
    return;
  }
  ensureStringRuntime(cx);
  cx.expr(L);
  cx.emit("PUSH RAX");
  cx.expr(R);
  cx.emit("MOV RSI, RAX");
  cx.emit("POP RDI");
  cx.emit("CALL awts_str_concat");
}

/** `.length` -> RAX = fixnum. Inline tag dispatch (no call). */
export function emitLength(cx, node) {
  cx.expr(node);
  const small = cx.lbl("strlen"), done = cx.lbl("strlen");
  cx.emit("MOV R10, RAX");
  cx.emit("AND R10, 7");
  cx.emit("CMP R10, 3");
  cx.emit(`JE ${small}`);
  cx.emit("MOV R10, RAX");
  cx.emit("AND R10, -8");
  cx.emit("MOV RAX, QWORD PTR [R10+8]");
  cx.emit("SHL RAX, 3");
  cx.emit(`JMP ${done}`);
  cx.emit(`${small}:`);
  cx.emit("SAR RAX, 3");
  cx.emit("AND RAX, 3");
  cx.emit("SHL RAX, 3");
  cx.emit(`${done}:`);
}

/** `.slice(start, end)` — node: { str, start, end } (each an expr node). */
export function emitSlice(cx, node) {
  if (!node || !node.str || !node.start || !node.end) fail("emitSlice needs {str,start,end}", node);
  ensureStringRuntime(cx);
  cx.expr(node.str);
  cx.emit("PUSH RAX");
  cx.expr(node.start);
  cx.emit("PUSH RAX");
  cx.expr(node.end);
  cx.emit("MOV RDX, RAX");
  cx.emit("POP RSI");
  cx.emit("POP RDI");
  cx.emit("CALL awts_str_slice");
}

/** `.charAt(i)` -> 1-unit smallstr ("" if OOB). node: { str, index }. */
export function emitCharAt(cx, node) {
  if (!node || !node.str || !node.index) fail("emitCharAt needs {str,index}", node);
  ensureStringRuntime(cx);
  cx.expr(node.str);
  cx.emit("PUSH RAX");
  cx.expr(node.index);
  cx.emit("MOV RSI, RAX");
  cx.emit("POP RDI");
  cx.emit("CALL awts_str_char_at");
}

/**
 * `.charCodeAt(i)` -> fixnum, or the V_NAN immediate (36) when out of range
 * (exact JS NaN semantics with no allocation).
 */
export function emitCharCodeAt(cx, node) {
  if (!node || !node.str || !node.index) fail("emitCharCodeAt needs {str,index}", node);
  ensureStringRuntime(cx);
  cx.expr(node.str);
  cx.emit("PUSH RAX");
  cx.expr(node.index);
  cx.emit("MOV RSI, RAX");
  cx.emit("POP RDI");
  cx.emit("CALL awts_str_char_code_at");
}

/**
 * `==`/`!=`/`<`/`>`/`<=`/`>=` on strings -> JS boolean immediate
 * (V_TRUE=20 / V_FALSE=28). node: { left, right }.
 */
export function emitStrCmp(cx, node, op) {
  if (!node || !node.left || !node.right) fail("emitStrCmp needs {left,right}", node);
  const jumps = { "==": "JE", "!=": "JNE", "<": "JL", ">": "JG", "<=": "JLE", ">=": "JGE" };
  const j = jumps[op];
  if (!j) fail(`emitStrCmp: bad op ${op}`, node);
  ensureStringRuntime(cx);
  cx.expr(node.left);
  cx.emit("PUSH RAX");
  cx.expr(node.right);
  cx.emit("MOV RSI, RAX");
  cx.emit("POP RDI");
  cx.emit("CALL awts_str_cmp");
  const t = cx.lbl("strcmp"), done = cx.lbl("strcmp");
  cx.emit("CMP RAX, 0");
  cx.emit(`${j} ${t}`);
  cx.emit(`MOV RAX, ${VM.V_FALSE}`);
  cx.emit(`JMP ${done}`);
  cx.emit(`${t}:`);
  cx.emit(`MOV RAX, ${VM.V_TRUE}`);
  cx.emit(`${done}:`);
}

/**
 * Template literal. node: { quasis: [TemplateElement-like], exprs: [node] }.
 * Non-string exprs go through the concat helper (fixnums stringified).
 */
export function emitTemplateLiteral(cx, node) {
  if (!node || !Array.isArray(node.quasis) || !Array.isArray(node.exprs))
    fail("emitTemplateLiteral needs {quasis,exprs}", node);
  if (node.quasis.length !== node.exprs.length + 1)
    fail("emitTemplateLiteral: quasis/exprs mismatch", node);
  ensureStringRuntime(cx);
  emitUnits(cx, decodeJsStringUnits(extractRawString(node.quasis[0])));
  for (let i = 0; i < node.exprs.length; i++) {
    cx.emit("PUSH RAX");
    cx.expr(node.exprs[i]);
    cx.emit("MOV RSI, RAX");
    cx.emit("POP RDI");
    cx.emit("CALL awts_str_concat");
    const q = decodeJsStringUnits(extractRawString(node.quasis[i + 1]));
    if (q.length) {
      cx.emit("PUSH RAX");
      emitUnits(cx, q);
      cx.emit("MOV RSI, RAX");
      cx.emit("POP RDI");
      cx.emit("CALL awts_str_concat");
    }
  }
}

/** `String(int)` -> tagged string. node: expr node evaluating to a fixnum. */
export function emitIntToString(cx, node) {
  ensureStringRuntime(cx);
  cx.expr(node);
  cx.emit("MOV RDI, RAX");
  cx.emit("CALL awts_int_to_str");
}

/**
 * Assemble a runnable test program. bodyLines run with RAX holding the
 * test value; the caller appends its own epilogue (write/exit).
 * Returns the full assembly text.
 */
export function buildTestProgram(cx, bodyLines) {
  const rt = getStringRuntimeLines(cx);
  const code = [";test", ".code", ...rt, "start:", ...bodyLines];
  const data = [...getStringDataSection(cx), ...cx.strData];
  return [...code, ".data", ...data].join("\n") + "\n";
}
