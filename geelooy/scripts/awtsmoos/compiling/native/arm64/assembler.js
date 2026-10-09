/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import * as E from "./encoder.js";

/**
 * ARM64 assembler: text in, machine-code words out.
 *
 * One instruction per line, `label:` labels, `;` or `//` comments,
 * `.text` / `.data` sections. Branch and address instructions take label
 * operands; PC-relative offsets are patched once the layout is known.
 */

// --- Operand parsing -------------------------------------------------------

function parseNumber(text) {
	let t = text.trim();
	if (t.startsWith("#")) t = t.slice(1).trim();
	if (t.startsWith(":lo12:")) return { lo12: t.slice(6).trim() };
	const neg = t.startsWith("-");
	if (neg) t = t.slice(1);
	let v;
	if (t.toLowerCase().startsWith("0x")) {
		const big = BigInt("0x" + t.slice(2));
		v = big <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(big) : big;
	} else if (/^\d+$/.test(t)) {
		v = parseInt(t, 10);
		if (!Number.isSafeInteger(v)) throw new Error(`Immediate too large: ${text}`);
	} else {
		throw new Error(`Bad immediate: ${text}`);
	}
	return neg ? (typeof v === "bigint" ? -v : -v) : v;
}

/** Most operands need a plain Number; BigInt means out of range there. */
function num(v, what) {
	if (typeof v === "bigint") throw new Error(`${what} too large: ${v}`);
	return v;
}

function parseShiftAmount(text, sf, allowRor) {
	// "lsl #3"
	const parts = text.trim().split(/\s+/);
	if (parts.length !== 2) throw new Error(`Bad shift: ${text}`);
	const type = E.parseShift(parts[0]);
	if (type === E.SHIFT_ROR && !allowRor) throw new Error(`ROR only valid on logicals: ${text}`);
	const amount = parseNumber(parts[1]);
	if (typeof amount === "object") throw new Error(`Bad shift amount: ${text}`);
	const amountN = num(amount, "shift amount");
	const max = sf === 64 ? 63 : 31;
	if (amountN < 0 || amountN > max) throw new Error(`Shift amount out of range: ${text}`);
	return { type, amount: amountN };
}

/** Split operands on commas, ignoring commas inside [ ]. */
function splitOperands(text) {
	const parts = [];
	let depth = 0;
	let cur = "";
	for (const ch of text) {
		if (ch === "[") depth++;
		if (ch === "]") depth--;
		if (ch === "," && depth === 0) {
			parts.push(cur.trim());
			cur = "";
		} else {
			cur += ch;
		}
	}
	if (cur.trim() !== "") parts.push(cur.trim());
	return parts;
}

/**
 * Parse [Rn], [Rn, #imm], [Rn, #imm]!, [Rn], #imm.
 * Returns { rn, offset, mode } with mode in offset|pre|post.
 */
function parseMem(text) {
	let t = text.trim();
	let mode = "offset";
	if (t.endsWith("!")) {
		mode = "pre";
		t = t.slice(0, -1).trim();
	}
	// Post-index: [Rn], #imm
	const post = t.match(/^\[([^\]]+)\]\s*,\s*(.+)$/);
	if (post) {
		if (mode !== "offset") throw new Error(`Bad memory operand: ${text}`);
		mode = "post";
		const rn = E.parseReg(post[1]);
		const offsetRaw = parseNumber(post[2]);
		if (typeof offsetRaw === "object") throw new Error(`Bad memory offset: ${text}`);
		const offset = num(offsetRaw, "memory offset");
		return { rn: rn.num, offset, mode };
	}
	const m = t.match(/^\[([^\]]+)\]$/);
	if (!m) throw new Error(`Bad memory operand: ${text}`);
	const inner = splitOperands(m[1]);
	const rn = E.parseReg(inner[0]);
	let offset = 0;
	if (inner.length > 1) {
		const offRaw = parseNumber(inner[1]);
		if (typeof offRaw === "object") throw new Error(`Bad memory offset: ${text}`);
		offset = num(offRaw, "memory offset");
	}
	if (inner.length > 2) throw new Error(`Bad memory operand: ${text}`);
	return { rn: rn.num, offset, mode };
}

function stripComment(line) {
	let inStr = false;
	for (let i = 0; i < line.length; i++) {
		const c = line[i];
		if (c === '"') inStr = !inStr;
		if (!inStr) {
			if (c === ";") return line.slice(0, i);
			if (c === "/" && line[i + 1] === "/") return line.slice(0, i);
		}
	}
	return line;
}

// --- Code builder ----------------------------------------------------------

class Arm64Builder {
	constructor() {
		this.words = [];
		this.labels = {};   // name -> byte offset in final image
		this.patches = [];  // { wordIndex, kind, target }
	}

	emit(word) {
		this.words.push(word >>> 0);
	}

	emitPlaceholder(kind, target) {
		const idx = this.words.length;
		this.words.push(0);
		this.patches.push({ wordIndex: idx, kind, target });
	}

	markLabel(name) {
		if (this.labels[name] !== undefined) throw new Error(`Duplicate label: ${name}`);
		this.labels[name] = this.words.length * 4;
	}
}

// --- Instruction dispatch --------------------------------------------------

/** MOV Xd, #imm pseudo-expansion via MOVZ/MOVN/MOVK. */
function expandMovImm(rd, value, sf) {
	const bits = sf;
	const mask = bits === 64 ? 0xFFFFFFFFFFFFFFFFn : 0xFFFFFFFFn;
	const v = BigInt(value) & mask;
	const words = [];
	if (v === 0n) {
		words.push(E.movz(rd, 0, 0, sf));
		return words;
	}
	const nchunks = bits === 64 ? 4 : 2;
	const chunks = [];
	for (let i = 0; i < nchunks; i++) chunks.push(Number((v >> BigInt(16 * i)) & 0xFFFFn));
	const notv = (~v) & mask;
	if (notv <= 0xFFFFn) {
		words.push(E.movn(rd, Number(notv), 0, sf));
		return words;
	}
	let first = true;
	for (let i = 0; i < nchunks; i++) {
		if (chunks[i] === 0) continue;
		if (first) {
			words.push(E.movz(rd, chunks[i], i, sf));
			first = false;
		} else {
			words.push(E.movk(rd, chunks[i], i, sf));
		}
	}
	return words;
}

function needArgs(ops, n, mnemonic) {
	if (ops.length !== n) throw new Error(`${mnemonic} wants ${n} operands, got ${ops.length}`);
}

function emitInstruction(b, mnemonic, ops) {
	// B.cond split: "b.eq" / "beq"
	let cond = null;
	let m = mnemonic;
	const dot = mnemonic.indexOf(".");
	if (dot !== -1) {
		m = mnemonic.slice(0, dot);
		cond = mnemonic.slice(dot + 1);
	} else if (/^b[a-z]{2}$/.test(mnemonic) && mnemonic !== "blr" && mnemonic !== "br") {
		cond = mnemonic.slice(1);
		m = "b";
	}
	if (cond !== null && m !== "b") throw new Error(`Condition only valid on B: ${mnemonic}`);

	switch (m) {
		// -- Data movement --
		case "movz":
		case "movk":
		case "movn": {
			if (ops.length < 2 || ops.length > 3) throw new Error(`${m} wants 2-3 operands, got ${ops.length}`);
			// Allow optional ", lsl #N" third operand
			const rd = E.parseReg(ops[0]);
			const rawImm = parseNumber(ops[1]);
			if (typeof rawImm === "object") throw new Error(`Bad immediate: ${ops[1]}`);
			const imm = num(rawImm, "immediate");
			let hw = 0;
			if (ops.length === 3) {
				const { type, amount } = parseShiftAmount(ops[2], rd.sf, false);
				if (type !== E.SHIFT_LSL || amount % 16 !== 0) throw new Error(`Move-wide shift must be LSL #0/16/32/48`);
				hw = amount / 16;
			}
			b.emit(m === "movz" ? E.movz(rd.num, imm, hw, rd.sf)
				: m === "movk" ? E.movk(rd.num, imm, hw, rd.sf)
				: E.movn(rd.num, imm, hw, rd.sf));
			return;
		}
		case "mov": {
			needArgs(ops, 2, m);
			const rd = E.parseReg(ops[0]);
			if (ops[1].trim().startsWith("[") || ops[1].trim().startsWith("=")) {
				throw new Error(`MOV with ${ops[1]} not supported; use LDR`);
			}
			try {
				const rm = E.parseReg(ops[1]);
				if (rm.sf !== rd.sf) throw new Error(`MOV register width mismatch: ${ops[0]}, ${ops[1]}`);
				// MOV to/from SP is an ADD #0 alias (ORR cannot touch SP)
				if (rd.sp || rm.sp) {
					b.emit(E.addImm(rd.num, rm.num, 0, 0, 64));
				} else {
					b.emit(E.movReg(rd.num, rm.num, rd.sf));
				}
				return;
			} catch (e) {
				if (!String(e.message).startsWith("Bad register")) throw e;
				// not a register: fall through to the immediate pseudo-instruction
			}
			// Immediate pseudo-instruction
			const imm = parseNumber(ops[1]);
			if (typeof imm === "object") throw new Error(`Bad MOV immediate: ${ops[1]}`);
			for (const w of expandMovImm(rd.num, imm, rd.sf)) b.emit(w);
			return;
		}
		case "adr": {
			needArgs(ops, 2, m);
			const rd = E.parseReg(ops[0]);
			const target = ops[1].trim();
			if (/^[a-zA-Z_.][\w$.]*$/.test(target)) {
				b.emitPlaceholder("adr", target);
				b.patches[b.patches.length - 1].rd = rd.num;
			} else b.emit(E.adr(rd.num, num(parseNumber(target), "offset")));
			return;
		}
		case "adrp": {
			needArgs(ops, 2, m);
			const rd = E.parseReg(ops[0]);
			const target = ops[1].trim();
			if (/^[a-zA-Z_.][\w$.]*$/.test(target)) {
				b.emitPlaceholder("adrp", target);
				b.patches[b.patches.length - 1].rd = rd.num;
			} else b.emit(E.adrp(rd.num, num(parseNumber(target), "offset")));
			return;
		}

		// -- Arithmetic --
		case "add":
		case "sub":
		case "adds":
		case "subs": {
			if (ops.length < 3 || ops.length > 4) throw new Error(`${m} wants 3-4 operands, got ${ops.length}`);
			const rd = E.parseReg(ops[0]);
			const rn = E.parseReg(ops[1]);
			if (rn.sf !== rd.sf) throw new Error(`${m} width mismatch`);
			const sf = rd.sf;
			const isAdd = m.startsWith("add");
			const setFlags = m.endsWith("s");
			try {
				const rm = E.parseReg(ops[2]);
				if (rm.sf !== sf) throw new Error(`${m} width mismatch`);
				let shift = E.SHIFT_LSL, amount = 0;
				if (ops.length === 4) ({ type: shift, amount } = parseShiftAmount(ops[3], sf, false));
				const fn = isAdd ? (setFlags ? E.addsReg : E.addReg) : (setFlags ? E.subsReg : E.subReg);
				b.emit(fn(rd.num, rn.num, rm.num, shift, amount, sf));
				return;
			} catch (e) {
				if (!String(e.message).startsWith("Bad register")) throw e;
				// not a register: fall through to the immediate form
			}
			const imm = parseNumber(ops[2]);
			if (typeof imm === "object" && imm.lo12) {
				// :lo12: relocation against a data/code label
				b.emitPlaceholder("lo12", imm.lo12);
				// lo12 patch kind depends on add vs sub; record via kind suffix
				b.patches[b.patches.length - 1].addSub = !isAdd;
				b.patches[b.patches.length - 1].rd = rd.num;
				b.patches[b.patches.length - 1].rn = rn.num;
				b.patches[b.patches.length - 1].sf = sf;
				return;
			}
			if (typeof imm === "object") throw new Error(`Bad immediate: ${ops[2]}`);
			const immN = num(imm, "immediate");
			let sh = 0;
			let imm12 = immN;
			if (ops.length === 4) {
				const { type, amount } = parseShiftAmount(ops[3], sf, false);
				if (type !== E.SHIFT_LSL || (amount !== 0 && amount !== 12)) {
					throw new Error(`${m} immediate shift must be LSL #0 or LSL #12`);
				}
				sh = amount === 12 ? 1 : 0;
			} else if (imm12 > 0xFFF && imm12 % 4096 === 0 && imm12 / 4096 <= 0xFFF) {
				// GAS-style: large aligned immediates use LSL #12 automatically
				sh = 1;
				imm12 = imm12 / 4096;
			}
			const fn = isAdd ? (setFlags ? E.addsImm : E.addImm) : (setFlags ? E.subsImm : E.subImm);
			b.emit(fn(rd.num, rn.num, imm12, sh, sf));
			return;
		}
		case "neg": {
			if (ops.length < 2 || ops.length > 3) throw new Error(`neg wants 2-3 operands, got ${ops.length}`);
			const rd = E.parseReg(ops[0]);
			const rm = E.parseReg(ops[1]);
			if (rm.sf !== rd.sf) throw new Error(`NEG width mismatch`);
			let shift = E.SHIFT_LSL, amount = 0;
			if (ops.length === 3) ({ type: shift, amount } = parseShiftAmount(ops[2], rd.sf, false));
			b.emit(E.neg(rd.num, rm.num, shift, amount, rd.sf));
			return;
		}
		case "mul": {
			needArgs(ops, 3, m);
			const rd = E.parseReg(ops[0]);
			const rn = E.parseReg(ops[1]);
			const rm = E.parseReg(ops[2]);
			if (rn.sf !== rd.sf || rm.sf !== rd.sf) throw new Error(`MUL width mismatch`);
			b.emit(E.mul(rd.num, rn.num, rm.num, rd.sf));
			return;
		}
		case "madd": {
			needArgs(ops, 4, m);
			const rd = E.parseReg(ops[0]);
			const rn = E.parseReg(ops[1]);
			const rm = E.parseReg(ops[2]);
			const ra = E.parseReg(ops[3]);
			b.emit(E.madd(rd.num, rn.num, rm.num, ra.num, rd.sf));
			return;
		}
		case "sdiv":
		case "udiv": {
			needArgs(ops, 3, m);
			const rd = E.parseReg(ops[0]);
			const rn = E.parseReg(ops[1]);
			const rm = E.parseReg(ops[2]);
			if (rn.sf !== rd.sf || rm.sf !== rd.sf) throw new Error(`${m} width mismatch`);
			b.emit(m === "sdiv" ? E.sdiv(rd.num, rn.num, rm.num, rd.sf) : E.udiv(rd.num, rn.num, rm.num, rd.sf));
			return;
		}

		// -- Logical --
		case "and":
		case "orr":
		case "eor":
		case "ands": {
			if (ops.length < 3 || ops.length > 4) throw new Error(`${m} wants 3-4 operands, got ${ops.length}`);
			const rd = E.parseReg(ops[0]);
			const rn = E.parseReg(ops[1]);
			if (rn.sf !== rd.sf) throw new Error(`${m} width mismatch`);
			const sf = rd.sf;
			const fn = { and: E.andReg, orr: E.orrReg, eor: E.eorReg, ands: E.andsReg }[m];
			const fnI = { and: E.andImm, orr: E.orrImm, eor: E.eorImm }[m];
			try {
				const rm = E.parseReg(ops[2]);
				if (rm.sf !== sf) throw new Error(`${m} width mismatch`);
				let shift = E.SHIFT_LSL, amount = 0;
				if (ops.length === 4) ({ type: shift, amount } = parseShiftAmount(ops[3], sf, true));
				b.emit(fn(rd.num, rn.num, rm.num, shift, amount, sf));
				return;
			} catch (e) {
				if (!String(e.message).startsWith("Bad register")) throw e;
				// not a register: fall through to the immediate form
			}
			if (!fnI) throw new Error(`${m} does not take an immediate`);
			const imm = parseNumber(ops[2]);
			if (typeof imm === "object") throw new Error(`Bad immediate: ${ops[2]}`);
			if (ops.length === 4) throw new Error(`${m} immediate takes no shift`);
			b.emit(fnI(rd.num, rn.num, imm, sf));
			return;
		}
		case "lsl":
		case "lsr":
		case "asr": {
			needArgs(ops, 3, m);
			const rd = E.parseReg(ops[0]);
			const rn = E.parseReg(ops[1]);
			if (rn.sf !== rd.sf) throw new Error(`${m} width mismatch`);
			const amount = num(parseNumber(ops[2]), "shift amount");
			if (typeof amount === "object") throw new Error(`Bad shift amount: ${ops[2]}`);
			b.emit(m === "lsl" ? E.lsl(rd.num, rn.num, amount, rd.sf)
				: m === "lsr" ? E.lsr(rd.num, rn.num, amount, rd.sf)
				: E.asr(rd.num, rn.num, amount, rd.sf));
			return;
		}

		// -- Comparison --
		case "cmp":
		case "cmn": {
			if (ops.length < 2 || ops.length > 3) throw new Error(`${m} wants 2-3 operands, got ${ops.length}`);
			const rn = E.parseReg(ops[0]);
			const sf = rn.sf;
			const isCmp = m === "cmp";
			try {
				const rm = E.parseReg(ops[1]);
				if (rm.sf !== sf) throw new Error(`${m} width mismatch`);
				let shift = E.SHIFT_LSL, amount = 0;
				if (ops.length === 3) ({ type: shift, amount } = parseShiftAmount(ops[2], sf, false));
				b.emit(isCmp ? E.cmpReg(rn.num, rm.num, shift, amount, sf) : E.cmnReg(rn.num, rm.num, shift, amount, sf));
				return;
			} catch (e) {
				if (!String(e.message).startsWith("Bad register")) throw e;
				// not a register: fall through to the immediate form
			}
			const imm = parseNumber(ops[1]);
			if (typeof imm === "object") throw new Error(`Bad immediate: ${ops[1]}`);
			const immN = num(imm, "immediate");
			let sh = 0;
			let imm12 = immN;
			if (ops.length === 3) {
				const { type, amount } = parseShiftAmount(ops[2], sf, false);
				if (type !== E.SHIFT_LSL || (amount !== 0 && amount !== 12)) {
					throw new Error(`${m} immediate shift must be LSL #0 or LSL #12`);
				}
				sh = amount === 12 ? 1 : 0;
			} else if (imm12 > 0xFFF && imm12 % 4096 === 0 && imm12 / 4096 <= 0xFFF) {
				sh = 1;
				imm12 = imm12 / 4096;
			}
			b.emit(isCmp ? E.cmpImm(rn.num, imm12, sh, sf) : E.cmnImm(rn.num, imm12, sh, sf));
			return;
		}
		case "tst": {
			if (ops.length < 2 || ops.length > 3) throw new Error(`tst wants 2-3 operands, got ${ops.length}`);
			const rn = E.parseReg(ops[0]);
			const sf = rn.sf;
			try {
				const rm = E.parseReg(ops[1]);
				if (rm.sf !== sf) throw new Error(`TST width mismatch`);
				let shift = E.SHIFT_LSL, amount = 0;
				if (ops.length === 3) ({ type: shift, amount } = parseShiftAmount(ops[2], sf, true));
				b.emit(E.tstReg(rn.num, rm.num, shift, amount, sf));
				return;
			} catch (e) {
				if (!String(e.message).startsWith("Bad register")) throw e;
				// not a register: fall through to the immediate form
			}
			const imm = parseNumber(ops[1]);
			if (typeof imm === "object") throw new Error(`Bad immediate: ${ops[1]}`);
			b.emit(E.tstImm(rn.num, imm, sf));
			return;
		}

		// -- Memory --
		case "ldr":
		case "str": {
			needArgs(ops, 2, m);
			const rt = E.parseReg(ops[0]);
			const memText = ops[1].trim();
			if (!memText.startsWith("[")) {
				// LDR (literal) with a label: ldr x0, mylabel
				if (m !== "ldr") throw new Error(`STR needs a memory operand`);
				const target = memText;
				if (!/^[a-zA-Z_.][\w$.]*$/.test(target)) throw new Error(`Bad LDR operand: ${ops[1]}`);
				b.emitPlaceholder("ldrLiteral", target);
				b.patches[b.patches.length - 1].rt = rt.num;
				b.patches[b.patches.length - 1].sf = rt.sf;
				return;
			}
			const mem = parseMem(memText);
			if (mem.mode !== "offset") throw new Error(`${m.toUpperCase()} (immediate) does not take ! or post-index`);
			b.emit(m === "ldr"
				? E.ldrImm(rt.num, mem.rn, mem.offset, rt.sf)
				: E.strImm(rt.num, mem.rn, mem.offset, rt.sf));
			return;
		}
		case "ldp":
		case "stp": {
			if (ops.length !== 3 && ops.length !== 4) throw new Error(`${m} wants 3 operands, got ${ops.length}`);
			const rt = E.parseReg(ops[0]);
			const rt2 = E.parseReg(ops[1]);
			if (rt2.sf !== rt.sf) throw new Error(`${m.toUpperCase()} width mismatch`);
			// post-index "[Rn], #imm" splits into two operands; rejoin
			const memText = ops.length === 4 ? ops[2] + ", " + ops[3] : ops[2];
			const mem = parseMem(memText.trim());
			b.emit(m === "ldp"
				? E.ldp(rt.num, rt2.num, mem.rn, mem.offset, rt.sf, mem.mode)
				: E.stp(rt.num, rt2.num, mem.rn, mem.offset, rt.sf, mem.mode));
			return;
		}

		// -- Control flow --
		case "b": {
			if (cond !== null) {
				needArgs(ops, 1, m);
				const target = ops[0].trim();
				if (/^[a-zA-Z_.][\w$.]*$/.test(target)) {
					b.emitPlaceholder("bcond", target);
					b.patches[b.patches.length - 1].cond = cond;
				} else {
					b.emit(E.bcond(cond, Math.trunc(num(parseNumber(target), "offset") / 4)));
				}
				return;
			}
			needArgs(ops, 1, m);
			const target = ops[0].trim();
			if (/^[a-zA-Z_.][\w$.]*$/.test(target)) b.emitPlaceholder("b", target);
			else b.emit(E.b(Math.trunc(num(parseNumber(target), "offset") / 4)));
			return;
		}
		case "bl": {
			needArgs(ops, 1, m);
			const target = ops[0].trim();
			if (/^[a-zA-Z_.][\w$.]*$/.test(target)) b.emitPlaceholder("bl", target);
			else b.emit(E.bl(Math.trunc(num(parseNumber(target), "offset") / 4)));
			return;
		}
		case "br": {
			needArgs(ops, 1, m);
			b.emit(E.br(E.parseReg(ops[0]).num));
			return;
		}
		case "blr": {
			needArgs(ops, 1, m);
			b.emit(E.blr(E.parseReg(ops[0]).num));
			return;
		}
		case "ret": {
			if (ops.length === 0) b.emit(E.ret());
			else {
				needArgs(ops, 1, m);
				b.emit(E.ret(E.parseReg(ops[0]).num));
			}
			return;
		}
		case "cbz":
		case "cbnz": {
			needArgs(ops, 2, m);
			const rt = E.parseReg(ops[0]);
			const target = ops[1].trim();
			if (/^[a-zA-Z_.][\w$.]*$/.test(target)) {
				b.emitPlaceholder(m, target);
				b.patches[b.patches.length - 1].rt = rt.num;
				b.patches[b.patches.length - 1].sf = rt.sf;
			} else {
				const off = Math.trunc(num(parseNumber(target), "offset") / 4);
				b.emit(m === "cbz" ? E.cbz(rt.num, off, rt.sf) : E.cbnz(rt.num, off, rt.sf));
			}
			return;
		}

		// -- System --
		case "svc": {
			needArgs(ops, 1, m);
			const imm = parseNumber(ops[0]);
			if (typeof imm === "object") throw new Error(`Bad SVC immediate: ${ops[0]}`);
			b.emit(E.svc(num(imm, "SVC immediate")));
			return;
		}
		case "nop": {
			needArgs(ops, 0, m);
			b.emit(E.nop());
			return;
		}

		default:
			throw new Error(`Unknown mnemonic: ${mnemonic}`);
	}
}

// --- Source parsing ----------------------------------------------------------

function parseDataValues(rawVals) {
	const parts = splitOperands(rawVals);
	const bytes = [];
	for (const part of parts) {
		const v = num(parseNumber(part), "data value");
		if (v < 0 || v > 255) throw new Error(`Data byte out of range: ${part}`);
		bytes.push(v);
	}
	return bytes;
}

/**
 * Parse ARM64 source into { builder, dataBlobs, dataLabels }.
 * dataBlobs: [{ bytes: number[], label }] in emission order.
 */
function parseSource(source) {
	const b = new Arm64Builder();
	const dataBlobs = [];   // { label, bytes }
	const dataLabels = {};  // name -> index into dataBlobs
	let section = "text";
	let dataBytes = [];
	let dataLabel = null;

	function flushData() {
		if (dataLabel !== null || dataBytes.length > 0) {
			const idx = dataBlobs.length;
			dataBlobs.push({ label: dataLabel, bytes: dataBytes });
			if (dataLabel !== null) {
				if (dataLabels[dataLabel] !== undefined) throw new Error(`Duplicate data label: ${dataLabel}`);
				dataLabels[dataLabel] = idx;
			}
			dataBytes = [];
			dataLabel = null;
		}
	}

	const lines = source.split("\n");
	for (let ln = 0; ln < lines.length; ln++) {
		const line = stripComment(lines[ln]).trim();
		if (line === "") continue;

		if (line.startsWith(".")) {
			const parts = line.split(/\s+/);
			const dir = parts[0].toLowerCase();
			if (dir === ".text" || dir === ".code") {
				flushData();
				section = "text";
			} else if (dir === ".data") {
				section = "data";
			} else if (dir === ".align") {
				const n = num(parseNumber(parts[1]), "align");
				if (section === "data") {
					while (dataBytes.length % n !== 0) dataBytes.push(0);
				}
			} else if (dir === ".globl" || dir === ".global" || dir === ".extern") {
				// accepted, ignored
			} else {
				throw new Error(`Unknown directive (line ${ln + 1}): ${line}`);
			}
			continue;
		}

		if (section === "data") {
			const dm = line.match(/^([a-zA-Z_.][\w$.]*):\s*(.*)$/);
			if (dm) {
				flushData();
				dataLabel = dm[1];
				const rest = dm[2].trim();
				if (rest !== "") {
					if (rest.startsWith('"')) {
						const sm = rest.match(/^"((?:[^"\\]|\\.)*)"$/);
						if (!sm) throw new Error(`Bad string (line ${ln + 1}): ${line}`);
						const raw = sm[1];
						for (let i = 0; i < raw.length; i++) {
							if (raw[i] === "\\" && i + 1 < raw.length) {
								const nx = raw[++i];
								if (nx === "n") dataBytes.push(10);
								else if (nx === "t") dataBytes.push(9);
								else if (nx === "0") dataBytes.push(0);
								else dataBytes.push(nx.charCodeAt(0));
							} else {
								dataBytes.push(raw.charCodeAt(i) & 0xFF);
							}
						}
						dataBytes.push(0);
					} else {
						dataBytes.push(...parseDataValues(rest));
					}
				}
				continue;
			}
			// bare continuation values
			dataBytes.push(...parseDataValues(line));
			continue;
		}

		// text section
		if (line.endsWith(":")) {
			const name = line.slice(0, -1).trim();
			if (!/^[a-zA-Z_.][\w$.]*$/.test(name)) throw new Error(`Bad label (line ${ln + 1}): ${line}`);
			b.markLabel(name);
			continue;
		}

		const sp = line.indexOf(" ");
		const tab = line.indexOf("\t");
		let cut = sp === -1 ? tab : tab === -1 ? sp : Math.min(sp, tab);
		let mnemonic, rest;
		if (cut === -1) {
			mnemonic = line.toLowerCase();
			rest = "";
		} else {
			mnemonic = line.slice(0, cut).trim().toLowerCase();
			rest = line.slice(cut + 1).trim();
		}
		const ops = rest === "" ? [] : splitOperands(rest);
		try {
			emitInstruction(b, mnemonic, ops);
		} catch (e) {
			throw new Error(`line ${ln + 1} (${line}): ${e.message}`);
		}
	}
	flushData();
	return { builder: b, dataBlobs, dataLabels };
}

// --- Patch resolution --------------------------------------------------------

/**
 * Lay out code words + data blobs, resolve label patches.
 * Returns { bytes, symbols, relocations }.
 */
function resolveAll(parsed) {
	const { builder: b, dataBlobs, dataLabels } = parsed;
	const codeSize = b.words.length * 4;

	// Data base: word-aligned right after code.
	const dataBase = codeSize;
	const dataOffsets = [];
	let cursor = dataBase;
	for (const blob of dataBlobs) {
		dataOffsets.push(cursor);
		cursor += blob.bytes.length;
	}
	const totalSize = cursor;
	const bytes = new Uint8Array(totalSize);

	const targetOffset = (name) => {
		if (b.labels[name] !== undefined) return { off: b.labels[name], code: true };
		if (dataLabels[name] !== undefined) return { off: dataOffsets[dataLabels[name]], code: false };
		throw new Error(`Undefined label: ${name}`);
	};

	const relocations = [];
	for (const p of b.patches) {
		const pc = p.wordIndex * 4;
		const t = targetOffset(p.target);
		let word;
		switch (p.kind) {
			case "b": {
				if (!t.code) throw new Error(`Branch to data label: ${p.target}`);
				word = E.b(Math.trunc((t.off - pc) / 4));
				break;
			}
			case "bl": {
				if (!t.code) throw new Error(`Branch to data label: ${p.target}`);
				word = E.bl(Math.trunc((t.off - pc) / 4));
				break;
			}
			case "cbz":
			case "cbnz": {
				if (!t.code) throw new Error(`Branch to data label: ${p.target}`);
				const off = Math.trunc((t.off - pc) / 4);
				word = p.kind === "cbz" ? E.cbz(p.rt, off, p.sf) : E.cbnz(p.rt, off, p.sf);
				break;
			}
			case "bcond": {
				if (!t.code) throw new Error(`Branch to data label: ${p.target}`);
				word = E.bcond(p.cond, Math.trunc((t.off - pc) / 4));
				break;
			}
			case "adr": {
				word = patchRd(E.adr(0, t.off - pc), p);
				break;
			}
			case "adrp": {
				const pageOff = Math.trunc(t.off / 4096) - Math.trunc(pc / 4096);
				word = patchRd(E.adrp(0, pageOff), p);
				break;
			}
			case "ldrLiteral": {
				word = E.ldrLiteral(p.rt, Math.trunc((t.off - pc) / 4), p.sf);
				break;
			}
			case "lo12": {
				const lo12 = t.off & 0xFFF;
				word = p.addSub
					? E.subImm(p.rd, p.rn, lo12, 0, p.sf)
					: E.addImm(p.rd, p.rn, lo12, 0, p.sf);
				break;
			}
			default:
				throw new Error(`Unknown patch kind: ${p.kind}`);
		}
		b.words[p.wordIndex] = word;
		relocations.push({ offset: pc, type: p.kind, target: p.target });
	}

	// Emit code words little-endian.
	for (let i = 0; i < b.words.length; i++) {
		const w = b.words[i] >>> 0;
		bytes[i * 4] = w & 0xFF;
		bytes[i * 4 + 1] = (w >> 8) & 0xFF;
		bytes[i * 4 + 2] = (w >> 16) & 0xFF;
		bytes[i * 4 + 3] = (w >> 24) & 0xFF;
	}
	// Emit data blobs.
	for (let i = 0; i < dataBlobs.length; i++) {
		bytes.set(dataBlobs[i].bytes, dataOffsets[i]);
	}

	const symbols = {};
	for (const [k, v] of Object.entries(b.labels)) symbols[k] = v;
	for (const [k, v] of Object.entries(dataLabels)) symbols[k] = dataOffsets[v];

	return { bytes, symbols, relocations };
}

/** OR the Rd field into an already-encoded word (adr/adrp placeholders record rd at emit time). */
function patchRd(word, p) {
	return word | (p.rd & 31);
}

// --- Public API --------------------------------------------------------------

/**
 * Assemble ARM64 source text into machine code.
 * @param {string} source
 * @returns {{ bytes: Uint8Array, symbols: Object, relocations: Array }}
 */
export function assemble(source) {
	const parsed = parseSource(source);
	return resolveAll(parsed);
}
