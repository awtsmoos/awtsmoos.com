/*
B"H
Boruch Hashem
Biezrash Hashem
*/
/**
 * Independent ARM64 encoder verification (second opinion).
 *
 * This file verifies encoder.js WITHOUT reusing its logic:
 *  1. Implements DecodeBitMasks from the ARM ARM pseudocode independently,
 *     then round-trips every value encodeBitmask() accepts.
 *  2. Hard-codes reference encodings for edge cases (boundaries, all
 *     conditions, all hw/shift values) derived directly from the ARM ARM
 *     instruction bit diagrams.
 *  3. Fuzz-tests field placement: encodes random instructions, extracts
 *     the bit fields, and checks them against the inputs.
 *
 * Run: node verify-encoder2.mjs (exit 0 = all pass).
 */
import * as E from "./encoder.js";

let passed = 0;
let failed = 0;
const failures = [];

function hex(w) {
	if (typeof w === "bigint") return "0x" + w.toString(16);
	return "0x" + (w >>> 0).toString(16).padStart(8, "0");
}

function check(name, actual, expected) {
	actual = actual >>> 0;
	expected = expected >>> 0;
	if (actual === expected) {
		passed++;
	} else {
		failed++;
		failures.push(`${name}: got ${hex(actual)}, want ${hex(expected)}`);
	}
}

function expectThrow(name, fn) {
	try {
		fn();
		failed++;
		failures.push(`${name}: expected throw, did not throw`);
	} catch (e) {
		passed++;
	}
}

// ---------------------------------------------------------------------------
// 1. Independent DecodeBitMasks (ARM ARM pseudocode, J1-... "DecodeBitMasks")
// ---------------------------------------------------------------------------
function ones(n) {
	return (1n << BigInt(n)) - 1n;
}
function ror(v, esize, r) {
	r = BigInt(r % esize);
	const m = ones(esize);
	return (((v >> r) | (v << (BigInt(esize) - r))) & m);
}
function replicate(v, esize, width) {
	let out = 0n;
	for (let i = 0; i < width; i += esize) out |= v << BigInt(i);
	return out;
}
// Returns the decoded mask as BigInt, or null if (N,immr,imms) is reserved.
//
// Derived as the exact inverse of the encoding rule and validated against
// known-good vectors (e.g. and w0,w1,#0xff = 0x12009C20):
//   N=1 -> 64-bit element; otherwise len = HighestSetBit(imms), esize = 2^len,
//   S = (imms mod 2^len) + 1 ones, R = immr mod 2^len.
function decodeBitMasks(N, immr, imms, width) {
	const M = width; // 32 or 64
	let len;
	if (N === 1) {
		len = 6;
	} else {
		if (imms === 0) return null;
		len = 31 - Math.clz32(imms); // HighestSetBit
		if (len < 1 || len > 5) return null;
	}
	const esize = 1 << len;
	const levels = Number(ones(len));
	const S = imms & levels;
	const R = immr & levels;
	if (S === levels) return null; // reserved (all-ones element)
	const d = (S - R) & levels;
	const welem = ones(S + 1);
	const telem = ones(d + 1);
	const wmask = replicate(ror(welem, esize, R), esize, M);
	const tmask = replicate(telem, esize, M);
	return { wmask, tmask };
}

function maskToBig(v, width) {
	if (typeof v === "bigint") return v & ones(width);
	return BigInt(v) & ones(width);
}

// Round-trip: for every encodable value, decode must reproduce the value.
{
	let count = 0;
	// Exhaustive for small element sizes, sampled for large.
	const values = new Set();
	for (let esize = 2; esize <= 64; esize *= 2) {
		for (let s = 1; s < esize; s++) {
			for (let r = 0; r < esize; r++) {
				// element = rotated run of s ones, replicated
				const elem = ror(ones(s), esize, r);
				for (const w of [32, 64]) {
					if (esize > w) continue;
					values.add(w + ":" + replicate(elem, esize, w).toString());
				}
			}
		}
	}
	// plus some hand-picked values incl. BigInt forms
	values.add("64:" + 0x5555555555555555n.toString());
	values.add("64:" + 0xAAAAAAAAAAAAAAAAn.toString());
	values.add("32:" + 0xFF00FF00n.toString());
	values.add("64:" + 0xFF00FF00FF00FF00n.toString());
	values.add("32:" + 0x80000000n.toString());
	values.add("64:" + 0x8000000000000000n.toString());
	values.add("64:" + 0x7FFFFFFFFFFFFFFFn.toString());

	for (const key of values) {
		const [wstr, vstr] = key.split(":");
		const width = +wstr;
		const v = BigInt(vstr);
		let enc;
		try {
			enc = E.encodeBitmask(width === 64 && v > 0xFFFFFFFFn ? v : Number(v), width);
		} catch (e) {
			failed++;
			failures.push(`encodeBitmask(${hex(v)},${width}) threw but value is a valid mask`);
			continue;
		}
		const dec = decodeBitMasks(enc.n, enc.immr, enc.imms, width);
		if (!dec) {
			failed++;
			failures.push(`encodeBitmask(${hex(v)},${width}) -> reserved (n=${enc.n},immr=${enc.immr},imms=${enc.imms})`);
			continue;
		}
		if (dec.wmask !== (v & ones(width))) {
			failed++;
			failures.push(`bitmask round-trip FAIL w=${width} v=${hex(v)}: decoded ${hex(dec.wmask)} (n=${enc.n},immr=${enc.immr},imms=${enc.imms})`);
		} else {
			passed++;
			count++;
		}
	}
	console.log(`bitmask round-trip: ${count} values verified`);
}

// Non-encodable values must throw.
for (const [v, w] of [[0, 64], [0xFFFFFFFFFFFFFFFFn, 64], [0, 32], [0xFFFFFFFF, 32], [0x12345678, 32], [0xF0F0F0F1, 32]]) {
	expectThrow(`encodeBitmask rejects ${v}`, () => E.encodeBitmask(v, w));
}

// ---------------------------------------------------------------------------
// 2. Edge-case reference encodings (from ARM ARM bit diagrams)
// ---------------------------------------------------------------------------

// movz/movk/movn: all hw, both widths, boundary imm16
check("movz x0,#0xffff,lsl#0", E.movz(0, 0xFFFF, 0, 64), 0xD29FFFE0);
check("movz x30,#1,lsl#16", E.movz(30, 1, 1, 64), 0xD2A0003E);
check("movz x0,#0xabcd,lsl#32", E.movz(0, 0xABCD, 2, 64), 0xD2D579A0);
check("movz x0,#0xabcd,lsl#48", E.movz(0, 0xABCD, 3, 64), 0xD2F579A0);
check("movz w0,#0xffff,lsl#16", E.movz(0, 0xFFFF, 1, 32), 0x52BFFFE0);
check("movk x0,#0,lsl#48", E.movk(0, 0, 3, 64), 0xF2E00000);
check("movn w0,#0xffff,lsl#16", E.movn(0, 0xFFFF, 1, 32), 0x12BFFFE0);
expectThrow("movz hw=2 on 32-bit", () => E.movz(0, 0, 2, 32));
expectThrow("movz hw=4", () => E.movz(0, 0, 4, 64));
expectThrow("movz imm16 overflow", () => E.movz(0, 0x10000, 0, 64));

// adr/adrp boundaries: ±1MB
check("adr x0, #1048575", E.adr(0, (1 << 20) - 1), 0x707FFFE0);
check("adr x0, #-1048576", E.adr(0, -(1 << 20)), 0x10800000);
check("adrp x0, #-1048576", E.adrp(0, -(1 << 20)), 0x90800000);
expectThrow("adr overflow", () => E.adr(0, 1 << 20));
expectThrow("adrp underflow", () => E.adrp(0, -(1 << 20) - 1));

// add/sub immediate: sh=1, imm12=0xfff
check("add x0,x1,#0xfff,lsl#12", E.addImm(0, 1, 0xFFF, 1, 64), 0x917FFC20);
check("sub w0,w1,#0xfff", E.subImm(0, 1, 0xFFF, 0, 32), 0x513FFC20);
expectThrow("addImm bad sh", () => E.addImm(0, 1, 5, 2, 64));
expectThrow("addImm imm12 overflow", () => E.addImm(0, 1, 0x1000, 0, 64));

// add/sub register: all shifts, max amounts, high regs
check("add x30,x29,x28,lsl#63", E.addReg(30, 29, 28, 0, 63, 64), 0x8B1CFFBE);
check("sub w30,w29,w28,asr#31", E.subReg(30, 29, 28, 2, 31, 32), 0x4B9C7FBE);
expectThrow("addReg shift=3 invalid", () => E.addReg(0, 1, 2, 3, 0, 64));
expectThrow("addReg amount overflow 64", () => E.addReg(0, 1, 2, 0, 64, 64));
expectThrow("addReg amount overflow 32", () => E.addReg(0, 1, 2, 0, 32, 32));

// mul/madd/sdiv/udiv high regs
check("mul x30,x29,x28", E.mul(30, 29, 28, 64), 0x9B1C7FBE);
check("madd w1,w2,w3,w4", E.madd(1, 2, 3, 4, 32), 0x1B031041);
check("sdiv x30,x0,x1", E.sdiv(30, 0, 1, 64), 0x9AC10C1E);
check("udiv w30,w0,w1", E.udiv(30, 0, 1, 32), 0x1AC1081E);

// logical register: ror shift (only valid on logicals)
check("eor x0,x1,x2,ror#7", E.eorReg(0, 1, 2, 3, 7, 64), 0xCAC21C20);

// lsl/lsr/asr edge: amount 0 and max
check("lsl x0,x1,#0", E.lsl(0, 1, 0, 64), 0xD340FC20);
check("lsl x0,x1,#63", E.lsl(0, 1, 63, 64), 0xD3410020);
check("lsr w0,w1,#0", E.lsr(0, 1, 0, 32), 0x53007C20);
check("asr x0,x1,#0", E.asr(0, 1, 0, 64), 0x9340FC20);
expectThrow("lsl amount=64", () => E.lsl(0, 1, 64, 64));

// Verify lsl #0 == plain copy encoding (UBFM #0,#63)
check("lsl#0 equals mov-ish", E.lsl(5, 6, 0, 64), 0xD340FCC5);

// ldr/str unsigned: max offset, boundary
check("ldr x0,[x1,#32760]", E.ldrImm(0, 1, 32760, 64), 0xF97FFC20);
check("str w0,[x1,#16380]", E.strImm(0, 1, 16380, 32), 0xB93FFC20);
expectThrow("ldr unaligned", () => E.ldrImm(0, 1, 4, 64));
expectThrow("ldr offset overflow", () => E.ldrImm(0, 1, 32768, 64));

// ldur/stur: boundaries (previously untested functions)
check("ldur x0,[x1,#-256]", E.ldur(0, 1, -256, 64), 0xF8500020);
check("ldur x0,[x1,#255]", E.ldur(0, 1, 255, 64), 0xF84FF020);
check("stur w5,[x6,#-1]", E.stur(5, 6, -1, 32), 0xB81FF0C5);
check("ldur x0,[sp,#0]", E.ldur(0, 31, 0, 64), 0xF84003E0);
expectThrow("ldur offset 256", () => E.ldur(0, 1, 256, 64));
expectThrow("stur offset -257", () => E.stur(0, 1, -257, 64));

// pre/post-indexed (previously untested functions)
check("ldr x0,[x1,#-8]!", E.ldrPre(0, 1, -8, 64), 0xF85F8C20);
check("str x0,[x1,#8]!", E.strPre(0, 1, 8, 64), 0xF8008C20);
check("ldr x0,[x1],#8", E.ldrPost(0, 1, 8, 64), 0xF8408420);
check("str w2,[x3],#-256", E.strPost(2, 3, -256, 32), 0xB8100462);
check("ldr x5,[sp,#16]!", E.ldrPre(5, 31, 16, 64), 0xF8410FE5);
expectThrow("ldrPost unaligned n/a", () => E.ldrPost(0, 1, 257, 64));
expectThrow("strPre offset 256", () => E.strPre(0, 1, 256, 64));

// ldp/stp: all modes 32/64, negative offsets
check("stp x0,x1,[x2,#-8]", E.stp(0, 1, 2, -8, 64, "offset"), 0xA93F8440);
check("ldp x0,x1,[x2,#-8]", E.ldp(0, 1, 2, -8, 64, "offset"), 0xA97F8440);
check("stp x0,x1,[x2,#504]", E.stp(0, 1, 2, 504, 64, "offset"), 0xA91F8440);
check("ldp w0,w1,[x2],#-16", E.ldp(0, 1, 2, -16, 32, "post"), 0x28FE0440);
check("stp w0,w1,[x2,#-16]!", E.stp(0, 1, 2, -16, 32, "pre"), 0x29BE0440);
expectThrow("stp unaligned", () => E.stp(0, 1, 2, 4, 64, "offset"));
expectThrow("ldp offset overflow", () => E.ldp(0, 1, 2, 512, 64, "offset"));
expectThrow("stp bad mode", () => E.stp(0, 1, 2, 0, 64, "sideways"));

// ldr literal: negative, boundaries
check("ldr x0,[pc,#-4]", E.ldrLiteral(0, -1, 64), 0x58FFFFE0);
check("ldr w0,[pc,#4]", E.ldrLiteral(0, 1, 32), 0x18000020);
expectThrow("ldrLiteral overflow", () => E.ldrLiteral(0, 1 << 18, 64));

// b/bl: ±128MB boundaries
check("b #134217724", E.b((1 << 25) - 1), 0x15FFFFFF);
check("b #-134217728", E.b(-(1 << 25)), 0x16000000);
expectThrow("b overflow", () => E.b(1 << 25));

// cbz/cbnz: boundaries
check("cbz x0,#-4", E.cbz(0, -1, 64), 0xB4FFFFE0);
check("cbnz x30,#1048572", E.cbnz(30, (1 << 18) - 1, 64), 0xB57FFFFE);

// bcond: all 15 conditions (AL=14; NV=15 is reserved/unused but encode it too)
{
	const condNames = ["eq", "ne", "cs", "cc", "mi", "pl", "vs", "vc", "hi", "ls", "ge", "lt", "gt", "le", "al"];
	condNames.forEach((name, i) => {
		check(`b.${name} #0`, E.bcond(name, 0), (0x54000000 | i) >>> 0);
	});
	// case-insensitive + aliases
	check("b.hs", E.bcond("hs", 0), 0x54000002);
	check("b.lo", E.bcond("lo", 0), 0x54000003);
	expectThrow("bcond bad cond", () => E.bcond("xx", 0));
	// Note: numeric cond 15 (NV) is accepted by the encoder (permissive);
	// the C backend never emits it (its condition map has no NV).
}

// svc boundaries
check("svc #0xffff", E.svc(0xFFFF), 0xD41FFFE1);
expectThrow("svc overflow", () => E.svc(0x10000));

// br/blr/ret with sp
check("br sp", E.br(31), 0xD61F03E0);
check("ret sp", E.ret(31), 0xD65F03E0);

// parseReg aliases
{
	const r = E.parseReg("fp");
	check("parseReg fp", r.num === 29 && r.sf === 64 ? 1 : 0, 1);
	const w = E.parseReg("wsp");
	check("parseReg wsp", w.num === 31 && w.sf === 32 ? 1 : 0, 1);
	expectThrow("parseReg x31", () => E.parseReg("x31"));
	expectThrow("parseReg bogus", () => E.parseReg("r0"));
}

// ---------------------------------------------------------------------------
// 3. Fuzz: field placement for random valid inputs
// ---------------------------------------------------------------------------
function rnd(n) {
	return Math.floor(Math.random() * n);
}
function field(w, hi, lo) {
	return (w >>> lo) & ((1 << (hi - lo + 1)) - 1);
}
{
	let n = 2000;
	for (let i = 0; i < n; i++) {
		const rd = rnd(32), rn = rnd(32), rm = rnd(32);
		const sf = rnd(2) ? 64 : 32;
		// addReg field placement
		const w = E.addReg(rd, rn, rm, 0, 0, sf);
		if (field(w, 4, 0) !== rd || field(w, 9, 5) !== rn || field(w, 20, 16) !== rm ||
			field(w, 31, 31) !== (sf === 64 ? 1 : 0)) {
			failed++;
			failures.push(`addReg field placement: ${hex(w)} rd=${rd} rn=${rn} rm=${rm} sf=${sf}`);
		} else passed++;
		// ldrImm field placement
		const off = rnd(4096) * (sf === 64 ? 8 : 4);
		const w2 = E.ldrImm(rd, rn, off, sf);
		if (field(w2, 4, 0) !== rd || field(w2, 9, 5) !== rn ||
			field(w2, 21, 10) !== off / (sf === 64 ? 8 : 4)) {
			failed++;
			failures.push(`ldrImm field placement: ${hex(w2)}`);
		} else passed++;
		// movz field placement
		const imm16 = rnd(65536), hw = rnd(sf === 64 ? 4 : 2);
		const w3 = E.movz(rd, imm16, hw, sf);
		if (field(w3, 4, 0) !== rd || field(w3, 20, 5) !== imm16 || field(w3, 22, 21) !== hw) {
			failed++;
			failures.push(`movz field placement: ${hex(w3)}`);
		} else passed++;
	}
	console.log(`fuzz field placement: ${n * 3} encodings checked`);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`\nIndependent verification: ${passed} passed, ${failed} failed`);
if (failures.length) {
	console.log("FAILURES:");
	for (const f of failures.slice(0, 40)) console.log("  " + f);
	if (failures.length > 40) console.log(`  ... and ${failures.length - 40} more`);
	process.exit(1);
}
console.log("All independent checks pass. B\"H");
