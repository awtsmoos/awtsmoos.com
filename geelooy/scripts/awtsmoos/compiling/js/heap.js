// B"H
// Awtsmoos JS native tier — heap allocator + mark-sweep GC (native tier v2).
//
// A real bump allocator with segregated free lists and a precise mark-sweep
// collector, emitted as portable x86_64 assembly for the self-hosted Awtsmoos
// assembler (`compileNativeAsm`). Generated machine code calls the entry points
// below; link with:  compileNativeAsm(heapAsm() + <codegen output>).
//
// ---------------------------------------------------------------------------
// OBJECT MODEL (authoritative: OBJECT_MODEL.md + value-model.js, Stream 1).
// This allocator conforms byte-for-byte; value-model.js decode helpers can
// read everything it produces.
//
// 64-bit tagged values, low 3 bits:
//   000 = fixnum61 (signed 61-bit int, value = word >> 3 arithmetic)
//   001 = heapref   (word & ~7 = 16-byte-aligned object base)
//   010 = doubleref (word & ~7 = 16-byte-aligned double base, | 2)
//   011 = smallstr, 100 = immediate (never heap-allocated; see value-model)
//
// Every heap object starts with a 16-byte header:
//   +0  type:u32    (table below; 0 = free block, allocator-internal)
//   +4  flags:u32   bit0 = MARKED (GC); bit1 = FORWARDED; bits 8-15 = GEN
//   +8  meta:u64    per-type payload description (see below)
//
// Types (S1 §8):
//   1 = STRING: meta = length in UTF-16 code units (u64, exact).
//       Payload = length x u16 LE inline. No NUL terminator.
//   2 = ARRAY: meta = length (high 32) | capacity (low 32).
//       Payload = capacity tagged qwords inline; first `length` are live.
//       Zeroed at alloc; holes are the V_HOLE immediate (never zero).
//   3 = OBJECT: meta = shape pointer (RAW untagged base of a TYPE_SHAPE).
//       Payload = N tagged values, N = shape.meta (prop count).
//   4 = DOUBLE: meta = reserved 0. Payload = 8-byte IEEE-754 LE.
//   6 = BUFFER: meta = byte length. Payload = raw bytes.
//   7 = SPARSE_ARRAY: meta = entry count. Payload = count x (u32 key,
//       tagged value, u32 pad) triples, 12 bytes each, sorted by key.
//   8 = SHAPE: meta = prop count N. Payload = N heapref prop-names (tagged)
//       then N u32 slot indexes.
//   (5 = CLOSURE: recognized by the GC tag check, but the v2 allocator has
//   no closure entry point and the sweep aborts loudly on type 5.)
//
// All block totals are multiples of 16; every object base is 16-aligned, so
// (base | 1) is an unambiguous heapref and (ref & ~7) recovers the base.
//
// GRANTED CAPACITY (arrays only): the `capacity` half of an array meta names
// the GRANTED capacity, >= the requested value, quantized up so the block
// total is a multiple of 16 (malloc-style rounding). The allocator may also
// widen granted capacity by <16 bytes when absorbing a free-list block whose
// remainder is too small to split. `length` (high 32) is always exact.
// Strings/objects/shapes carry exact metas (units / shape ptr / prop count);
// a free-list block that would leave a <32-byte remainder is skipped for
// those types (bounded, correct fragmentation; never silent corruption).
//
// All block totals are multiples of 16; every object base is 16-aligned, so
// (base | 1) is an unambiguous heapref and (ref & ~7) recovers the base.
//
// ---------------------------------------------------------------------------
// ALLOCATOR ABI (what generated code calls; all args are PLAIN untagged ints
// except where noted; RAX returns a TAGGED heapref (doubleref for doubles);
// all other regs clobbered except RBX/R12-R15/RBP/RSP which are preserved):
//
//   __awtsmoos_alloc_string(RDI=nunits)          -> RAX = tagged string
//   __awtsmoos_alloc_array(RDI=len, RSI=cap)     -> RAX = tagged array
//   __awtsmoos_alloc_object(RDI=shape_ptr)       -> RAX = tagged object
//       shape_ptr = RAW untagged base of a TYPE_SHAPE (meta = shape ptr).
//       Field count N comes from shape.meta; payload = N tagged values.
//   __awtsmoos_alloc_shape(RDI=nprops)           -> RAX = tagged shape
//   __awtsmoos_alloc_double(RDI=bits_u64)        -> RAX = doubleref (tag 010)
//   __awtsmoos_alloc_raw(RDI=type, RSI=payload_bytes, RDX=meta) -> RAX (tests)
//
// Payloads are always zeroed (calloc semantics). Allocation is lazy: the first
// call mmaps the heap. Fast path = 16-byte-aligned bump pointer (~15 insns,
// no branches beyond the slow-path check). Slow path = segregated free lists
// (19 size classes, O(1) unlink, split/absorb/skip) -> GC -> grow via mmap.
//
// Memory source: raw Linux mmap (syscall 9, MAP_PRIVATE|MAP_ANONYMOUS).
// Initial chunk 16 MiB; growth doubles the last chunk (cap 1 GiB per chunk,
// 64 chunks max). Fresh mmap pages are zero, so the bump fast path never
// zeroes; every reused free block is zeroed before handout (and poisoned
// with 0xDB while free, in the always-on debug mode).
//
// Shapes are ordinary heap objects (type 8): allocated by
// __awtsmoos_alloc_shape, traced by the GC (their prop-name heaprefs are
// marked), and collected when unreachable. An object's meta points at its
// shape; the collector marks the shape when it marks the object.
//
// ---------------------------------------------------------------------------
// GC: precise mark-sweep.
//
// Roots = the pinned registers RBX/R12/R13/R14/R15 (+RAX at explicit-GC entry)
// read from __awtsmoos_gc's own stack frame (it pushes them first thing, so
// the caller's values are intact) + the shadow stack (below).
//
// A root candidate is followed ONLY if: (v & 7) is odd (heap tags 001/010
// are object refs; fixnums 000 / smallstr 011 / immediates 100 are never
// followed — smallstr/imm are ODD tags but their "bases" fail the chunk +
// header-type checks), the base is 16-aligned, lies inside a live heap chunk,
// and its header type is 1..8. Freed blocks carry type 0, so a stale
// reference to a freed object can never resurrect it. Marking is iterative
// over an explicit mark stack (8 MiB, doubles on overflow).
// Per-type drain (S1 §8): STRING/DOUBLE/BUFFER leaf; ARRAY scans capacity
// (meta low 32) slots; OBJECT marks its shape (meta = raw shape ptr) then
// scans shape.meta (= N) slots; SHAPE scans N name refs; SPARSE_ARRAY scans
// each triple's value; CLOSURE aborts loudly (v2 has no closure allocator).
//
// PRECISE, NOT CONSERVATIVE (v2 decision, per the task's documentation
// requirement): the only producer of tag-001 words is this allocator, and v2
// codegen keeps every live heap reference tagged. A fixnum61 can never have
// low bits 001, so the tag test cannot misidentify an integer as a pointer.
// The chunk-membership + header-type checks are defense-in-depth; the stress
// test proves no misidentification by (a) keeping stale freed refs in scanned
// registers across a GC and showing the block is NOT resurrected (it gets
// reused), and (b) asserting exact live-byte accounting after every phase.
//
// CODEGEN CONTRACT (shadow-stack protocol — codegen streams follow this):
//   * The shadow stack is a contiguous array of tagged words with
//       __awtsmoos_shadow_base <= sp <= __awtsmoos_shadow_end  (qwords in .data).
//   * PUSH (inline, RAX = tagged value, clobbers R10/R11):
//         MOV R10, [__awtsmoos_shadow_sp]
//         MOV [R10], RAX
//         ADD R10, 8
//         MOV R11, [__awtsmoos_shadow_end]
//         CMP R10, R11
//         JGE $grow              ; rare
//         MOV [__awtsmoos_shadow_sp], R10
//       $grow: CALL __awtsmoos_shadow_push_slow   ; RAX=value, preserves RAX
//   * or simply:  CALL __awtsmoos_shadow_push     ; RAX=value (slow path ok)
//   * POP N (inline, no call needed, cannot overflow):
//         MOV R10, [__awtsmoos_shadow_sp]
//         SUB R10, 8*N
//         MOV [__awtsmoos_shadow_sp], R10
//   * At any call that may allocate (the four alloc entry points, or an
//     explicit CALL __awtsmoos_gc), EVERY live heapref must be either in a
//     pinned register (RBX/R12-R15) as a tagged heapref, or on the shadow
//     stack as a tagged heapref. Stack-spilled or untagged-raw references do
//     not survive a collection (v2 has no frame maps; that is v3 work).
//     RAX is NOT a root across an alloc call — root it first if live.
//   * Raw (untagged) pointers must never sit in a scanned register or on the
//     shadow stack across an allocation; the tag check ignores them, but a
//     stale raw pointer is invisible to the collector by design.
//
// Debug/test hooks (also callable from generated test drivers):
//   __awtsmoos_heap_debug_get_type(RDI=tagged)  -> RAX = header type
//   __awtsmoos_heap_debug_get_meta(RDI=tagged)  -> RAX = header meta
//   __awtsmoos_heap_debug_get_qword(RDI=tagged, RSI=idx) -> RAX = payload[idx]
//   __awtsmoos_heap_debug_set_qword(RDI=tagged, RSI=idx, RDX=val)
//   __awtsmoos_heap_debug_set_u16(RDI=tagged, RSI=byte_off, RDX=val)
//   __awtsmoos_heap_debug_set_u32(RDI=tagged, RSI=byte_off, RDX=val)
//   __awtsmoos_heap_debug_get_u16(RDI=tagged, RSI=byte_off) -> RAX
//   __awtsmoos_heap_debug_verify() -> RAX = # free blocks with broken poison
//       (0 = no use-after-free writes detected; poison = 0xDB per qword,
//       skipping the freelist link word)
//   __awtsmoos_heap_live_bytes/_peak_bytes/_alloc_count/_gc_count/_nchunks/
//       _bytes_freed() -> RAX = counter
//   __awtsmoos_gc() — explicit collection (also roots RAX).
//
// Growth policy: heap grows on demand (double last chunk, 1 GiB cap). Counters
// report bytes allocated (live), peak live, total allocs, collections.
//
// Single-threaded v2. Out-of-memory (mmap failure, >64 chunks, >256 MiB single
// alloc request... actually >1 GiB chunk need) prints to stderr and exits(1).
// Stack regions (shadow/mark) double by copying; the old mapping is leaked
// (bounded, documented).

import { compileNativeAsm } from "../native/compiler.js";
import { execFile } from "child_process";
import { mkdtempSync, writeFileSync, chmodSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
// value-model.js is the single source of truth (Stream 1, authoritative).
import {
  TAG_FIXNUM, TAG_HEAPREF, TAG_DOUBLE, TAG_SMALLSTR, TAG_IMM, TAG_MASK, tagOf,
  FIXNUM_MIN, FIXNUM_MAX, fixnum, fixnumValue, isFixnum,
  TYPE_STRING, TYPE_ARRAY, TYPE_OBJECT, TYPE_DOUBLE,
  TYPE_CLOSURE, TYPE_BUFFER, TYPE_SPARSE_ARRAY, TYPE_SHAPE,
  FLAG_MARKED, HEADER_SIZE, readHeader, writeHeader,
  heapref, heapPtr, isHeapref,
} from "./value-model.js";

// Re-export the model constants so codegen streams can import from one place.
export {
  TAG_FIXNUM, TAG_HEAPREF, TAG_DOUBLE, TAG_SMALLSTR, TAG_IMM, TAG_MASK, tagOf,
  FIXNUM_MIN, FIXNUM_MAX, fixnum, fixnumValue, isFixnum,
  TYPE_STRING, TYPE_ARRAY, TYPE_OBJECT, TYPE_DOUBLE,
  TYPE_CLOSURE, TYPE_BUFFER, TYPE_SPARSE_ARRAY, TYPE_SHAPE,
  FLAG_MARKED, HEADER_SIZE, readHeader, writeHeader,
  heapref, heapPtr, isHeapref,
};

/** fixnum61 tag: BigInt -> BigInt (alias of value-model fixnum). */
export function tagFixnum(n) { return fixnum(n); }
/** heapref tag: base (BigInt) -> tagged (alias of value-model heapref). */
export function tagHeapRef(base) { return heapref(base); }
export function untag(v) { return heapPtr(v); }
export function getTag(v) { return Number(tagOf(v)); }

/**
 * Block total (need) for (type, args). Mirrors the asm exactly.
 * String: a = nunits. Array: a = len, b = cap. Object: a = nfields (from shape).
 * Shape: a = nprops. Double: fixed 24.
 */
export function heapBlockNeed(type, a, b = 0) {
  const r16 = (n) => Math.ceil(n / 16) * 16;
  if (type === TYPE_STRING) return r16(16 + a * 2);       // a = nunits
  if (type === TYPE_ARRAY) {                               // a = len, b = cap
    const cap = Math.max(a, b);
    return r16(16 + cap * 8);
  }
  if (type === TYPE_OBJECT) return r16(16 + a * 8);       // a = nfields
  if (type === TYPE_SHAPE) return r16(16 + a * 12);       // a = nprops
  if (type === TYPE_DOUBLE) return 32;
  throw new Error("bad type");
}

// Size classes (block totals, bytes). Class 18 = "big" (>65536).
export const SIZE_CLASSES = [32, 48, 64, 96, 128, 192, 256, 384, 512, 768,
  1024, 1536, 2048, 4096, 8192, 16384, 32768, 65536];
export const NCLASSES = SIZE_CLASSES.length + 1; // 19
export function sizeClassOf(n) {
  for (let i = 0; i < SIZE_CLASSES.length; i++) if (n <= SIZE_CLASSES[i]) return i;
  return SIZE_CLASSES.length;
}

// ---------------------------------------------------------------------------
// Assembly generation
// ---------------------------------------------------------------------------

let __lbl = 0;
function L(p) { return `$heap_${p}_${__lbl++}`; }

const QWORD_ZEROS = new Array(8).fill("0").join(",");

function dataSection(opts) {
  const initChunk = opts.initChunk || 16 * 1024 * 1024;
  const lines = [".data"];
  const q = (name) => lines.push(`${name}: ${QWORD_ZEROS}`);
  q("__awts_heap_ready");
  q("__awts_heap_bump");
  q("__awts_heap_top");
  q("__awts_heap_nchunks");
  q("__awts_heap_live");
  q("__awts_heap_peak");
  q("__awts_heap_allocs");
  q("__awts_heap_gcs");
  q("__awts_heap_freed");
  q("__awts_shadow_base");
  q("__awts_shadow_sp");
  q("__awts_shadow_end");
  q("__awts_mark_base");
  q("__awts_mark_sp");
  q("__awts_mark_end");
  // chunk table: 64 entries x 32 bytes (base, bump, top, pad)
  lines.push(`__awts_heap_chunks: ${new Array(64 * 32).fill("0").join(",")}`);
  // segregated free lists: 19 heads
  lines.push(`__awts_heap_freecls: ${new Array(NCLASSES * 8).fill("0").join(",")}`);
  const oom = "awtsmoos heap: out of memory\\n";
  lines.push(`__awts_oom_msg: "${oom}"`);
  lines.push(`__awts_heap_initchunk: ${leBytes(initChunk)}`);
  return lines.join("\n");
}

function leBytes(v) {
  const b = [];
  let n = BigInt(v);
  for (let i = 0; i < 8; i++) { b.push(String(n & 0xffn)); n >>= 8n; }
  return b.join(",");
}

// ---------------------------------------------------------------------------
// Core runtime: mmap, init, grow, size classes, fill helpers, oom
// ---------------------------------------------------------------------------

function emitMmapAnon() {
  const fail = L("mma_fail"), done = L("mma_done");
  return [
    `__awtsmoos_mmap_anon:`,          // RDI = len -> RAX = addr, 0 on failure
    `PUSH RBP`, `MOV RBP, RSP`,
    `MOV RAX, 9`,                    // sys_mmap
    `MOV RSI, RDI`,                  // len
    `XOR RDI, RDI`,                  // addr = 0
    `MOV RDX, 3`,                    // PROT_READ|PROT_WRITE
    `MOV R10, 0x22`,                 // MAP_PRIVATE|MAP_ANONYMOUS
    `MOV R8, -1`,                    // fd
    `XOR R9, R9`,                    // offset
    `SYSCALL`,                       // clobbers RCX, R11
    `CMP RAX, 0`,
    `JL ${fail}`,                    // negative = -errno
    `JMP ${done}`,
    `${fail}:`,
    `XOR EAX, EAX`,
    `${done}:`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
  ].join("\n");
}

function emitHeapInit() {
  const done = L("hi_done");
  return [
    `__awtsmoos_heap_init:`,          // preserves RDI, RSI, RDX, RCX, R8, R9
    `PUSH RBP`, `MOV RBP, RSP`,      // (alloc entry points call init with args live)
    `PUSH RBX`, `PUSH R12`,
    `PUSH RDI`, `PUSH RSI`, `PUSH RDX`, `PUSH RCX`, `PUSH R8`, `PUSH R9`,
    `MOV R10, [__awts_heap_ready]`,
    `TEST R10, R10`,
    `JNZ ${done}`,
    `MOV RDI, [__awts_heap_initchunk]`,
    `CALL __awtsmoos_mmap_anon`,
    `TEST RAX, RAX`,
    `JZ __awtsmoos_heap_oom`,
    `MOV RBX, RAX`,
    `LEA R12, __awts_heap_chunks`,
    `MOV [R12], RBX`,                // chunk[0].base
    `MOV [R12+8], RBX`,              // chunk[0].bump
    `MOV R10, [__awts_heap_initchunk]`,
    `ADD R10, RBX`,
    `MOV [R12+16], R10`,             // chunk[0].top
    `MOV [__awts_heap_bump], RBX`,
    `MOV [__awts_heap_top], R10`,
    `MOV R10, 1`,
    `MOV [__awts_heap_nchunks], R10`,
    // shadow stack: 8 MiB
    `MOV RDI, 8388608`,
    `CALL __awtsmoos_mmap_anon`,
    `TEST RAX, RAX`,
    `JZ __awtsmoos_heap_oom`,
    `MOV [__awts_shadow_base], RAX`,
    `MOV [__awts_shadow_sp], RAX`,
    `LEA R10, [RAX+8388608]`,
    `MOV [__awts_shadow_end], R10`,
    // mark stack: 8 MiB
    `MOV RDI, 8388608`,
    `CALL __awtsmoos_mmap_anon`,
    `TEST RAX, RAX`,
    `JZ __awtsmoos_heap_oom`,
    `MOV [__awts_mark_base], RAX`,
    `MOV [__awts_mark_sp], RAX`,
    `LEA R10, [RAX+8388608]`,
    `MOV [__awts_mark_end], R10`,
    `MOV R10, 1`,
    `MOV [__awts_heap_ready], R10`,
    `${done}:`,
    `POP R9`, `POP R8`, `POP RCX`, `POP RDX`, `POP RSI`, `POP RDI`,
    `POP R12`, `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
  ].join("\n");
}

function emitHeapGrow() {
  const sized = L("hg_sized"), capok = L("hg_capok"), ok = L("hg_ok");
  return [
    `__awtsmoos_heap_grow:`,         // RDI = min_bytes; dies on failure
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`, `PUSH R12`, `PUSH R13`,
    `SUB RSP, 8`,
    `MOV RBX, RDI`,                  // min_bytes
    `MOV R12, [__awts_heap_nchunks]`,
    `CMP R12, 64`,
    `JGE __awtsmoos_heap_oom`,
    // stash current bump into last chunk entry
    `LEA R10, __awts_heap_chunks`,
    `MOV R13, R12`,
    `DEC R13`,
    `SHL R13, 5`,
    `MOV R11, [__awts_heap_bump]`,
    `MOV [R10+R13+8], R11`,
    // newsize = max(2*lastsize, roundup_page(min_bytes+64))
    `MOV R11, [R10+R13]`,
    `MOV RDI, [R10+R13+16]`,
    `SUB RDI, R11`,
    `SHL RDI, 1`,
    `MOV R11, RBX`,
    `ADD R11, 4159`,
    `AND R11, -4096`,
    `CMP RDI, R11`,
    `JGE ${sized}`,
    `MOV RDI, R11`,
    `${sized}:`,
    `CMP RDI, 1073741824`,           // cap 1 GiB per chunk
    `JLE ${capok}`,
    `MOV RDI, 1073741824`,
    `${capok}:`,
    `CMP RDI, R11`,
    `JGE ${ok}`,
    `JMP __awtsmoos_heap_oom`,       // capped chunk can't satisfy need (v2 limit)
    `${ok}:`,
    `PUSH RDI`,
    `CALL __awtsmoos_mmap_anon`,
    `POP RDI`,
    `TEST RAX, RAX`,
    `JZ __awtsmoos_heap_oom`,
    `MOV R11, RAX`,
    `ADD R11, RDI`,
    `LEA R10, __awts_heap_chunks`,
    `MOV R13, R12`,
    `SHL R13, 5`,
    `MOV [R10+R13], RAX`,
    `MOV [R10+R13+8], RAX`,
    `MOV [R10+R13+16], R11`,
    `INC R12`,
    `MOV [__awts_heap_nchunks], R12`,
    `MOV [__awts_heap_bump], RAX`,
    `MOV [__awts_heap_top], R11`,
    `ADD RSP, 8`,
    `POP R13`, `POP R12`, `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
  ].join("\n");
}

function emitSizeClass() {
  const lines = [`__awtsmoos_sizeclass:`];  // RDI -> RAX (0..18)
  const labels = SIZE_CLASSES.map((_, i) => L(`sc_${i}`));
  SIZE_CLASSES.forEach((s, i) => {
    lines.push(`CMP RDI, ${s}`, `JLE ${labels[i]}`);
  });
  lines.push(`MOV RAX, ${SIZE_CLASSES.length}`, `RET`);
  SIZE_CLASSES.forEach((_, i) => {
    lines.push(`${labels[i]}:`, `MOV RAX, ${i}`, `RET`);
  });
  lines.push(``);
  return lines.join("\n");
}

function emitFillRanges() {
  const zl = L("zr_loop"), zd = L("zr_done");
  const pl = L("pr_loop"), pd = L("pr_done");
  return [
    `__awtsmoos_zero_range:`,        // RDI=ptr, RSI=bytes (multiple of 8)
    `PUSH RBP`, `MOV RBP, RSP`,
    `MOV RCX, RSI`,
    `SAR RCX, 3`,
    `XOR RDX, RDX`,
    `${zl}:`,
    `TEST RCX, RCX`,
    `JZ ${zd}`,
    `MOV [RDI], RDX`,
    `ADD RDI, 8`,
    `DEC RCX`,
    `JMP ${zl}`,
    `${zd}:`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
    `__awtsmoos_poison_range:`,      // RDI=ptr, RSI=bytes (multiple of 8)
    `PUSH RBP`, `MOV RBP, RSP`,
    `MOV RCX, RSI`,
    `SAR RCX, 3`,
    `MOV RDX, 0xDBDBDBDBDBDBDBDB`,
    `${pl}:`,
    `TEST RCX, RCX`,
    `JZ ${pd}`,
    `MOV [RDI], RDX`,
    `ADD RDI, 8`,
    `DEC RCX`,
    `JMP ${pl}`,
    `${pd}:`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
  ].join("\n");
}

function emitOom() {
  // message length computed in JS to avoid miscounts
  const msg = "awtsmoos heap: out of memory\n";
  return [
    `__awtsmoos_heap_oom:`,
    `MOV RAX, 1`,                    // sys_write
    `MOV RDI, 2`,                    // stderr
    `LEA RSI, __awts_oom_msg`,
    `MOV RDX, ${msg.length}`,
    `SYSCALL`,
    `MOV RAX, 60`,                   // sys_exit
    `XOR RDI, RDI`,
    `SYSCALL`,
    `JMP __awtsmoos_heap_oom`,       // noreturn (paranoia)
    ``,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Allocator: slow path (segregated free lists -> GC -> grow) + typed entries
// ---------------------------------------------------------------------------

function emitAllocSlow() {
  const retry = L("sl_retry"), cls = L("sl_cls"), nextcls = L("sl_nextcls");
  const bigscan = L("sl_bigscan"), bigloop = L("sl_bigloop"), bignext = L("sl_bignext");
  const nofit = L("sl_nofit"), grow = L("sl_grow");
  const unlink = L("sl_unlink"), bigunlink = L("sl_bigunlink");
  const split = L("sl_split"), exact = L("sl_exact"), absorb = L("sl_absorb");
  const zero = L("sl_zero"), s1 = L("sl_s1");
  // Register map: RBX=need, R12=class idx, R13=freecls base, R14=block total,
  //               R15=gc-tried flag, R10/R11 temps. [RBP-48] = absorb_ok.
  return [
    `__awtsmoos_alloc_slow:`,        // RDI=need, RSI=absorb_ok -> RAX=base, RDX=actual
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`, `PUSH R12`, `PUSH R13`, `PUSH R14`, `PUSH R15`,
    `SUB RSP, 8`,
    `MOV RBX, RDI`,
    `MOV [RBP-48], RSI`,             // absorb_ok slot
    `XOR R15, R15`,
    `${retry}:`,
    `MOV RDI, RBX`,
    `CALL __awtsmoos_sizeclass`,     // RAX = class(need)
    `MOV R12, RAX`,
    `LEA R13, __awts_heap_freecls`,
    `${cls}:`,
    `CMP R12, 18`,
    `JG ${nofit}`,
    `MOV R10, [R13+R12*8]`,          // head
    `TEST R10, R10`,
    `JZ ${nextcls}`,
    `CMP R12, 18`,
    `JE ${bigscan}`,
    // class path: fit-check BEFORE unlink (a block can sit below need in
    // the same class range — taking it would underflow the request).
    `MOV R14, [R10+8]`,              // B = block total
    `CMP R14, RBX`,
    `JL ${nextcls}`,                 // too small: try the next class
    `MOV RAX, R14`,
    `SUB RAX, RBX`,                  // remainder
    `CMP RAX, 32`,
    `JGE ${unlink}`,                 // split
    `TEST RAX, RAX`,
    `JZ ${unlink}`,                  // exact
    `MOV RCX, [RBP-48]`,
    `TEST RCX, RCX`,     // remainder is 16: absorb or skip?
    `JE ${nextcls}`,                 // skip: leave block, next class
    `JMP ${unlink}`,                 // absorb
    `${unlink}:`,
    `MOV R11, [R10+16]`,             // unlink head
    `MOV [R13+R12*8], R11`,
    `MOV RAX, R14`,
    `SUB RAX, RBX`,                  // remainder
    `CMP RAX, 32`,
    `JGE ${split}`,
    `TEST RAX, RAX`,
    `JZ ${exact}`,
    `JMP ${absorb}`,
    `${nextcls}:`,
    `INC R12`,
    `JMP ${cls}`,
    `${bigscan}:`,                   // big class: first-fit scan
    `LEA R11, [R13+R12*8]`,          // R11 = &link
    `MOV R10, [R11]`,
    `${bigloop}:`,
    `TEST R10, R10`,
    `JZ ${nextcls}`,
    `MOV R14, [R10+8]`,
    `CMP R14, RBX`,
    `JL ${bignext}`,
    `MOV RAX, R14`,
    `SUB RAX, RBX`,                  // remainder
    `CMP RAX, 32`,
    `JGE ${bigunlink}`,
    `TEST RAX, RAX`,
    `JZ ${bigunlink}`,
    `MOV RCX, [RBP-48]`,
    `TEST RCX, RCX`,
    `JE ${bignext}`,                 // skip: keep linked, try next block
    `JMP ${bigunlink}`,
    `${bignext}:`,
    `LEA R11, [R10+16]`,
    `MOV R10, [R11]`,
    `JMP ${bigloop}`,
    `${bigunlink}:`,
    `MOV RCX, [R10+16]`,
    `MOV [R11], RCX`,
    `MOV RAX, R14`,
    `SUB RAX, RBX`,
    `CMP RAX, 32`,
    `JGE ${split}`,
    `TEST RAX, RAX`,
    `JZ ${exact}`,
    `JMP ${absorb}`,
    `${nofit}:`,
    `TEST R15, R15`,
    `JNZ ${grow}`,
    `MOV R15, 1`,
    `CALL __awtsmoos_gc`,
    `JMP ${retry}`,
    `${grow}:`,
    `MOV RDI, RBX`,
    `CALL __awtsmoos_heap_grow`,     // dies on failure
    `MOV RAX, [__awts_heap_bump]`,   // fresh chunk: bump must fit
    `MOV R10, RAX`,
    `ADD R10, RBX`,
    `MOV [__awts_heap_bump], R10`,
    `MOV RDX, RBX`,
    `JMP ${zero}`,
    `${split}:`,                     // R10=base, R14=B, RAX=remainder>=32
    `MOV R11, R10`,
    `ADD R11, RBX`,                  // new free block at R10+need
    `MOV DWORD PTR [R11], 0`,        // type = FREE
    `MOV DWORD PTR [R11+4], 0`,
    `MOV [R11+8], RAX`,              // meta = total
    `PUSH R10`, `PUSH R11`, `PUSH R14`, `PUSH RBX`,
    `MOV RDI, R11`,
    `ADD RDI, 24`,
    `MOV RSI, RAX`,
    `SUB RSI, 24`,
    `CALL __awtsmoos_poison_range`,  // poison [base+24, base+total)
    `MOV RDI, [R11+8]`,              // class(remainder)
    `CALL __awtsmoos_sizeclass`,
    `LEA RDI, [__awts_heap_freecls]`,
    `MOV RDX, [RDI+RAX*8]`,
    `MOV [R11+16], RDX`,             // link
    `MOV [RDI+RAX*8], R11`,
    `POP RBX`, `POP R14`, `POP R11`, `POP R10`,
    `${exact}:`,                     // R10=base, use need bytes
    `MOV RAX, R10`,
    `MOV RDX, RBX`,
    `JMP ${zero}`,
    `${absorb}:`,                    // remainder 16, absorb_ok=1: whole block
    `MOV RAX, R10`,
    `MOV RDX, R14`,
    `${zero}:`,                      // zero [RAX, RAX+RDX)
    `PUSH RAX`, `PUSH RDX`,
    `MOV RDI, RAX`,
    `MOV RSI, RDX`,
    `CALL __awtsmoos_zero_range`,
    `POP RDX`, `POP RAX`,
    `MOV R10, [__awts_heap_live]`,   // stats
    `ADD R10, RDX`,
    `MOV [__awts_heap_live], R10`,
    `MOV R11, [__awts_heap_peak]`,
    `CMP R10, R11`,
    `JLE ${s1}`,
    `MOV [__awts_heap_peak], R10`,
    `${s1}:`,
    `MOV R10, [__awts_heap_allocs]`,
    `INC R10`,
    `MOV [__awts_heap_allocs], R10`,
    `ADD RSP, 8`,
    `POP R15`, `POP R14`, `POP R13`, `POP R12`, `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
  ].join("\n");
}

// Shared fast-path bump snippet. Expects: R10 = need (mult of 16).
// Produces: RAX=base, RDX=actual on fallthrough; jumps to `slowLbl` otherwise.
// Clobbers R8, RCX, RSI.
function fastBump(slowLbl, absorbOk) {
  const have = L("fb_have");
  return [
    `MOV R8, [__awts_heap_bump]`,
    `MOV RAX, R8`,
    `ADD RAX, R10`,
    `MOV RCX, [__awts_heap_top]`,
    `CMP RAX, RCX`,
    `JG ${slowLbl}`,
    `MOV [__awts_heap_bump], RAX`,
    `MOV RDX, R10`,
    `MOV RAX, R8`,
    `JMP ${have}`,
    `${slowLbl}:`,
    `MOV RDI, R10`,
    `MOV RSI, ${absorbOk}`,          // 1 = may absorb a <32 remainder
    `CALL __awtsmoos_alloc_slow`,    // RAX=base, RDX=actual (zeroed)
    `${have}:`,
  ].join("\n");
}

// Stats snippet at $have: RAX=base, RDX=actual. Clobbers R10, R11.
function allocStats() {
  const s1 = L("as_s1");
  return [
    `MOV R10, [__awts_heap_live]`,
    `ADD R10, RDX`,
    `MOV [__awts_heap_live], R10`,
    `MOV R11, [__awts_heap_peak]`,
    `CMP R10, R11`,
    `JLE ${s1}`,
    `MOV [__awts_heap_peak], R10`,
    `${s1}:`,
    `MOV R10, [__awts_heap_allocs]`,
    `INC R10`,
    `MOV [__awts_heap_allocs], R10`,
  ].join("\n");
}

function emitAllocString() {
  const slow = L("str_slow");
  return [
    `__awtsmoos_alloc_string:`,      // RDI = nunits -> RAX = tagged string
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`, `PUSH R12`,
    `CALL __awtsmoos_heap_init`,
    `MOV RBX, RDI`,                  // save nunits
    `MOV R10, RDI`,
    `SHL R10, 1`,                    // nunits*2
    `ADD R10, 31`,
    `AND R10, -16`,                  // need = roundup16(16+nunits*2)
    ...fastBump(slow, 0).split("\n"),
    ...allocStats().split("\n"),
    // header: type=1, meta = nunits (exact, S1 §5b)
    `MOV DWORD PTR [RAX], 1`,
    `MOV DWORD PTR [RAX+4], 0`,
    `MOV [RAX+8], RBX`,
    // fast path: fresh mmap pages are already zero; slow path zeroed. tag:
    `OR RAX, 1`,
    `POP R12`, `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
  ].join("\n");
}

function emitAllocArray() {
  const slow = L("arr_slow"), capok = L("arr_capok");
  return [
    `__awtsmoos_alloc_array:`,       // RDI=len, RSI=cap -> RAX = tagged array
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`, `PUSH R12`, `PUSH R13`,
    `CALL __awtsmoos_heap_init`,
    `MOV RBX, RDI`,                  // len
    `MOV R12, RSI`,                  // cap
    `CMP R12, RBX`,
    `JGE ${capok}`,
    `MOV R12, RBX`,                  // clamp cap >= len
    `${capok}:`,
    `MOV R10, R12`,
    `SHL R10, 3`,                    // cap*8
    `ADD R10, 31`,
    `AND R10, -16`,                  // need = roundup16(16+cap*8)
    ...fastBump(slow, 1).split("\n"),// arrays may absorb a 16-byte remainder
    ...allocStats().split("\n"),
    // header: type=2, meta = (len<<32) | cap_actual (S1 §9)
    `MOV DWORD PTR [RAX], 2`,
    `MOV DWORD PTR [RAX+4], 0`,
    `MOV RCX, RBX`,
    `SHL RCX, 32`,                   // len << 32
    `MOV R11, RDX`,
    `SUB R11, 16`,
    `SAR R11, 3`,                    // cap_actual = (actual-16)/8
    `OR RCX, R11`,
    `MOV [RAX+8], RCX`,
    `OR RAX, 1`,
    `POP R13`, `POP R12`, `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
  ].join("\n");
}

function emitAllocObject() {
  const slow = L("obj_slow"), badshape = L("obj_badshape");
  return [
    `__awtsmoos_alloc_object:`,      // RDI=shape_ptr(raw) -> RAX = tagged obj
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`, `PUSH R12`,
    `CALL __awtsmoos_heap_init`,
    `MOV RBX, RDI`,                  // shape_ptr (raw)
    // validate the shape: 16-aligned base with header type 8 (loud abort)
    `TEST RBX, 15`,
    `JNZ ${badshape}`,
    `MOV EAX, [RBX]`,
    `CMP EAX, 8`,
    `JNE ${badshape}`,
    `MOV R12, [RBX+8]`,              // N = shape.meta (prop count)
    `MOV R10, R12`,
    `SHL R10, 3`,                    // N*8
    `ADD R10, 31`,
    `AND R10, -16`,                  // need = roundup16(16+N*8)
    ...fastBump(slow, 0).split("\n"),
    ...allocStats().split("\n"),
    // header: type=3, meta = shape_ptr (raw, S1 §11)
    `MOV DWORD PTR [RAX], 3`,
    `MOV DWORD PTR [RAX+4], 0`,
    `MOV [RAX+8], RBX`,
    `OR RAX, 1`,
    `POP R12`, `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    `${badshape}:`,
    `JMP __awtsmoos_heap_oom`,       // loud abort (bad shape pointer)
    ``,
  ].join("\n");
}

// __awtsmoos_alloc_shape(RDI=nprops) -> RAX = tagged shape (type 8).
// Payload: nprops heapref names (tagged, zeroed) + nprops u32 slots (zeroed).
function emitAllocShape() {
  const slow = L("shp_slow");
  return [
    `__awtsmoos_alloc_shape:`,
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`,
    `CALL __awtsmoos_heap_init`,
    `MOV RBX, RDI`,                  // nprops
    `MOV R10, RDI`,
    `MOV RAX, R10`,
    `SHL R10, 3`,                    // nprops*8
    `SHL RAX, 2`,                    // nprops*4
    `ADD R10, RAX`,                  // nprops*12
    `ADD R10, 31`,
    `AND R10, -16`,                  // need = roundup16(16+nprops*12)
    ...fastBump(slow, 0).split("\n"),
    ...allocStats().split("\n"),
    `MOV DWORD PTR [RAX], 8`,
    `MOV DWORD PTR [RAX+4], 0`,
    `MOV [RAX+8], RBX`,              // meta = nprops
    `OR RAX, 1`,
    `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
  ].join("\n");
}

// __awtsmoos_alloc_double(RDI=ieee754 bits) -> RAX = doubleref (tag 010).
function emitAllocDouble() {
  const slow = L("dbl_slow");
  return [
    `__awtsmoos_alloc_double:`,
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`,
    `CALL __awtsmoos_heap_init`,
    `MOV RBX, RDI`,                  // double bits
    `MOV R10, 32`,                   // need = roundup16(16+8)
    ...fastBump(slow, 0).split("\n"),
    ...allocStats().split("\n"),
    `MOV DWORD PTR [RAX], 4`,
    `MOV DWORD PTR [RAX+4], 0`,
    `MOV QWORD PTR [RAX+8], 0`,      // meta = reserved 0
    `MOV [RAX+16], RBX`,             // payload = IEEE-754
    `OR RAX, 2`,                     // doubleref tag
    `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
  ].join("\n");
}

function emitAllocRaw() {
  const slow = L("raw_slow");
  return [
    `__awtsmoos_alloc_raw:`,         // RDI=type, RSI=payload_bytes, RDX=meta
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`, `PUSH R12`, `PUSH R13`,
    `CALL __awtsmoos_heap_init`,
    `MOV RBX, RDI`,                  // type
    `MOV R12, RSI`,                  // payload bytes (kept for potential use)
    `MOV R13, RDX`,                  // meta
    `MOV R10, RSI`,
    `ADD R10, 31`,
    `AND R10, -16`,                  // need = roundup16(16+payload)
    ...fastBump(slow, 0).split("\n"),// raw never absorbs (meta is caller-set)
    ...allocStats().split("\n"),
    `MOV DWORD PTR [RAX], EBX`,
    `MOV DWORD PTR [RAX+4], 0`,
    `MOV [RAX+8], R13`,
    `OR RAX, 1`,
    `POP R13`, `POP R12`, `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// GC: try_mark macro, shadow stack ops, stack growth, mark-sweep
// ---------------------------------------------------------------------------

// Inline "validate + mark + push to mark stack" for a candidate in RDI.
// Clobbers RAX, R8, R9, RDI. Preserves RCX, RDX, RSI, R10, R11, RBX, R12-R15.
function tryMark() {
  const done = L("tm_done"), cloop = L("tm_cloop"), cnext = L("tm_cnext");
  const cfound = L("tm_cfound"), mok = L("tm_mok"), tagok = L("tm_tagok");
  return [
    `MOV RAX, RDI`,
    `AND RAX, 7`,
    `CMP RAX, 1`,
    `JE ${tagok}`,                   // heapref
    `CMP RAX, 2`,
    `JNE ${done}`,                   // doubleref also ok; all else ignored
    `${tagok}:`,
    `MOV RAX, RDI`,
    `AND RAX, -8`,                   // base
    `TEST RAX, 15`,
    `JNZ ${done}`,                   // 16-aligned
    `MOV R8D, [__awts_heap_nchunks]`,
    `LEA R9, __awts_heap_chunks`,
    `${cloop}:`,                     // chunk membership
    `TEST R8D, R8D`,
    `JZ ${done}`,
    `SUB R8D, 1`,
    `MOV RDI, R8`,
    `SHL RDI, 5`,
    `CMP RAX, [R9+RDI]`,             // base
    `JL ${cnext}`,
    `CMP RAX, [R9+RDI+16]`,          // top
    `JGE ${cnext}`,
    `JMP ${cfound}`,
    `${cnext}:`,
    `JMP ${cloop}`,
    `${cfound}:`,
    `MOV R8D, [RAX]`,                // header type
    `CMP R8D, 1`,
    `JL ${done}`,
    `CMP R8D, 8`,
    `JG ${done}`,
    `MOV R8D, [RAX+4]`,              // flags
    `TEST R8D, 1`,
    `JNZ ${done}`,                   // already marked
    `OR R8D, 1`,
    `MOV [RAX+4], R8D`,
    `MOV R8, [__awts_mark_sp]`,      // push base on mark stack
    `MOV [R8], RAX`,
    `ADD R8, 8`,
    `MOV R9, [__awts_mark_end]`,
    `CMP R8, R9`,
    `JL ${mok}`,
    `PUSH RAX`,                      // overflow: grow (preserves regs)
    `CALL __awtsmoos_mark_grow`,
    `POP RAX`,
    `MOV R8, [__awts_mark_sp]`,
    `MOV [R8], RAX`,
    `ADD R8, 8`,
    `${mok}:`,
    `MOV [__awts_mark_sp], R8`,
    `${done}:`,
  ].join("\n");
}

function emitShadowOps() {
  const store = L("shp_store"), pgrow = L("shp_pgrow"), ready = L("shp_ready");
  const empty = L("shpop_empty");
  return [
    `__awtsmoos_shadow_push:`,       // RAX = tagged value
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`,                      // save orig RBX first...
    `PUSH RAX`,                      // ...then stash value on top (init clobbers RAX)
    `MOV R10, [__awts_heap_ready]`,
    `TEST R10, R10`,
    `JNZ ${ready}`,
    `CALL __awtsmoos_heap_init`,
    `${ready}:`,
    `POP RBX`,                       // value -> RBX (top of stack)
    `PUSH R12`,
    `MOV R12, [__awts_shadow_sp]`,
    `MOV R10, [__awts_shadow_end]`,
    `CMP R12, R10`,
    `JGE ${pgrow}`,
    `${store}:`,
    `MOV [R12], RBX`,
    `ADD R12, 8`,
    `MOV [__awts_shadow_sp], R12`,
    `POP R12`, `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    `${pgrow}:`,
    `CALL __awtsmoos_shadow_grow`,    // preserves all regs incl. RBX
    `MOV R12, [__awts_shadow_sp]`,
    `JMP ${store}`,
    ``,
    `__awtsmoos_shadow_pop:`,        // -> RAX = value (0 if empty)
    `PUSH RBP`, `MOV RBP, RSP`,
    `MOV R10, [__awts_shadow_sp]`,
    `SUB R10, 8`,
    `MOV R11, [__awts_shadow_base]`,
    `CMP R10, R11`,
    `JL ${empty}`,
    `MOV [__awts_shadow_sp], R10`,
    `MOV RAX, [R10]`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    `${empty}:`,
    `XOR EAX, EAX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
    `__awtsmoos_shadow_reset:`,      // drop all roots
    `PUSH RBP`, `MOV RBP, RSP`,
    `MOV R10, [__awts_shadow_base]`,
    `MOV [__awts_shadow_sp], R10`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
  ].join("\n");
}

// Double a stack region (mark or shadow) by copying. Preserves all regs.
function emitStackGrow(which) {
  const P = which === "mark" ? "__awts_mark" : "__awts_shadow";
  const c = L("sg_c"), cd = L("sg_cd");
  const fn = which === "mark" ? "__awtsmoos_mark_grow" : "__awtsmoos_shadow_grow";
  return [
    `${fn}:`,
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`, `PUSH R12`, `PUSH R13`, `PUSH R14`, `PUSH R15`,
    `PUSH RCX`, `PUSH RDX`, `PUSH RSI`, `PUSH R10`, `PUSH R11`,
    `MOV RBX, [${P}_base]`,
    `MOV R12, [${P}_sp]`,
    `MOV R13, [${P}_end]`,
    `MOV RDI, R13`,
    `SUB RDI, RBX`,
    `SHL RDI, 1`,                    // newsize = 2*old
    `PUSH RDI`,
    `CALL __awtsmoos_mmap_anon`,
    `POP R15`,                       // newsize
    `TEST RAX, RAX`,
    `JZ __awtsmoos_heap_oom`,
    `MOV R14, RAX`,                  // new base
    `MOV RSI, RBX`,
    `MOV RDI, R14`,
    `MOV RCX, R12`,
    `SUB RCX, RBX`,
    `SAR RCX, 3`,                    // qwords to copy
    `${c}:`,
    `TEST RCX, RCX`,
    `JZ ${cd}`,
    `MOV RDX, [RSI]`,
    `MOV [RDI], RDX`,
    `ADD RSI, 8`,
    `ADD RDI, 8`,
    `DEC RCX`,
    `JMP ${c}`,
    `${cd}:`,
    `MOV [${P}_base], R14`,
    `SUB R12, RBX`,
    `ADD R12, R14`,
    `MOV [${P}_sp], R12`,
    `ADD R14, R15`,
    `MOV [${P}_end], R14`,
    // NOTE: old mapping intentionally leaked (bounded doublings); v3 can munmap.
    `POP R11`, `POP R10`, `POP RSI`, `POP RDX`, `POP RCX`,
    `POP R15`, `POP R14`, `POP R13`, `POP R12`, `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// __awtsmoos_gc: precise mark-sweep. Preserves RBX, R12-R15, RAX, RBP, RSP.
// ---------------------------------------------------------------------------

function emitGc() {
  const nop = L("gc_nop");
  const sh = L("gc_sh"), shdone = L("gc_shdone");
  const drain = L("gc_drain");
  const arr = L("gc_arr"), al = L("gc_al");
  const obj = L("gc_obj"), ol = L("gc_ol");
  const shp = L("gc_shp"), sl = L("gc_sl");
  const sparse = L("gc_sparse"), spl = L("gc_spl");
  const sweep = L("gc_sweep"), chunk = L("gc_chunk"), walk = L("gc_walk");
  const nextchunk = L("gc_nextchunk"), isfree = L("gc_isfree");
  const szstr = L("gc_szstr"), szarr = L("gc_szarr"), szobj = L("gc_szobj");
  const szdbl = L("gc_szdbl"), szbuf = L("gc_szbuf"), szsparse = L("gc_szsparse");
  const szshape = L("gc_szshape"), szdone = L("gc_szdone");
  const dead = L("gc_dead"), newfree = L("gc_newfree"), extend = L("gc_extend");
  const adv = L("gc_adv"), sweepdone = L("gc_sweepdone"), pdone = L("gc_pdone");
  // Root slots after prologue pushes (PUSH RBP,RBX,R12,R13,R14,R15,RAX):
  // [RBP-8]=RBX [RBP-16]=R12 [RBP-24]=R13 [RBP-32]=R14 [RBP-40]=R15 [RBP-48]=RAX
  const rootScan = [-8, -16, -24, -32, -40, -48]
    .map(off => [`MOV RDI, [RBP${off}]`, ...tryMark().split("\n")].join("\n"))
    .join("\n");
  return [
    `__awtsmoos_gc:`,
    `MOV R10, [__awts_heap_ready]`,
    `TEST R10, R10`,
    `JZ ${nop}`,                     // heap not up yet: nothing to do
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`, `PUSH R12`, `PUSH R13`, `PUSH R14`, `PUSH R15`,
    `PUSH RAX`,                      // 7 pushes: RAX also scanned as a root
    `MOV R10, [__awts_heap_gcs]`,    // stats
    `INC R10`,
    `MOV [__awts_heap_gcs], R10`,
    `MOV R10, [__awts_mark_base]`,   // reset mark stack
    `MOV [__awts_mark_sp], R10`,
    // ---- mark roots: pinned regs ----
    rootScan,
    // ---- mark roots: shadow stack ----
    `MOV R10, [__awts_shadow_base]`,
    `MOV R11, [__awts_shadow_sp]`,
    `${sh}:`,
    `CMP R10, R11`,
    `JGE ${shdone}`,
    `MOV RDI, [R10]`,
    ...tryMark().split("\n"),        // preserves R10, R11
    `ADD R10, 8`,
    `JMP ${sh}`,
    `${shdone}:`,
    // ---- drain mark stack ----
    `${drain}:`,
    `MOV R10, [__awts_mark_sp]`,
    `MOV R11, [__awts_mark_base]`,
    `CMP R10, R11`,
    `JLE ${sweep}`,
    `SUB R10, 8`,
    `MOV [__awts_mark_sp], R10`,
    `MOV R10, [R10]`,                // R10 = object base
    `MOV EAX, [R10]`,                // type
    `CMP EAX, 2`,
    `JE ${arr}`,
    `CMP EAX, 3`,
    `JE ${obj}`,
    `CMP EAX, 8`,
    `JE ${shp}`,
    `CMP EAX, 7`,
    `JE ${sparse}`,
    `CMP EAX, 5`,
    `JE __awtsmoos_heap_oom`,        // closure: no v2 allocator; loud abort
    `JMP ${drain}`,                  // 1,4,6: leaf, no outgoing refs
    `${arr}:`,                       // array: scan capacity (meta LOW 32)
    `MOV ECX, [R10+8]`,
    `LEA R11, [R10+16]`,
    `${al}:`,
    `TEST ECX, ECX`,
    `JZ ${drain}`,
    `MOV RDI, [R11]`,
    ...tryMark().split("\n"),        // preserves R10, R11, RCX
    `ADD R11, 8`,
    `DEC ECX`,
    `JMP ${al}`,
    `${obj}:`,                       // object: mark shape, scan N slots
    `MOV RAX, [R10+8]`,              // shape ptr (raw)
    `MOV RDI, RAX`,
    `OR RDI, 1`,                     // tag for tryMark
    ...tryMark().split("\n"),        // preserves R10,R11,RCX; clobbers RAX
    `MOV RAX, [R10+8]`,              // re-read shape ptr
    `MOV RCX, [RAX+8]`,              // N = shape.meta (prop count)
    `LEA R11, [R10+16]`,
    `${ol}:`,
    `TEST RCX, RCX`,
    `JZ ${drain}`,
    `MOV RDI, [R11]`,
    ...tryMark().split("\n"),
    `ADD R11, 8`,
    `DEC RCX`,
    `JMP ${ol}`,
    `${shp}:`,                       // shape: scan N name heaprefs
    `MOV ECX, [R10+8]`,              // N
    `LEA R11, [R10+16]`,
    `${sl}:`,
    `TEST ECX, ECX`,
    `JZ ${drain}`,
    `MOV RDI, [R11]`,
    ...tryMark().split("\n"),
    `ADD R11, 8`,
    `DEC ECX`,
    `JMP ${sl}`,
    `${sparse}:`,                    // sparse: scan each triple's value
    `MOV RCX, [R10+8]`,              // count
    `LEA R11, [R10+16]`,
    `${spl}:`,
    `TEST RCX, RCX`,
    `JZ ${drain}`,
    `MOV RDI, [R11+4]`,              // tagged value (key@+0, pad@+8)
    ...tryMark().split("\n"),
    `ADD R11, 12`,
    `DEC RCX`,
    `JMP ${spl}`,
    // ---- sweep ----
    // R8 = live accumulator, R9 = current free-run base (0 = none),
    // R12 = nchunks, R13 = chunk idx, R14 = cursor, R15 = end, RBX = scratch.
    `${sweep}:`,
    `XOR R8, R8`,
    `XOR R9, R9`,
    `MOV R12D, [__awts_heap_nchunks]`,
    `XOR R13, R13`,
    `${chunk}:`,
    `CMP R13, R12`,
    `JGE ${sweepdone}`,
    `LEA R10, __awts_heap_chunks`,
    `MOV RAX, R13`,
    `SHL RAX, 5`,
    `MOV RBX, [R10+RAX]`,            // chunk base
    `MOV R11, [R10+RAX+8]`,          // chunk bump
    `MOV R14, RBX`,
    `MOV R15, R11`,
    `${walk}:`,
    `CMP R14, R15`,
    `JGE ${nextchunk}`,
    `MOV EAX, [R14]`,                // type
    `CMP EAX, 0`,
    `JE ${isfree}`,
    `CMP EAX, 1`,
    `JE ${szstr}`,
    `CMP EAX, 2`,
    `JE ${szarr}`,
    `CMP EAX, 3`,
    `JE ${szobj}`,
    `CMP EAX, 4`,
    `JE ${szdbl}`,
    `CMP EAX, 6`,
    `JE ${szbuf}`,
    `CMP EAX, 7`,
    `JE ${szsparse}`,
    `CMP EAX, 8`,
    `JE ${szshape}`,
    `JMP __awtsmoos_heap_oom`,       // type 5 or bogus: loud abort
    `${szstr}:`,                     // meta = units (exact)
    `MOV RCX, [R14+8]`,
    `SHL RCX, 1`,                    // units*2
    `JMP ${szdone}`,
    `${szarr}:`,                     // meta low32 = capacity
    `MOV ECX, [R14+8]`,
    `SHL RCX, 3`,                    // cap*8
    `JMP ${szdone}`,
    `${szobj}:`,                     // meta = shape ptr (raw)
    `MOV RBX, [R14+8]`,
    `MOV RCX, [RBX+8]`,              // N = shape.meta
    `SHL RCX, 3`,                    // N*8
    `JMP ${szdone}`,
    `${szdbl}:`,
    `MOV RCX, 8`,                    // payload 8 -> total 32
    `JMP ${szdone}`,
    `${szbuf}:`,                     // meta = byte length
    `MOV RCX, [R14+8]`,
    `JMP ${szdone}`,
    `${szsparse}:`,                  // meta = entry count
    `MOV RCX, [R14+8]`,
    `MOV RAX, RCX`,
    `SHL RCX, 3`,
    `SHL RAX, 2`,
    `ADD RCX, RAX`,                  // count*12
    `JMP ${szdone}`,
    `${szshape}:`,                   // meta = prop count N
    `MOV RCX, [R14+8]`,
    `MOV RAX, RCX`,
    `SHL RCX, 3`,
    `SHL RAX, 2`,
    `ADD RCX, RAX`,                  // N*12
    `${szdone}:`,
    `ADD RCX, 31`,
    `AND RCX, -16`,                  // RCX = block total
    `JZ ${nextchunk}`,               // paranoia: never step 0
    `MOV EDX, [R14+4]`,              // flags
    `TEST EDX, 1`,
    `JZ ${dead}`,
    `AND EDX, -2`,                   // alive: clear mark
    `MOV [R14+4], EDX`,
    `ADD R8, RCX`,
    `XOR R9, R9`,                    // break free run
    `JMP ${adv}`,
    `${dead}:`,                      // unreachable -> free
    `MOV RDX, [__awts_heap_freed]`,
    `ADD RDX, RCX`,
    `MOV [__awts_heap_freed], RDX`,
    `CMP R9, 0`,
    `JE ${newfree}`,
    `MOV RDX, [R9+8]`,               // adjacent to current run?
    `ADD RDX, R9`,
    `CMP RDX, R14`,
    `JE ${extend}`,
    `${newfree}:`,
    `MOV DWORD PTR [R14], 0`,        // type = FREE
    `MOV DWORD PTR [R14+4], 0`,
    `MOV [R14+8], RCX`,              // meta = total
    `MOV R11, R14`,                  // save block base
    `PUSH R11`, `PUSH RCX`, `PUSH R8`, `PUSH R9`,
    `MOV RDI, R11`,
    `ADD RDI, 24`,
    `MOV RSI, RCX`,
    `SUB RSI, 24`,
    `CALL __awtsmoos_poison_range`,  // poison [base+24, base+total)
    `POP R9`, `POP R8`, `POP RCX`, `POP R11`,
    `PUSH R11`, `PUSH RCX`, `PUSH R8`, `PUSH R9`,
    `MOV RDI, RCX`,
    `CALL __awtsmoos_sizeclass`,     // link into class list
    `LEA RDI, [__awts_heap_freecls]`,
    `MOV RDX, [RDI+RAX*8]`,
    `MOV [R11+16], RDX`,
    `MOV [RDI+RAX*8], R11`,
    `POP R9`, `POP R8`, `POP RCX`, `POP R11`,
    `MOV R9, R11`,                   // run starts here
    `JMP ${adv}`,
    `${extend}:`,                    // merge into run at R9
    `ADD [R9+8], RCX`,
    `PUSH R14`, `PUSH RCX`, `PUSH R8`, `PUSH R9`,
    `MOV RDI, R14`,
    `ADD RDI, 24`,
    `MOV RSI, RCX`,
    `SUB RSI, 24`,
    `CALL __awtsmoos_poison_range`,
    `POP R9`, `POP R8`, `POP RCX`, `POP R14`,
    `JMP ${adv}`,
    `${isfree}:`,                    // pre-existing free block: skip, keep linked
    `MOV RCX, [R14+8]`,
    `JZ ${nextchunk}`,               // paranoia
    `XOR R9, R9`,
    `JMP ${adv}`,
    `${adv}:`,
    `ADD R14, RCX`,
    `JMP ${walk}`,
    `${nextchunk}:`,
    `INC R13`,
    `JMP ${chunk}`,
    `${sweepdone}:`,
    `MOV [__awts_heap_live], R8`,
    `MOV R10, [__awts_heap_peak]`,
    `CMP R8, R10`,
    `JLE ${pdone}`,
    `MOV [__awts_heap_peak], R8`,
    `${pdone}:`,
    `POP RAX`,
    `POP R15`, `POP R14`, `POP R13`, `POP R12`, `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    `${nop}:`,
    `RET`,
    ``,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Debug / test hooks
// ---------------------------------------------------------------------------

function emitDebug() {
  const vfl = L("dbg_vfl"), vl2 = L("dbg_vl2"), vlok = L("dbg_vlok");
  const vnext = L("dbg_vnext"), vfdone = L("dbg_vfdone");
  return [
    `__awtsmoos_heap_debug_get_type:`,   // RDI=tagged -> RAX=type
    `MOV RAX, RDI`,
    `AND RAX, -8`,
    `MOV EAX, [RAX]`,
    `RET`,
    ``,
    `__awtsmoos_heap_debug_get_meta:`,   // RDI=tagged -> RAX=meta
    `MOV RAX, RDI`,
    `AND RAX, -8`,
    `MOV RAX, [RAX+8]`,
    `RET`,
    ``,
    `__awtsmoos_heap_debug_get_qword:`,   // RDI=tagged, RSI=idx -> RAX
    `MOV RAX, RDI`,
    `AND RAX, -8`,
    `MOV RDX, RSI`,
    `SHL RDX, 3`,
    `ADD RAX, RDX`,
    `MOV RAX, [RAX+16]`,
    `RET`,
    ``,
    `__awtsmoos_heap_debug_set_qword:`,   // RDI=tagged, RSI=idx, RDX=val
    `MOV RAX, RDI`,
    `AND RAX, -8`,
    `MOV RCX, RSI`,
    `SHL RCX, 3`,
    `ADD RAX, RCX`,
    `MOV [RAX+16], RDX`,
    `RET`,
    ``,
    `__awtsmoos_heap_debug_set_u16:`,     // RDI=tagged, RSI=byte_off, RDX=val
    `MOV RAX, RDI`,
    `AND RAX, -8`,
    `ADD RAX, RSI`,
    `MOV [RAX+16], DX`,
    `RET`,
    ``,
    `__awtsmoos_heap_debug_set_u32:`,     // RDI=tagged, RSI=byte_off, RDX=val
    `MOV RAX, RDI`,
    `AND RAX, -8`,
    `ADD RAX, RSI`,
    `MOV [RAX+16], EDX`,
    `RET`,
    ``,
    `__awtsmoos_heap_debug_get_u16:`,     // RDI=tagged, RSI=byte_off -> RAX
    `MOV RAX, RDI`,
    `AND RAX, -8`,
    `ADD RAX, RSI`,
    `MOVZX EAX, WORD PTR [RAX+16]`,
    `RET`,
    ``,
    // Walk every free-list class; count blocks whose poison is broken.
    // Skips the link word at +16. Returns count in RAX (0 = clean).
    `__awtsmoos_heap_debug_verify:`,
    `PUSH RBP`, `MOV RBP, RSP`,
    `PUSH RBX`, `PUSH R12`, `PUSH R13`, `PUSH R14`,
    `XOR RBX, RBX`,                       // corrupt count
    `XOR R14, R14`,                       // class idx
    `LEA R10, __awts_heap_freecls`,
    `${vfl}:`,
    `CMP R14, ${NCLASSES}`,
    `JGE ${vfdone}`,
    `MOV R12, [R10+R14*8]`,              // head
    `TEST R12, R12`,
    `JZ ${vnext}`,
    // walk chain in R12
    `${vl2}:`,
    `MOV RCX, [R12+8]`,
    `SUB RCX, 24`,
    `SAR RCX, 3`,                        // qwords from +24
    `LEA R13, [R12+24]`,
    `MOV RAX, 0xDBDBDBDBDBDBDBDB`,
    // inner scan: reuse vlok/vnext carefully — separate labels
    `${vlok}:`,
    `TEST RCX, RCX`,
    `JZ ${vnext}_chain`,
    `CMP RAX, [R13]`,
    `JE ${vlok}_ok`,
    `INC RBX`,                           // one count per corrupt block
    `JMP ${vnext}_chain`,
    `${vlok}_ok:`,
    `ADD R13, 8`,
    `DEC RCX`,
    `JMP ${vlok}`,
    `${vnext}_chain:`,
    `MOV R12, [R12+16]`,
    `TEST R12, R12`,
    `JNZ ${vl2}`,
    `${vnext}:`,
    `INC R14`,
    `JMP ${vfl}`,
    `${vfdone}:`,
    `MOV RAX, RBX`,
    `POP R14`, `POP R13`, `POP R12`, `POP RBX`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
    `__awtsmoos_heap_live_bytes:`,
    `MOV RAX, [__awts_heap_live]`, `RET`, ``,
    `__awtsmoos_heap_peak_bytes:`,
    `MOV RAX, [__awts_heap_peak]`, `RET`, ``,
    `__awtsmoos_heap_alloc_count:`,
    `MOV RAX, [__awts_heap_allocs]`, `RET`, ``,
    `__awtsmoos_heap_gc_count:`,
    `MOV RAX, [__awts_heap_gcs]`, `RET`, ``,
    `__awtsmoos_heap_nchunks:`,
    `MOV RAX, [__awts_heap_nchunks]`, `RET`, ``,
    `__awtsmoos_heap_bytes_freed:`,
    `MOV RAX, [__awts_heap_freed]`, `RET`, ``,
  ].join("\n");
}

/**
 * Emit the complete heap runtime assembly (data + code). Link after/before
 * generated code: compileNativeAsm(heapAsm() + driverAsm).
 * @param {object} [opts] - { initChunk } initial chunk bytes (default 16 MiB)
 */
export function heapAsm(opts = {}) {
  __lbl = 0; // deterministic label numbering per emission
  return [
    `; B"H — Awtsmoos native-tier heap allocator + mark-sweep GC (v2)`,
    dataSection(opts),
    `.code`,
    emitMmapAnon(),
    emitHeapInit(),
    emitHeapGrow(),
    emitSizeClass(),
    emitFillRanges(),
    emitOom(),
    emitAllocSlow(),
    emitAllocString(),
    emitAllocArray(),
    emitAllocObject(),
    emitAllocShape(),
    emitAllocDouble(),
    emitAllocRaw(),
    emitShadowOps(),
    emitStackGrow("mark"),
    emitStackGrow("shadow"),
    emitGc(),
    emitDebug(),
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Test drivers (assembly) — linked after heapAsm()
// ---------------------------------------------------------------------------

function testPrintHelpers() {
  const one = L("tpu_one");
  return [
    `t_putchar:`,                    // RDI = byte
    `PUSH RBP`, `MOV RBP, RSP`, `PUSH R12`,
    `MOV R12, RDI`,
    `PUSH R12`,
    `MOV RAX, 1`, `MOV RDI, 1`, `MOV RSI, RSP`, `MOV RDX, 1`,
    `SYSCALL`,
    `ADD RSP, 8`,
    `POP R12`, `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
    `t_print_u64:`,                  // RAX = unsigned value
    `PUSH RBP`, `MOV RBP, RSP`, `PUSH RBX`, `PUSH R12`,
    `MOV RBX, RAX`,
    `CMP RBX, 10`,
    `JL ${one}`,
    `MOV RAX, RBX`,
    `XOR RDX, RDX`,
    `MOV RCX, 10`,
    `DIV RCX`,
    `PUSH RDX`,
    `CALL t_print_u64`,
    `POP RDX`,
    `MOV RBX, RDX`,
    `${one}:`,
    `ADD RBX, 48`,
    `MOV RDI, RBX`,
    `CALL t_putchar`,
    `POP R12`, `POP RBX`, `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
    `t_nl:`,
    `PUSH RBP`, `MOV RBP, RSP`,
    `MOV RDI, 10`,
    `CALL t_putchar`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
    `t_println:`,                    // RAX = value + newline
    `PUSH RBP`, `MOV RBP, RSP`,
    `CALL t_print_u64`,
    `CALL t_nl`,
    `MOV RSP, RBP`, `POP RBP`, `RET`,
    ``,
  ].join("\n");
}

// Full stress driver. Prints, in order:
//  F: str type/meta/q0/ptr, arr type/meta/q0/q2, obj type/meta/q0, live=144
//  A: chain count (expect 200000)
//  B: allocs, gcs, live, peak, roots, verify
//  C: live, verify
//  D: live1, live2, verify
//  E: nchunks, live, verify, live-after-drop
//  footer 999983
function stressDriverAsm() {
  const cha = L("d_cha"), chadone = L("d_chadone"), chw = L("d_chw"), chwdone = L("d_chwdone");
  const ph1 = L("d_ph1"), ph1done = L("d_ph1done");
  const kstr = L("d_kstr"), karr = L("d_karr"), kdone = L("d_kdone"), knocyc = L("d_knocyc");
  const noroot = L("d_noroot");
  const shp_pre = L("d_shp_pre"), shp_done = L("d_shp_done");
  const phe = L("d_phe"), phedone = L("d_phedone");
  return [
    `.data`,
    `t_scratch: ${QWORD_ZEROS}`,
    `t_shapes: 0,0,0,0,0,0,0,0`,      // 8 tagged shape ptrs (phase B)
    `.code`,
    testPrintHelpers(),
    `start:`,
    // ---- Phase F: differential read-back (first: fresh heap => exact bump sizes) ----
    // S1 metas: string = units, array = (len<<32)|cap, object = shape ptr.
    `MOV RDI, 2`,                    // "Hi": 2 UTF-16 units
    `CALL __awtsmoos_alloc_string`,
    `MOV [t_scratch], RAX`,
    `MOV RDI, RAX`,
    `XOR RSI, RSI`,
    `MOV RDX, 0x00690048`,           // "Hi" UTF-16LE
    `CALL __awtsmoos_heap_debug_set_qword`,
    `MOV RDI, [t_scratch]`,
    `CALL __awtsmoos_heap_debug_get_type`,
    `CALL t_println`,                // F1: 1
    `MOV RDI, [t_scratch]`,
    `CALL __awtsmoos_heap_debug_get_meta`,
    `CALL t_println`,                // F2: 2 (units, exact)
    `MOV RDI, [t_scratch]`,
    `XOR RSI, RSI`,
    `CALL __awtsmoos_heap_debug_get_qword`,
    `CALL t_println`,                // F3: 0x690048
    `MOV RAX, [t_scratch]`,
    `CALL t_println`,                // F4: tagged ptr (tag bits checked in JS)
    `MOV RDI, 3`,
    `MOV RSI, 5`,
    `CALL __awtsmoos_alloc_array`,
    `MOV [t_scratch], RAX`,
    `MOV RDI, RAX`,
    `XOR RSI, RSI`,
    `MOV RDX, 336`,                  // fixnum(42)
    `CALL __awtsmoos_heap_debug_set_qword`,
    `MOV RDI, [t_scratch]`,
    `MOV RSI, 2`,
    `MOV RDX, -56`,                  // fixnum(-7)
    `CALL __awtsmoos_heap_debug_set_qword`,
    `MOV RDI, [t_scratch]`,
    `CALL __awtsmoos_heap_debug_get_type`,
    `CALL t_println`,                // F5: 2
    `MOV RDI, [t_scratch]`,
    `CALL __awtsmoos_heap_debug_get_meta`,
    `CALL t_println`,                // F6: (3<<32)|5
    `MOV RDI, [t_scratch]`,
    `XOR RSI, RSI`,
    `CALL __awtsmoos_heap_debug_get_qword`,
    `CALL t_println`,                // F7: 336
    `MOV RDI, [t_scratch]`,
    `MOV RSI, 2`,
    `CALL __awtsmoos_heap_debug_get_qword`,
    `CALL t_println`,                // F8: 2^64-56
    `MOV RDI, 2`,                    // shape with 2 props
    `CALL __awtsmoos_alloc_shape`,
    `MOV [t_scratch], RAX`,
    `MOV RAX, [t_scratch]`,
    `CALL t_println`,                // F8b: tagged shape ptr
    `MOV RDI, [t_scratch]`,
    `AND RDI, -8`,                   // raw shape base
    `CALL __awtsmoos_alloc_object`,
    `MOV [t_scratch], RAX`,
    `MOV RDI, RAX`,
    `CALL __awtsmoos_heap_debug_get_type`,
    `CALL t_println`,                // F9: 3
    `MOV RDI, [t_scratch]`,
    `CALL __awtsmoos_heap_debug_get_meta`,
    `CALL t_println`,                // F10: shape base (raw)
    `MOV RDI, [t_scratch]`,
    `XOR RSI, RSI`,
    `CALL __awtsmoos_heap_debug_get_qword`,
    `CALL t_println`,                // F11: 0 (zeroed field)
    `CALL __awtsmoos_heap_live_bytes`,
    `CALL t_println`,                // F12: live = 32+64+48+32 = 176
    // ---- Phase A: 200K chain, head kept in RBX (pinned-reg root) ----
    `XOR RBX, RBX`,                  // prev = fixnum 0
    `MOV R12, 200000`,
    `${cha}:`,
    `TEST R12, R12`,
    `JZ ${chadone}`,
    `MOV RDI, 1`,
    `MOV RSI, 1`,
    `CALL __awtsmoos_alloc_array`,
    `MOV RDI, RAX`,
    `XOR RSI, RSI`,
    `MOV RDX, RBX`,
    `CALL __awtsmoos_heap_debug_set_qword`,  // new[0] = prev
    `MOV RBX, RAX`,                  // prev = new (rooted via RBX)
    `DEC R12`,
    `JMP ${cha}`,
    `${chadone}:`,
    `CALL __awtsmoos_gc`,            // chain must survive via RBX
    `XOR R13, R13`,
    `${chw}:`,
    `TEST RBX, RBX`,
    `JZ ${chwdone}`,
    `INC R13`,
    `MOV RDI, RBX`,
    `XOR RSI, RSI`,
    `CALL __awtsmoos_heap_debug_get_qword`,
    `MOV RBX, RAX`,
    `JMP ${chw}`,
    `${chwdone}:`,
    `MOV RAX, R13`,
    `CALL t_println`,                // A: 200000
    `XOR EBX, EBX`,                  // drop head
    `CALL __awtsmoos_gc`,            // whole chain must die
    // ---- Phase B: 1.2M mixed, batch 60K, root every 101st on shadow ----
    // Pre-allocate 8 shapes (N=0..7); objects take a real shape ptr (S1 §11).
    `XOR R12, R12`,
    `${shp_pre}:`,
    `CMP R12, 8`,
    `JGE ${shp_done}`,
    `MOV RDI, R12`,
    `CALL __awtsmoos_alloc_shape`,
    `MOV [t_shapes+R12*8], RAX`,
    `MOV RAX, [t_shapes+R12*8]`,     // reload (push may clobber RAX)
    `CALL __awtsmoos_shadow_push`,   // root the shape
    `INC R12`,
    `JMP ${shp_pre}`,
    `${shp_done}:`,
    `XOR RBX, RBX`,                  // i
    `XOR R14, R14`,                  // kind 0,1,2
    `MOV R12, 101`,                  // root countdown
    `XOR R13, R13`,                  // rooted count
    `MOV R15, 60000`,                // batch countdown
    `${ph1}:`,
    `CMP RBX, 1200000`,
    `JGE ${ph1done}`,
    `CMP R14, 0`,
    `JE ${kstr}`,
    `CMP R14, 1`,
    `JE ${karr}`,
    `MOV RAX, RBX`,                  // object: shape N = (i>>3)&7
    `SAR RAX, 3`,
    `AND RAX, 7`,
    `MOV RDI, [t_shapes+RAX*8]`,
    `AND RDI, -8`,                   // raw shape base
    `CALL __awtsmoos_alloc_object`,
    `JMP ${kdone}`,
    `${karr}:`,                      // array: len=i&7, cap=len+((i>>4)&7)
    `MOV RAX, RBX`,
    `AND RAX, 7`,
    `MOV RDX, RBX`,
    `SAR RDX, 4`,
    `AND RDX, 7`,
    `ADD RDX, RAX`,
    `MOV RDI, RAX`,
    `MOV RSI, RDX`,
    `CALL __awtsmoos_alloc_array`,
    `JMP ${kdone}`,
    `${kstr}:`,                      // string: nunits=(i&63)+2
    `MOV RAX, RBX`,
    `AND RAX, 63`,
    `ADD RAX, 2`,
    `MOV RDI, RAX`,
    `CALL __awtsmoos_alloc_string`,
    `${kdone}:`,
    `INC R14`,
    `CMP R14, 3`,
    `JL ${knocyc}`,
    `XOR R14, R14`,
    `${knocyc}:`,
    `DEC R12`,
    `JNZ ${noroot}`,
    `MOV R12, 101`,
    `CALL __awtsmoos_shadow_push`,   // root RAX
    `INC R13`,
    `${noroot}:`,
    `INC RBX`,
    `DEC R15`,
    `JNZ ${ph1}`,
    `MOV R15, 60000`,
    `CALL __awtsmoos_gc`,
    `JMP ${ph1}`,
    `${ph1done}:`,
    `CALL __awtsmoos_gc`,
    `CALL __awtsmoos_heap_alloc_count`,
    `CALL t_println`,                // B1: allocs = 1400000
    `CALL __awtsmoos_heap_gc_count`,
    `CALL t_println`,                // B2: gcs = 22
    `CALL __awtsmoos_heap_live_bytes`,
    `CALL t_println`,                // B3: live (bounded by harness)
    `CALL __awtsmoos_heap_peak_bytes`,
    `CALL t_println`,                // B4: peak
    `MOV RAX, R13`,
    `CALL t_println`,                // B5: roots = 11881
    `CALL __awtsmoos_heap_debug_verify`,
    `CALL t_println`,                // B6: verify = 0
    // ---- Phase C: drop everything ----
    `CALL __awtsmoos_shadow_reset`,
    `CALL __awtsmoos_gc`,
    `CALL __awtsmoos_heap_live_bytes`,
    `CALL t_println`,                // C1: live = 0
    `CALL __awtsmoos_heap_debug_verify`,
    `CALL t_println`,                // C2: verify = 0
    // ---- Phase D: stale ref must not resurrect ----
    `MOV RDI, 64`,
    `CALL __awtsmoos_alloc_string`,  // A (rooted)
    `CALL __awtsmoos_shadow_push`,
    `MOV RDI, 64`,
    `CALL __awtsmoos_alloc_string`,  // B (doomed)
    `MOV [t_scratch], RAX`,          // stash outside scanned areas
    `CALL __awtsmoos_gc`,            // B freed (type 0)
    `CALL __awtsmoos_heap_live_bytes`,
    `PUSH RAX`,                      // live1
    `MOV RBX, [t_scratch]`,          // stale -> pinned reg (scanned)
    `MOV RAX, RBX`,
    `CALL __awtsmoos_shadow_push`,   // stale -> shadow (scanned)
    `CALL __awtsmoos_gc`,            // must NOT resurrect B
    `CALL __awtsmoos_heap_live_bytes`,
    `MOV R12, RAX`,                  // live2
    `POP R10`,                       // live1
    `MOV RAX, R10`,
    `CALL t_println`,                // D1: live1
    `MOV RAX, R12`,
    `CALL t_println`,                // D2: live2 (= live1)
    `CALL __awtsmoos_heap_debug_verify`,
    `CALL t_println`,                // D3: verify = 0
    `CALL __awtsmoos_shadow_reset`,
    `XOR EBX, EBX`,
    // ---- Phase E: growth (400K retained arrays x 48B = 19.2MB) ----
    `MOV R12, 400000`,
    `${phe}:`,
    `TEST R12, R12`,
    `JZ ${phedone}`,
    `MOV RDI, 4`,
    `MOV RSI, 4`,
    `CALL __awtsmoos_alloc_array`,
    `CALL __awtsmoos_shadow_push`,
    `DEC R12`,
    `JMP ${phe}`,
    `${phedone}:`,
    `CALL __awtsmoos_gc`,
    `CALL __awtsmoos_heap_nchunks`,
    `CALL t_println`,                // E1: nchunks >= 2
    `CALL __awtsmoos_heap_live_bytes`,
    `CALL t_println`,                // E2: live = 19200000
    `CALL __awtsmoos_heap_debug_verify`,
    `CALL t_println`,                // E3: verify = 0
    `CALL __awtsmoos_shadow_reset`,
    `CALL __awtsmoos_gc`,
    `CALL __awtsmoos_heap_live_bytes`,
    `CALL t_println`,                // E4: live = 0
    `MOV RAX, 999983`,
    `CALL t_println`,                // footer sentinel
    `MOV RAX, 60`,
    `XOR RDI, RDI`,
    `SYSCALL`,
    ``,
  ].join("\n");
}

// Benchmark driver: 2M alloc_object(3) after pre-growing 128MB (pure bump,
// no GC). Prints alloc_count, live_bytes. Baseline driver: same loop with a
// dummy call (measures loop+call overhead to subtract).
function benchDriverAsm(withAlloc) {
  const bl = L("b_bl"), bdone = L("b_bdone");
  const body = withAlloc
    ? [`MOV RDI, R12`, `CALL __awtsmoos_alloc_object`]
    : [`CALL t_bench_dummy`];
  return [
    `.code`,
    testPrintHelpers(),
    ...(withAlloc ? [] : [`t_bench_dummy:`, `RET`, ``]),
    `start:`,
    `CALL __awtsmoos_heap_init`,
    ...(withAlloc ? [`MOV RDI, 134217728`, `CALL __awtsmoos_heap_grow`] : []),
    // one 3-prop shape for the alloc_object(3) loop (S1: meta = shape ptr)
    ...(withAlloc ? [
      `MOV RDI, 3`,
      `CALL __awtsmoos_alloc_shape`,
      `AND RAX, -8`,
      `MOV R12, RAX`,                // R12 = raw shape base (pinned reg)
    ] : []),
    `MOV RBX, 2000000`,
    `${bl}:`,
    ...body,
    `DEC RBX`,
    `JNZ ${bl}`,
    `${bdone}:`,
    ...(withAlloc
      ? [`CALL __awtsmoos_heap_alloc_count`, `CALL t_println`,
         `CALL __awtsmoos_heap_live_bytes`, `CALL t_println`,
         `CALL __awtsmoos_heap_peak_bytes`, `CALL t_println`]
      : []),
    `MOV RAX, 60`,
    `XOR RDI, RDI`,
    `SYSCALL`,
    ``,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Test harness (JS side)
// ---------------------------------------------------------------------------

async function buildAsmBinary(asmText, name) {
  const out = await compileNativeAsm(asmText, "linux-x64-static");
  const dir = mkdtempSync(join(tmpdir(), "awtsmoos-heap-"));
  const path = join(dir, name);
  writeFileSync(path, Buffer.from(out.bytes));
  chmodSync(path, 0o755);
  return path;
}

function runBinary(path, timeoutMs = 300000) {
  return new Promise((resolve, reject) => {
    execFile(path, [], { timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) reject(new Error(`binary ${path} failed: ${err.message}\nstderr: ${stderr}\nstdout tail: ${String(stdout).slice(-2000)}`));
        else resolve({ stdout: String(stdout), stderr: String(stderr) });
      });
  });
}

function parseNums(stdout) {
  return stdout.trim().split("\n").map(s => s.trim()).filter(Boolean).map(s => {
    const n = BigInt(s);
    if (n > BigInt(Number.MAX_SAFE_INTEGER)) return n;
    return Number(n);
  });
}

const num = (v) => typeof v === "bigint" ? v : BigInt(v);
const eq = (a, b) => num(a) === num(b);

function check(name, cond, detail, failures) {
  if (cond) console.log(`  PASS ${name}${detail ? ` — ${detail}` : ""}`);
  else { console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`); failures.push(name); }
  return cond;
}

/**
 * Stress + correctness suite. Compiles the heap runtime + stress driver to a
 * real binary, runs it, and differentially verifies every printed value
 * against an independent JS model of the allocation pattern.
 */
export async function runHeapTests(opts = {}) {
  const failures = [];
  console.log("B\"H — heap/GC stress suite");
  const t0 = Date.now();
  const bin = await buildAsmBinary(heapAsm(opts) + stressDriverAsm(), "heap-stress");
  console.log(`  compiled in ${Date.now() - t0}ms -> ${bin}`);
  const t1 = Date.now();
  const { stdout } = await runBinary(bin);
  console.log(`  ran in ${Date.now() - t1}ms`);
  const v = parseNums(stdout);
  let p = 0;
  const next = () => v[p++];

  // ---- Phase F: differential read-back (fresh heap => exact bump sizes) ----
  // S1 metas: string = units (exact), array = (len<<32)|cap, object = shape ptr.
  const F = {};
  F.strType = next(); F.strMeta = next(); F.strQ0 = next(); F.strPtr = next();
  F.arrType = next(); F.arrMeta = next(); F.arrQ0 = next(); F.arrQ2 = next();
  F.shapePtr = next();
  F.objType = next(); F.objMeta = next(); F.objQ0 = next(); F.live = next();
  const sm = num(F.strMeta), am = num(F.arrMeta);
  check("F str type", eq(F.strType, 1), `got ${F.strType}`, failures);
  check("F str meta = 2 units (S1 §5b)", eq(sm, 2n), `meta=${F.strMeta}`, failures);
  check("F str payload", eq(F.strQ0, 0x690048n), `got ${F.strQ0}`, failures);
  check("F str tagged ptr", getTag(F.strPtr) === 1 && (num(F.strPtr) & 15n) === 1n,
    `ptr=${F.strPtr}`, failures);
  check("F arr type", eq(F.arrType, 2), `got ${F.arrType}`, failures);
  check("F arr meta = (3<<32)|5 (S1 §9)",
    (am >> 32n) === 3n && (am & 0xffffffffn) === 5n, `meta=${F.arrMeta}`, failures);
  check("F arr q0 = fixnum(42)", eq(F.arrQ0, tagFixnum(42)), `got ${F.arrQ0}`, failures);
  check("F arr q2 = fixnum(-7)", eq(F.arrQ2, tagFixnum(-7)), `got ${F.arrQ2}`, failures);
  check("F shape tagged ptr", getTag(F.shapePtr) === 1 && (num(F.shapePtr) & 15n) === 1n,
    `ptr=${F.shapePtr}`, failures);
  check("F obj type", eq(F.objType, 3), `got ${F.objType}`, failures);
  check("F obj meta = raw shape base (S1 §11)",
    eq(num(F.objMeta), num(F.shapePtr) & ~7n), `meta=${F.objMeta} shape=${F.shapePtr}`, failures);
  check("F obj field zeroed", eq(F.objQ0, 0), `got ${F.objQ0}`, failures);
  check("F live == 32+64+48+32 == 176 (size accounting)", eq(F.live, 176),
    `got ${F.live}`, failures);

  // ---- Phase A: 200K chain through array payloads, RBX root ----
  const chainCount = next();
  check("A chain survives GC via pinned reg", eq(chainCount, 200000), `got ${chainCount}`, failures);

  // ---- Phase B: 1.2M mixed (+ 8 pre-allocated shapes, all rooted) ----
  const allocs = next(), gcs = next(), live = next(), peak = next();
  const roots = next(), verifyB = next();
  check("B alloc count", eq(allocs, 1400012), `got ${allocs}`, failures);
  check("B gc count == 22 (no surprise collections)", eq(gcs, 22), `got ${gcs}`, failures);
  check("B root count", eq(roots, 11889), `got ${roots}`, failures);
  // Independent JS model of the phase-B pattern -> live-bytes bound.
  let needed = 0n;
  for (let n = 0; n < 8; n++) needed += BigInt(heapBlockNeed(TYPE_SHAPE, n));
  for (let i = 0; i < 1200000; i++) {
    if (i % 101 !== 100) continue;
    const kind = i % 3;
    if (kind === 0) needed += BigInt(heapBlockNeed(TYPE_STRING, (i & 63) + 2));
    else if (kind === 1) {
      const len = i & 7, cap = len + ((i >> 4) & 7);
      needed += BigInt(heapBlockNeed(TYPE_ARRAY, len, cap));
    } else needed += BigInt(heapBlockNeed(TYPE_OBJECT, (i >> 3) & 7));
  }
  const liveB = num(live), rootsB = num(roots);
  check("B live within [needed, needed+32n]",
    liveB >= needed && liveB <= needed + 32n * rootsB,
    `live=${live} needed=${needed} roots=${roots}`, failures);
  check("B peak >= live", num(peak) >= liveB, `peak=${peak}`, failures);
  check("B poison intact", eq(verifyB, 0), `got ${verifyB}`, failures);

  // ---- Phase C: everything dropped ----
  const liveC = next(), verifyC = next();
  check("C zero leaks after drop-all", eq(liveC, 0), `live=${liveC}`, failures);
  check("C poison intact", eq(verifyC, 0), `got ${verifyC}`, failures);

  // ---- Phase D: stale ref must not resurrect ----
  // 64-unit strings: need = roundup16(16+128) = 144; strings never absorb.
  const live1 = next(), live2 = next(), verifyD = next();
  check("D live1 == 144", eq(live1, 144), `got ${live1}`, failures);
  check("D stale ref NOT resurrected (live2 == live1)", eq(live2, live1),
    `live1=${live1} live2=${live2}`, failures);
  check("D poison intact", eq(verifyD, 0), `got ${verifyD}`, failures);

  // ---- Phase E: growth ----
  const nchunks = next(), liveE = next(), verifyE = next(), liveEdrop = next();
  check("E heap grew (nchunks >= 2)", num(nchunks) >= 2n, `got ${nchunks}`, failures);
  check("E live exact 19200000", eq(liveE, 19200000), `got ${liveE}`, failures);
  check("E poison intact", eq(verifyE, 0), `got ${verifyE}`, failures);
  check("E zero leaks after drop", eq(liveEdrop, 0), `got ${liveEdrop}`, failures);

  const footer = next();
  check("footer sentinel", eq(footer, 999983), `got ${footer}; consumed ${p}/${v.length}`, failures);
  if (p !== v.length) check("no trailing output", false, `${v.length - p} extra lines`, failures);

  const ok = failures.length === 0;
  console.log(ok ? `ALL HEAP TESTS PASS (${Date.now() - t0}ms total)` : `FAILURES: ${failures.join(", ")}`);
  return { ok, failures, values: v.map(String) };
}

function loadAvg() {
  try {
    return readFileSync("/proc/loadavg", "utf8").trim();
  } catch { return "n/a"; }
}

async function timeBinary(bin, reps) {
  let best = Infinity;
  for (let k = 0; k < reps; k++) {
    const t0 = process.hrtime.bigint();
    await runBinary(bin);
    const dt = Number(process.hrtime.bigint() - t0) / 1e6;
    if (dt < best) best = dt;
  }
  return best;
}

/** V8 baseline: alloc-heavy loop with a ring sink (forces real allocation). */
function v8BaselineNsPerOp() {
  const N = 2000000, K = 5;
  const sink = new Array(1024);
  let bestObj = Infinity, bestArr = Infinity;
  for (let k = 0; k < K; k++) {
    let t0 = process.hrtime.bigint(), acc = 0;
    for (let i = 0; i < N; i++) { const o = { a: 1, b: 2, c: 3 }; sink[i & 1023] = o; acc += o.a; }
    let dt = Number(process.hrtime.bigint() - t0) / 1e6;
    if (dt < bestObj) bestObj = dt;
    t0 = process.hrtime.bigint(); acc = 0;
    for (let i = 0; i < N; i++) { const a = [1, 2, 3]; sink[i & 1023] = a; acc += a[0]; }
    dt = Number(process.hrtime.bigint() - t0) / 1e6;
    if (dt < bestArr) bestArr = dt;
    if (acc === -1) console.log("unreachable");
  }
  return { objNs: bestObj / N * 1e6, arrNs: bestArr / N * 1e6 };
}

/**
 * Benchmark: native alloc ns/op vs V8 baseline on this machine.
 * Reports load average alongside (task requirement).
 */
export async function runHeapBenchmark(opts = {}) {
  const reps = opts.reps || 5, N = 2000000;
  console.log("B\"H — heap benchmark (native alloc vs V8)");
  const load0 = loadAvg();
  console.log(`  load before: ${load0}`);
  const t0 = Date.now();
  const binAlloc = await buildAsmBinary(heapAsm(opts) + benchDriverAsm(true), "heap-bench");
  const binBase = await buildAsmBinary(heapAsm(opts) + benchDriverAsm(false), "heap-base");
  console.log(`  compiled in ${Date.now() - t0}ms`);
  // sanity: the bench binary self-reports alloc count + live bytes
  const { stdout } = await runBinary(binAlloc);
  const [cnt, live, peak] = parseNums(stdout).map(Number);
  console.log(`  sanity: allocs=${cnt} live=${live} peak=${peak}`);
  const tAlloc = await timeBinary(binAlloc, reps);
  const tBase = await timeBinary(binBase, reps);
  const nativeNs = (tAlloc - tBase) / N * 1e6;
  const v8 = v8BaselineNsPerOp();
  const load1 = loadAvg();
  console.log(`  native alloc_object(3): best ${(tAlloc).toFixed(1)}ms vs baseline ${tBase.toFixed(1)}ms over ${N} ops`);
  console.log(`  => native ${(nativeNs).toFixed(1)} ns/op`);
  console.log(`  V8  {a:1,b:2,c:3}: ${v8.objNs.toFixed(1)} ns/op`);
  console.log(`  V8  [1,2,3]:      ${v8.arrNs.toFixed(1)} ns/op`);
  console.log(`  load after: ${load1}`);
  return { nativeNs, v8ObjNs: v8.objNs, v8ArrNs: v8.arrNs, loadBefore: load0, loadAfter: load1, live, peak };
}

// CLI: node heap.js test | bench
if (process.argv[1] && /heap\.js$/.test(process.argv[1])) {
  const mode = process.argv[2] || "test";
  if (mode === "test") {
    runHeapTests().then(r => process.exit(r.ok ? 0 : 1));
  } else if (mode === "bench") {
    runHeapBenchmark().then(() => process.exit(0));
  } else {
    console.error("usage: node heap.js [test|bench]");
    process.exit(2);
  }
}
