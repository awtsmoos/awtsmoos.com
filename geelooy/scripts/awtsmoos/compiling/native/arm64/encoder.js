/*
B"H
Boruch Hashem
Biezrash Hashem
*/
/**
 * AArch64 instruction encoder.
 *
 * Pure JavaScript, zero dependencies. Every AArch64 instruction is a fixed
 * 32-bit word, so encoding is a matter of placing fields at the right bit
 * positions per the ARM Architecture Reference Manual.
 *
 * All functions return an unsigned 32-bit word. Register numbers are 0-30,
 * with 31 meaning XZR/WZR (or SP where the instruction allows it). `sf`
 * selects the register width: 64 for X registers, 32 for W registers.
 */

// --- Registers -------------------------------------------------------------

export const XZR = 31;
export const SP = 31;

const REG_RE = /^(x|w)(\d+)$/;

/**
 * Parse an ARM64 register name: x0-x30, w0-w30, sp, xzr, wzr.
 * Returns { num, sf } where sf is 64 or 32.
 */
export function parseReg(name) {
	const n = name.trim().toLowerCase();
	if (n === "sp") return { num: 31, sf: 64, sp: true };
	if (n === "wsp") return { num: 31, sf: 32, sp: true };
	if (n === "xzr") return { num: 31, sf: 64 };
	if (n === "wzr") return { num: 31, sf: 32 };
	if (n === "fp") return { num: 29, sf: 64 };
	if (n === "wfp") return { num: 29, sf: 32 };
	if (n === "lr") return { num: 30, sf: 64 };
	if (n === "wlr") return { num: 30, sf: 32 };
	const m = n.match(REG_RE);
	if (!m) throw new Error(`Bad register: ${name}`);
	const num = parseInt(m[1] === "x" ? m[2] : m[2], 10);
	if (num < 0 || num > 30) throw new Error(`Bad register: ${name}`);
	return { num, sf: m[1] === "x" ? 64 : 32 };
}

// --- Shift types -----------------------------------------------------------

export const SHIFT_LSL = 0;
export const SHIFT_LSR = 1;
export const SHIFT_ASR = 2;
export const SHIFT_ROR = 3;

export function parseShift(name) {
	switch (name.trim().toLowerCase()) {
		case "lsl": return SHIFT_LSL;
		case "lsr": return SHIFT_LSR;
		case "asr": return SHIFT_ASR;
		case "ror": return SHIFT_ROR;
		default: throw new Error(`Bad shift: ${name}`);
	}
}

// --- Bit helpers -----------------------------------------------------------

function u32(v) {
	return v >>> 0;
}

function checkRange(v, lo, hi, what) {
	if (!Number.isInteger(v) || v < lo || v > hi) {
		throw new Error(`${what} out of range [${lo}, ${hi}]: ${v}`);
	}
}

// --- Logical (bitmask) immediates ------------------------------------------

/**
 * Encode a logical-immediate bitmask (AND/ORR/EOR/TST/MOV alias forms).
 * Returns { n, immr, imms } or throws when the value is not encodable.
 *
 * A valid mask is a rotated contiguous run of 1s, repeated to fill the
 * register width. We search element sizes 2..64 (smallest first, the
 * canonical choice) for a repeating element that is a rotated ones-run.
 */
export function encodeBitmask(value, width) {
	const full = width === 64 ? 0xFFFFFFFFFFFFFFFFn : 0xFFFFFFFFn;
	const v = BigInt(value) & full;
	if (v === 0n || v === full) throw new Error(`Not a valid bitmask immediate: ${value}`);

	for (let esize = 2; esize <= width; esize *= 2) {
		const emask = (1n << BigInt(esize)) - 1n;
		const elem = v & emask;
		let ok = true;
		for (let off = esize; off < width; off += esize) {
			if (((v >> BigInt(off)) & emask) !== elem) { ok = false; break; }
		}
		if (!ok) continue;

		let ones = 0;
		for (let i = 0; i < esize; i++) {
			if ((elem >> BigInt(i)) & 1n) ones++;
		}
		if (ones === 0 || ones === esize) continue;

		// Find the rotation R such that elem == ROR(ones(ones), esize, R).
		// The ones-run may start at any bit position (e.g. 0xB = 0b1011 is a
		// rotated run of 3 ones), so every rotation must be tried.
		const want = (1n << BigInt(ones)) - 1n;
		let immr = -1;
		for (let r = 0; r < esize; r++) {
			const rot = (((want >> BigInt(r)) | (want << BigInt(esize - r))) & emask);
			if (rot === elem) { immr = r; break; }
		}
		if (immr < 0) continue;
		const n = esize === 64 ? 1 : 0;
		let imms;
		if (esize === 64) {
			imms = ones - 1;
		} else {
			const len = Math.log2(esize);
			imms = (1 << len) | (ones - 1);
		}
		return { n, immr, imms };
	}
	throw new Error(`Not a valid bitmask immediate: ${value}`);
}

// --- Data movement ---------------------------------------------------------

// Move wide: sf opc 100101 hw imm16 Rd ; opc: 00=MOVN 10=MOVZ 11=MOVK
function moveWide(opc, rd, imm16, hw, sf) {
	checkRange(rd, 0, 31, "Rd");
	checkRange(imm16, 0, 0xFFFF, "imm16");
	const maxHw = sf === 64 ? 3 : 1;
	checkRange(hw, 0, maxHw, "hw");
	const s = sf === 64 ? 1 : 0;
	return u32((s << 31) | (opc << 29) | (0b100101 << 23) | (hw << 21) | (imm16 << 5) | rd);
}

export function movz(rd, imm16, hw, sf) {
	return moveWide(0b10, rd, imm16, hw, sf);
}

export function movk(rd, imm16, hw, sf) {
	return moveWide(0b11, rd, imm16, hw, sf);
}

export function movn(rd, imm16, hw, sf) {
	return moveWide(0b00, rd, imm16, hw, sf);
}

/** MOV (register) — alias of ORR with XZR/WZR. */
export function movReg(rd, rm, sf) {
	return orrReg(rd, XZR, rm, SHIFT_LSL, 0, sf);
}

/** ADR: 21-bit signed byte offset from PC. */
export function adr(rd, offset) {
	checkRange(rd, 0, 31, "Rd");
	checkRange(offset, -(1 << 20), (1 << 20) - 1, "ADR offset");
	const imm = offset & 0x1FFFFF;
	const immlo = imm & 0x3;
	const immhi = (imm >> 2) & 0x7FFFF;
	return u32((immlo << 29) | (0b10000 << 24) | (immhi << 5) | rd);
}

/** ADRP: 21-bit signed page offset from PC page. */
export function adrp(rd, pageOffset) {
	checkRange(rd, 0, 31, "Rd");
	checkRange(pageOffset, -(1 << 20), (1 << 20) - 1, "ADRP offset");
	const imm = pageOffset & 0x1FFFFF;
	const immlo = imm & 0x3;
	const immhi = (imm >> 2) & 0x7FFFF;
	return u32((1 << 31) | (immlo << 29) | (0b10000 << 24) | (immhi << 5) | rd);
}

// --- Arithmetic ------------------------------------------------------------

// Add/sub (immediate): sf op S 100010 sh imm12 Rn Rd
function addSubImm(op, setFlags, rd, rn, imm12, sh, sf) {
	checkRange(rd, 0, 31, "Rd");
	checkRange(rn, 0, 31, "Rn");
	checkRange(imm12, 0, 0xFFF, "imm12");
	if (sh !== 0 && sh !== 1) throw new Error(`Bad imm shift (want 0 or 12): ${sh}`);
	const s = sf === 64 ? 1 : 0;
	return u32((s << 31) | (op << 30) | (setFlags << 29) | (0b100010 << 23) | (sh << 22) | (imm12 << 10) | (rn << 5) | rd);
}

export function addImm(rd, rn, imm12, sh, sf) {
	return addSubImm(0, 0, rd, rn, imm12, sh, sf);
}

export function addsImm(rd, rn, imm12, sh, sf) {
	return addSubImm(0, 1, rd, rn, imm12, sh, sf);
}

export function subImm(rd, rn, imm12, sh, sf) {
	return addSubImm(1, 0, rd, rn, imm12, sh, sf);
}

export function subsImm(rd, rn, imm12, sh, sf) {
	return addSubImm(1, 1, rd, rn, imm12, sh, sf);
}

// Add/sub (shifted register): sf op S 01011 shift 0 Rm imm6 Rn Rd
function addSubReg(op, setFlags, rd, rn, rm, shift, amount, sf) {
	checkRange(rd, 0, 31, "Rd");
	checkRange(rn, 0, 31, "Rn");
	checkRange(rm, 0, 31, "Rm");
	checkRange(shift, 0, 2, "shift");
	checkRange(amount, 0, sf === 64 ? 63 : 31, "shift amount");
	const s = sf === 64 ? 1 : 0;
	return u32((s << 31) | (op << 30) | (setFlags << 29) | (0b01011 << 24) | (shift << 22) | (rm << 16) | (amount << 10) | (rn << 5) | rd);
}

export function addReg(rd, rn, rm, shift, amount, sf) {
	return addSubReg(0, 0, rd, rn, rm, shift, amount, sf);
}

export function addsReg(rd, rn, rm, shift, amount, sf) {
	return addSubReg(0, 1, rd, rn, rm, shift, amount, sf);
}

export function subReg(rd, rn, rm, shift, amount, sf) {
	return addSubReg(1, 0, rd, rn, rm, shift, amount, sf);
}

export function subsReg(rd, rn, rm, shift, amount, sf) {
	return addSubReg(1, 1, rd, rn, rm, shift, amount, sf);
}

/** NEG — alias of SUB with XZR/WZR. */
export function neg(rd, rm, shift, amount, sf) {
	return subReg(rd, XZR, rm, shift, amount, sf);
}

/** MUL — alias of MADD with XZR/WZR as the addend. */
export function mul(rd, rn, rm, sf) {
	checkRange(rd, 0, 31, "Rd");
	checkRange(rn, 0, 31, "Rn");
	checkRange(rm, 0, 31, "Rm");
	const s = sf === 64 ? 1 : 0;
	return u32((s << 31) | (0b11011 << 24) | (rm << 16) | (XZR << 10) | (rn << 5) | rd);
}

/** MADD: Rd = Ra + Rn*Rm (full three-operand form). */
export function madd(rd, rn, rm, ra, sf) {
	checkRange(rd, 0, 31, "Rd");
	checkRange(rn, 0, 31, "Rn");
	checkRange(rm, 0, 31, "Rm");
	checkRange(ra, 0, 31, "Ra");
	const s = sf === 64 ? 1 : 0;
	return u32((s << 31) | (0b11011 << 24) | (rm << 16) | (ra << 10) | (rn << 5) | rd);
}

/**
 * MSUB: Rd = Ra - Rn*Rm. Same data-processing 3-source class as MADD with the
 * o1 bit (bit 15) set. The C backend emits this for the % operator.
 */
export function msub(rd, rn, rm, ra, sf) {
	checkRange(rd, 0, 31, "Rd");
	checkRange(rn, 0, 31, "Rn");
	checkRange(rm, 0, 31, "Rm");
	checkRange(ra, 0, 31, "Ra");
	const s = sf === 64 ? 1 : 0;
	return u32((s << 31) | (0b11011 << 24) | (rm << 16) | (1 << 15) | (ra << 10) | (rn << 5) | rd);
}

// Data-processing 3-source: sf 00 11010110 Rm o2(6) Rn Rd ; o2: 000011=SDIV 000010=UDIV
function div(op2, rd, rn, rm, sf) {
	checkRange(rd, 0, 31, "Rd");
	checkRange(rn, 0, 31, "Rn");
	checkRange(rm, 0, 31, "Rm");
	const s = sf === 64 ? 1 : 0;
	return u32((s << 31) | (0b11010110 << 21) | (rm << 16) | (op2 << 10) | (rn << 5) | rd);
}

export function sdiv(rd, rn, rm, sf) {
	return div(0b000011, rd, rn, rm, sf);
}

export function udiv(rd, rn, rm, sf) {
	return div(0b000010, rd, rn, rm, sf);
}

// --- Logical ---------------------------------------------------------------

// Logical (shifted register): sf opc 01010 shift N Rm imm6 Rn Rd
function logicalReg(opc, rd, rn, rm, shift, amount, sf) {
	checkRange(rd, 0, 31, "Rd");
	checkRange(rn, 0, 31, "Rn");
	checkRange(rm, 0, 31, "Rm");
	checkRange(shift, 0, 3, "shift");
	checkRange(amount, 0, sf === 64 ? 63 : 31, "shift amount");
	const s = sf === 64 ? 1 : 0;
	return u32((s << 31) | (opc << 29) | (0b01010 << 24) | (shift << 22) | (rm << 16) | (amount << 10) | (rn << 5) | rd);
}

export function andReg(rd, rn, rm, shift, amount, sf) {
	return logicalReg(0b00, rd, rn, rm, shift, amount, sf);
}

export function orrReg(rd, rn, rm, shift, amount, sf) {
	return logicalReg(0b01, rd, rn, rm, shift, amount, sf);
}

export function eorReg(rd, rn, rm, shift, amount, sf) {
	return logicalReg(0b10, rd, rn, rm, shift, amount, sf);
}

export function andsReg(rd, rn, rm, shift, amount, sf) {
	return logicalReg(0b11, rd, rn, rm, shift, amount, sf);
}

// Logical (immediate): sf opc 100100 N immr imms Rn Rd
function logicalImm(opc, rd, rn, imm, sf) {
	checkRange(rd, 0, 31, "Rd");
	checkRange(rn, 0, 31, "Rn");
	const { n, immr, imms } = encodeBitmask(imm, sf);
	const s = sf === 64 ? 1 : 0;
	return u32((s << 31) | (opc << 29) | (0b100100 << 23) | (n << 22) | (immr << 16) | (imms << 10) | (rn << 5) | rd);
}

export function andImm(rd, rn, imm, sf) {
	return logicalImm(0b00, rd, rn, imm, sf);
}

export function orrImm(rd, rn, imm, sf) {
	return logicalImm(0b01, rd, rn, imm, sf);
}

export function eorImm(rd, rn, imm, sf) {
	return logicalImm(0b10, rd, rn, imm, sf);
}

// Bitfield move: sf opc 100110 N immr imms Rn Rd
// opc: 00=SBFM, 01=BFM, 10=UBFM
function bitfield(opc, rd, rn, immr, imms, sf) {
	checkRange(rd, 0, 31, "Rd");
	checkRange(rn, 0, 31, "Rn");
	const max = sf === 64 ? 63 : 31;
	checkRange(immr, 0, max, "immr");
	checkRange(imms, 0, max, "imms");
	const s = sf === 64 ? 1 : 0;
	const n = sf === 64 ? 1 : 0;
	return u32((s << 31) | (opc << 29) | (0b100110 << 23) | (n << 22) | (immr << 16) | (imms << 10) | (rn << 5) | rd);
}

/** LSL (immediate) — alias of UBFM. */
export function lsl(rd, rn, amount, sf) {
	const w = sf === 64 ? 64 : 32;
	checkRange(amount, 0, w - 1, "LSL amount");
	return bitfield(0b10, rd, rn, (w - amount) % w, w - 1 - amount, sf);
}

/** LSR (immediate) — alias of UBFM. */
export function lsr(rd, rn, amount, sf) {
	const w = sf === 64 ? 64 : 32;
	checkRange(amount, 0, w - 1, "LSR amount");
	return bitfield(0b10, rd, rn, amount, w - 1, sf);
}

/** ASR (immediate) — alias of SBFM. */
export function asr(rd, rn, amount, sf) {
	const w = sf === 64 ? 64 : 32;
	checkRange(amount, 0, w - 1, "ASR amount");
	return bitfield(0b00, rd, rn, amount, w - 1, sf);
}

// --- Comparison (aliases of ADDS/SUBS/ANDS with XZR/WZR) --------------------

export function cmpImm(rn, imm12, sh, sf) {
	return subsImm(XZR, rn, imm12, sh, sf);
}

export function cmpReg(rn, rm, shift, amount, sf) {
	return subsReg(XZR, rn, rm, shift, amount, sf);
}

export function cmnImm(rn, imm12, sh, sf) {
	return addsImm(XZR, rn, imm12, sh, sf);
}

export function cmnReg(rn, rm, shift, amount, sf) {
	return addsReg(XZR, rn, rm, shift, amount, sf);
}

export function tstReg(rn, rm, shift, amount, sf) {
	return andsReg(XZR, rn, rm, shift, amount, sf);
}

export function tstImm(rn, imm, sf) {
	return logicalImm(0b11, XZR, rn, imm, sf);
}

// --- Memory ----------------------------------------------------------------

// Load/store (unsigned immediate): size 111001 01 imm12 Rn Rt ; imm12 scaled
function ldstImmUnsigned(isLoad, rt, rn, byteOffset, sf) {
	checkRange(rt, 0, 31, "Rt");
	checkRange(rn, 0, 31, "Rn");
	const scale = sf === 64 ? 8 : 4;
	if (byteOffset % scale !== 0) throw new Error(`Unaligned offset for ${sf}-bit LDR/STR: ${byteOffset}`);
	const imm12 = byteOffset / scale;
	checkRange(imm12, 0, 0xFFF, "imm12");
	const size = sf === 64 ? 0b11 : 0b10;
	const opc = isLoad ? 0b01 : 0b00;
	return u32((size << 30) | (0b111001 << 24) | (opc << 22) | (imm12 << 10) | (rn << 5) | rt);
}

export function ldrImm(rt, rn, byteOffset, sf) {
	return ldstImmUnsigned(true, rt, rn, byteOffset, sf);
}

export function strImm(rt, rn, byteOffset, sf) {
	return ldstImmUnsigned(false, rt, rn, byteOffset, sf);
}

// Load/store (unscaled immediate): size 111000 0(0)/1(0) 0 imm9 Rn Rt
// STUR/LDUR support -256..255 byte offsets, no scaling
function ldstImmUnscaled(isLoad, rt, rn, byteOffset, sf) {
	checkRange(rt, 0, 31, "Rt");
	checkRange(rn, 0, 31, "Rn");
	checkRange(byteOffset, -256, 255, "unscaled offset");
	const size = sf === 64 ? 0b11 : 0b10;
	const opc = isLoad ? 0b01 : 0b00;
	return u32((size << 30) | (0b111000 << 24) | (opc << 22) | ((byteOffset & 0x1FF) << 12) | (rn << 5) | rt);
}

export function ldur(rt, rn, byteOffset, sf) {
	return ldstImmUnscaled(true, rt, rn, byteOffset, sf);
}

export function stur(rt, rn, byteOffset, sf) {
	return ldstImmUnscaled(false, rt, rn, byteOffset, sf);
}

// Load/store with pre/post-indexed addressing
function ldstIndexed(isLoad, rt, rn, byteOffset, sf, mode) {
	checkRange(rt, 0, 31, "Rt");
	checkRange(rn, 0, 31, "Rn");
	checkRange(byteOffset, -256, 255, "indexed offset");
	const size = sf === 64 ? 0b11 : 0b10;
	const opc = isLoad ? 0b01 : 0b00;
	const idx = mode === "pre" ? 0b11 : mode === "post" ? 0b01 : null;
	if (idx === null) throw new Error(`Bad indexed mode: ${mode}`);
	return u32((size << 30) | (0b111000 << 24) | (opc << 22) | ((byteOffset & 0x1FF) << 12) | (idx << 10) | (rn << 5) | rt);
}

export function ldrPre(rt, rn, byteOffset, sf) {
	return ldstIndexed(true, rt, rn, byteOffset, sf, "pre");
}

export function strPre(rt, rn, byteOffset, sf) {
	return ldstIndexed(false, rt, rn, byteOffset, sf, "pre");
}

export function ldrPost(rt, rn, byteOffset, sf) {
	return ldstIndexed(true, rt, rn, byteOffset, sf, "post");
}

export function strPost(rt, rn, byteOffset, sf) {
	return ldstIndexed(false, rt, rn, byteOffset, sf, "post");
}

// Narrow load/store (unsigned immediate): size(1/2) 111001 opc imm12 Rn Rt ;
// imm12 scaled by the access size. opc: 00 store, 01 zero-extending load,
// 10 sign-extending load into Xt (LDRSB/LDRSH/LDRSW).
function ldstNarrowUnsigned(isLoad, signed, rt, rn, byteOffset, size) {
	checkRange(rt, 0, 31, "Rt");
	checkRange(rn, 0, 31, "Rn");
	if (!Number.isInteger(byteOffset / size) || byteOffset < 0) {
		throw new Error(`Unaligned offset for narrow access: ${byteOffset}`);
	}
	const imm12 = byteOffset / size;
	checkRange(imm12, 0, 0xFFF, "imm12");
	const sizeCode = size === 1 ? 0b00 : size === 2 ? 0b01 : 0b10;
	const opc = !isLoad ? 0b00 : signed ? 0b10 : 0b01;
	return u32((sizeCode << 30) | (0b111001 << 24) | (opc << 22) | (imm12 << 10) | (rn << 5) | rt);
}

export function ldrbImm(rt, rn, byteOffset) {
	return ldstNarrowUnsigned(true, false, rt, rn, byteOffset, 1);
}

export function strbImm(rt, rn, byteOffset) {
	return ldstNarrowUnsigned(false, false, rt, rn, byteOffset, 1);
}

export function ldrhImm(rt, rn, byteOffset) {
	return ldstNarrowUnsigned(true, false, rt, rn, byteOffset, 2);
}

export function strhImm(rt, rn, byteOffset) {
	return ldstNarrowUnsigned(false, false, rt, rn, byteOffset, 2);
}

export function ldrsbImm(rt, rn, byteOffset) {
	return ldstNarrowUnsigned(true, true, rt, rn, byteOffset, 1);
}

export function ldrshImm(rt, rn, byteOffset) {
	return ldstNarrowUnsigned(true, true, rt, rn, byteOffset, 2);
}

export function ldrswImm(rt, rn, byteOffset) {
	return ldstNarrowUnsigned(true, true, rt, rn, byteOffset, 4);
}

// Narrow load/store (unscaled immediate): size 111000 opc imm9 Rn Rt ;
// LDURB/STURB/LDURH/STURH/LDURSB/LDURSH, -256..255, no scaling.
function ldstNarrowUnscaled(isLoad, signed, rt, rn, byteOffset, size) {
	checkRange(rt, 0, 31, "Rt");
	checkRange(rn, 0, 31, "Rn");
	checkRange(byteOffset, -256, 255, "unscaled offset");
	const sizeCode = size === 1 ? 0b00 : size === 2 ? 0b01 : 0b10;
	const opc = !isLoad ? 0b00 : signed ? 0b10 : 0b01;
	return u32((sizeCode << 30) | (0b111000 << 24) | (opc << 22) | ((byteOffset & 0x1FF) << 12) | (rn << 5) | rt);
}

export function ldurb(rt, rn, byteOffset) {
	return ldstNarrowUnscaled(true, false, rt, rn, byteOffset, 1);
}

export function sturb(rt, rn, byteOffset) {
	return ldstNarrowUnscaled(false, false, rt, rn, byteOffset, 1);
}

export function ldurh(rt, rn, byteOffset) {
	return ldstNarrowUnscaled(true, false, rt, rn, byteOffset, 2);
}

export function sturh(rt, rn, byteOffset) {
	return ldstNarrowUnscaled(false, false, rt, rn, byteOffset, 2);
}

export function ldursb(rt, rn, byteOffset) {
	return ldstNarrowUnscaled(true, true, rt, rn, byteOffset, 1);
}

export function ldursh(rt, rn, byteOffset) {
	return ldstNarrowUnscaled(true, true, rt, rn, byteOffset, 2);
}

export function ldursw(rt, rn, byteOffset) {
	return ldstNarrowUnscaled(true, true, rt, rn, byteOffset, 4);
}

// FMOV (general): bit-preserving transfers between general and SIMD&FP
// registers. Encodings verified against the emulator's own FMOV decoder.
export function fmovToSimd32(sd, wn) {
	checkRange(sd, 0, 31, "Sd");
	checkRange(wn, 0, 31, "Wn");
	return u32(0x1e270000 | (wn << 5) | sd);
}

export function fmovToGen32(wd, sn) {
	checkRange(wd, 0, 31, "Wd");
	checkRange(sn, 0, 31, "Sn");
	return u32(0x1e260000 | (sn << 5) | wd);
}

export function fmovToSimd64(dd, xn) {
	checkRange(dd, 0, 31, "Dd");
	checkRange(xn, 0, 31, "Xn");
	return u32(0x9e670000 | (xn << 5) | dd);
}

export function fmovToGen64(xd, dn) {
	checkRange(xd, 0, 31, "Xd");
	checkRange(dn, 0, 31, "Dn");
	return u32(0x9e660000 | (dn << 5) | xd);
}

// Load/store pair: size(31-30) 10100(29-25) idx(24-23) L(22) imm7 Rt2 Rn Rt
// size: 00=32-bit, 10=64-bit ; L: 0=store, 1=load ; imm7 scaled, signed
const PAIR_IDX = { offset: 0b10, pre: 0b11, post: 0b01 };

export function ldp(rt, rt2, rn, byteOffset, sf, mode) {
	return ldstp(true, rt, rt2, rn, byteOffset, sf, mode);
}

export function stp(rt, rt2, rn, byteOffset, sf, mode) {
	return ldstp(false, rt, rt2, rn, byteOffset, sf, mode);
}

function ldstp(isLoad, rt, rt2, rn, byteOffset, sf, mode = "offset") {
	checkRange(rt, 0, 31, "Rt");
	checkRange(rt2, 0, 31, "Rt2");
	checkRange(rn, 0, 31, "Rn");
	const scale = sf === 64 ? 8 : 4;
	if (byteOffset % scale !== 0) throw new Error(`Unaligned offset for ${sf}-bit LDP/STP: ${byteOffset}`);
	const imm7 = byteOffset / scale;
	checkRange(imm7, -64, 63, "pair offset");
	const idx = PAIR_IDX[mode];
	if (idx === undefined) throw new Error(`Bad pair mode: ${mode}`);
	const size = sf === 64 ? 0b10 : 0b00;
	const L = isLoad ? 1 : 0;
	return u32((size << 30) | (0b10100 << 25) | (idx << 23) | (L << 22) | ((imm7 & 0x7F) << 15) | (rt2 << 10) | (rn << 5) | rt);
}

/** LDR (literal): 19-bit signed word offset from PC. */
export function ldrLiteral(rt, wordOffset, sf) {
	checkRange(rt, 0, 31, "Rt");
	checkRange(wordOffset, -(1 << 18), (1 << 18) - 1, "literal offset");
	const opc = sf === 64 ? 0b01 : 0b00;
	return u32((opc << 30) | (0b011000 << 24) | ((wordOffset & 0x7FFFF) << 5) | rt);
}

// --- Control flow ----------------------------------------------------------

export const COND = {
	EQ: 0, NE: 1, CS: 2, HS: 2, CC: 3, LO: 3, MI: 4, PL: 5,
	VS: 6, VC: 7, HI: 8, LS: 9, GE: 10, LT: 11, GT: 12, LE: 13, AL: 14
};

export function parseCond(name) {
	const c = COND[name.trim().toUpperCase()];
	if (c === undefined) throw new Error(`Bad condition: ${name}`);
	return c;
}

/** B: 26-bit signed word offset from PC. */
export function b(wordOffset) {
	checkRange(wordOffset, -(1 << 25), (1 << 25) - 1, "B offset");
	return u32(0x14000000 | (wordOffset & 0x3FFFFFF));
}

/** BL: 26-bit signed word offset from PC. */
export function bl(wordOffset) {
	checkRange(wordOffset, -(1 << 25), (1 << 25) - 1, "BL offset");
	return u32(0x94000000 | (wordOffset & 0x3FFFFFF));
}

/** BR: branch to register. */
export function br(rn) {
	checkRange(rn, 0, 31, "Rn");
	return u32(0xD61F0000 | (rn << 5));
}

/** BLR: branch with link to register. */
export function blr(rn) {
	checkRange(rn, 0, 31, "Rn");
	return u32(0xD63F0000 | (rn << 5));
}

/** RET: return from subroutine (default X30). */
export function ret(rn = 30) {
	checkRange(rn, 0, 31, "Rn");
	return u32(0xD65F0000 | (rn << 5));
}

/** CBZ/CBNZ: sf(31) 011010(30-25) op(24) imm19(23-5) Rt(4-0). */
function cb(isNz, rt, wordOffset, sf) {
	checkRange(rt, 0, 31, "Rt");
	checkRange(wordOffset, -(1 << 18), (1 << 18) - 1, "CBZ/CBNZ offset");
	const s = sf === 64 ? 1 : 0;
	const op = isNz ? 1 : 0;
	return u32((s << 31) | (0b011010 << 25) | (op << 24) | ((wordOffset & 0x7FFFF) << 5) | rt);
}

export function cbz(rt, wordOffset, sf) {
	return cb(false, rt, wordOffset, sf);
}

export function cbnz(rt, wordOffset, sf) {
	return cb(true, rt, wordOffset, sf);
}

/** B.cond: 19-bit signed word offset from PC. */
export function bcond(cond, wordOffset) {
	const c = typeof cond === "string" ? parseCond(cond) : cond;
	checkRange(c, 0, 15, "condition");
	checkRange(wordOffset, -(1 << 18), (1 << 18) - 1, "B.cond offset");
	return u32(0x54000000 | ((wordOffset & 0x7FFFF) << 5) | c);
}

// --- System ----------------------------------------------------------------

/** SVC: supervisor call with 16-bit immediate. */
export function svc(imm16) {
	checkRange(imm16, 0, 0xFFFF, "SVC immediate");
	return u32(0xD4000000 | (imm16 << 5) | 0b01);
}

/** NOP: hint #0. */
export function nop() {
	return u32(0xD503201F);
}
