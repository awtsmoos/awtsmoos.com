//B"H
//Boruch Hashem
//Blessed is He

import { portableCError } from "./errors.js";

/**
 * Translates x86-64-flavored portable C assembly into ARM64 (AArch64) assembly.
 * The Awtsmoos creates register, frame, call, and syscall roads anew;
 * Awtsmoos.com keeps the x86-64 emission pipeline untouched and lowers its
 * fixed line vocabulary onto X0-X7 argument registers, FP/LR frames, and
 * SVC #0 syscalls. Any line outside the known vocabulary is rejected instead
 * of guessed, so an unsupported construct can never silently miscompile.
 */

const REGISTER = Object.freeze({
	RAX: "X0",
	RBX: "X1",
	R10: "X9",
	RDI: "X0",
	RSI: "X1",
	RDX: "X2",
	RCX: "X3",
	R8: "X4",
	R9: "X5"
});

const CONDITION = Object.freeze({
	JE: "EQ",
	JNE: "NE",
	JL: "LT",
	JLE: "LE",
	JG: "GT",
	JGE: "GE"
});

const ALU = Object.freeze({
	ADD: "ADD",
	AND: "AND",
	OR: "ORR",
	SUB: "SUB",
	XOR: "EOR"
});

const LABEL = "[A-Za-z_.$][A-Za-z0-9_.$-]*";
const REGISTER_NAME = "RAX|RBX|R10|RDI|RSI|RDX|RCX|R8|R9";
const INTEGER = "-?[0-9]+|0x[0-9a-fA-F]+";
const MEM_SIZE = "QWORD|DWORD|WORD|BYTE";
const FLOAT_REG = "S[0-7]|D[0-7]";

const PATTERNS = Object.freeze({
	call: new RegExp(`^CALL (${LABEL})$`),
	indirectCall: new RegExp(`^CALL (${REGISTER_NAME})$`),
	cmp: new RegExp(`^CMP (${REGISTER_NAME}), (${REGISTER_NAME}|${INTEGER})$`),
	conditionalBranch: new RegExp(`^(JE|JNE|JL|JLE|JG|JGE) (\\$?${LABEL})$`),
	directive: /^\.(code|data)$/,
	externDirective: new RegExp(`^\\.extern (${LABEL})$`),
	frameMemory: new RegExp(`^(${MEM_SIZE}) PTR \\[(RBP|R10|RAX)(?:-([0-9]+))?\\]$`),
	jump: new RegExp(`^JMP (\\$?${LABEL})$`),
	label: new RegExp(`^(\\$?${LABEL}):$`),
	lea: new RegExp(`^LEA (RAX|R10), (${LABEL}|QWORD PTR \\[RBP-[0-9]+\\])$`),
	mov: new RegExp(`^MOV ((${MEM_SIZE}) PTR \\[[^\\]]+\\]|${REGISTER_NAME}|RBP|RSP), (.+)$`),
	// Sign-extending narrow load: MOVSX RAX, <BYTE|WORD|DWORD> PTR [...]
	movsx: new RegExp(`^MOVSX (RAX), ((?:BYTE|WORD|DWORD) PTR \\[[^\\]]+\\])$`),
	// Bit-preserving integer<->SIMD transfer: FMOV32/FMOV64 between a portable
	// integer register and an S/D register.
	fmov: new RegExp(`^FMOV(32|64) (${FLOAT_REG}|${REGISTER_NAME}), (${FLOAT_REG}|${REGISTER_NAME})$`),
	pop: new RegExp(`^POP (${REGISTER_NAME}|RBP)$`),
	push: new RegExp(`^PUSH (${REGISTER_NAME}|RBP)$`),
	scaledIntegerBinary: /^(ADD|SUB|AND|OR|XOR) (RAX|RBX), (RBX|-?[0-9]+|0x[0-9a-fA-F]+)$/,
	shift: /^(SHL|SAR) RAX, 1$/,
	subRsp: /^SUB RSP, ([0-9]+)$/
});

/**
 * Converts one x86-64 portable assembly listing into ARM64 assembly text
 * lines using the sibling ARM64 assembler syntax: uppercase mnemonics,
 * `#`-prefixed immediates, `X0`-`X7` argument registers, `FP`/`LR` frames,
 * and `SVC #0` syscalls with the syscall number in `X8`.
 */
export function translatePortableCAssemblyToArm64(lines) {
	const source = Array.isArray(lines) ? lines : String(lines).split("\n");
	const output = [];
	for (let index = 0; index < source.length; index += 1) {
		const line = source[index];
		const consumed = translateLine(line, source, index, output);
		index += consumed;
	}
	return Object.freeze(removeRedundantStackRoundTrips(output));
}

/**
 * Drops adjacent `STR Xt, [SP, #-16]!` / `LDR Xt, [SP], #16` pairs that move a
 * register to the stack and straight back. The portable emitter produces these
 * for single-argument calls (PUSH RAX followed by POP RDI, both X0); the net
 * effect is nil, so both instructions are dead.
 */
function removeRedundantStackRoundTrips(lines) {
	const result = [];
	for (let index = 0; index < lines.length; index += 1) {
		const push = String(lines[index]).match(/^STR (X\d+), \[SP, #-16\]!$/);
		const next = lines[index + 1];
		if (push && next === `LDR ${push[1]}, [SP], #16`) {
			index += 1;
			continue;
		}
		result.push(lines[index]);
	}
	return result;
}

function translateLine(line, source, index, output) {
	const text = String(line);
	if (text === "" || text.startsWith(";")) {
		output.push(text);
		return 0;
	}
	if (PATTERNS.directive.test(text)) {
		output.push(text);
		return 0;
	}
	const externDirective = text.match(PATTERNS.externDirective);
	if (externDirective) {
		output.push(`.extern ${externDirective[1]}`);
		return 0;
	}
	const label = text.match(PATTERNS.label);
	if (label) {
		output.push(`${normalizeLabel(label[1])}:`);
		return 0;
	}
	if (text === "PUSH RBP") {
		output.push("STP FP, LR, [SP, #-16]!");
		return 0;
	}
	if (text === "POP RBP") {
		output.push("LDP FP, LR, [SP], #16");
		return 0;
	}
	const push = text.match(PATTERNS.push);
	if (push) {
		output.push(`STR ${REGISTER[push[1]]}, [SP, #-16]!`);
		return 0;
	}
	const pop = text.match(PATTERNS.pop);
	if (pop) {
		output.push(`LDR ${REGISTER[pop[1]]}, [SP], #16`);
		return 0;
	}
	if (text === "SYSCALL") {
		output.push("SVC #0");
		return 0;
	}
	if (text === "RET") {
		output.push("RET");
		return 0;
	}
	const indirectCall = text.match(PATTERNS.indirectCall);
	if (indirectCall) {
		output.push(`BLR ${REGISTER[indirectCall[1]]}`);
		return 0;
	}
	const call = text.match(PATTERNS.call);
	if (call) {
		output.push(`BL ${normalizeLabel(call[1])}`);
		return 0;
	}
	if (text === "CQO") {
		return translateDivision(source, index, output);
	}
	if (text === "NEG RAX") {
		output.push("NEG X0, X0");
		return 0;
	}
	const shift = text.match(PATTERNS.shift);
	if (shift) {
		output.push(shift[1] === "SHL" ? "LSL X0, X0, #1" : "ASR X0, X0, #1");
		return 0;
	}
	if (text === "IMUL RAX, RBX") {
		output.push("MUL X0, X0, X1");
		return 0;
	}
	const alu = text.match(PATTERNS.scaledIntegerBinary);
	if (alu) {
		output.push(`${ALU[alu[1]]} ${REGISTER[alu[2]]}, ${REGISTER[alu[2]]}, ${armOperand(alu[3])}`);
		return 0;
	}
	const subRsp = text.match(PATTERNS.subRsp);
	if (subRsp) {
		translateSubStackPointer(Number(subRsp[1]), output);
		return 0;
	}
	const cmp = text.match(PATTERNS.cmp);
	if (cmp) {
		output.push(`CMP ${REGISTER[cmp[1]]}, ${armOperand(cmp[2])}`);
		return 0;
	}
	const branch = text.match(PATTERNS.conditionalBranch);
	if (branch) {
		output.push(`B.${CONDITION[branch[1]]} ${normalizeLabel(branch[2])}`);
		return 0;
	}
	const jump = text.match(PATTERNS.jump);
	if (jump) {
		output.push(`B ${normalizeLabel(jump[1])}`);
		return 0;
	}
	const lea = text.match(PATTERNS.lea);
	if (lea) {
		translateLea(lea[1], lea[2], output);
		return 0;
	}
	const fmov = text.match(PATTERNS.fmov);
	if (fmov) {
		translateFmov(fmov[1], fmov[2], fmov[3], output);
		return 0;
	}
	const movsx = text.match(PATTERNS.movsx);
	if (movsx) {
		translateMovsx(movsx[2], output);
		return 0;
	}
	const mov = text.match(PATTERNS.mov);
	if (mov) {
		return translateMov(mov[1], mov[2], mov[3], source, index, output);
	}
	if (isGlobalDataLine(text)) {
		output.push(text);
		return 0;
	}
	throw portableCError(
		"PORTABLE_C_ARM64_UNTRANSLATED",
		`ARM64 backend cannot translate portable assembly line '${text}'`
	);
}

function translateDivision(source, index, output) {
	if (source[index + 1] !== "IDIV RBX") {
		throw portableCError(
			"PORTABLE_C_ARM64_UNTRANSLATED",
			"ARM64 backend expects 'IDIV RBX' after 'CQO'"
		);
	}
	if (source[index + 2] === "MOV RAX, RDX") {
		output.push("SDIV X9, X0, X1", "MSUB X0, X9, X1, X0");
		return 2;
	}
	output.push("SDIV X0, X0, X1");
	return 1;
}

function translateSubStackPointer(bytes, output) {
	if (bytes <= 4095) {
		output.push(`SUB SP, SP, #${bytes}`);
		return;
	}
	output.push(...loadImmediate("X9", bytes), "SUB SP, SP, X9");
}

function translateLea(target, source, output) {
	const frame = source.match(/^QWORD PTR \[RBP-([0-9]+)\]$/);
	if (frame) {
		const offset = Number(frame[1]);
		if (offset <= 4095) {
			output.push(`SUB ${REGISTER[target]}, FP, #${offset}`);
		} else {
			output.push(...loadImmediate("X9", offset), `SUB ${REGISTER[target]}, FP, X9`);
		}
		return;
	}
	output.push(`ADR ${REGISTER[target]}, ${source}`);
}

function translateMov(destination, size, source, lines, index, output) {
	if (destination === "RBP" && source === "RSP") {
		output.push("MOV FP, SP");
		return 0;
	}
	if (destination === "RSP" && source === "RBP") {
		output.push("MOV SP, FP");
		return 0;
	}
	const frame = source.match(PATTERNS.frameMemory);
	const destinationFrame = destination.match(PATTERNS.frameMemory);
	if (frame && !destinationFrame) {
		translateLoad(REGISTER[destination], memSizeBytes(frame[1]), frame[2], frame[3], output);
		return 0;
	}
	if (destinationFrame && !frame) {
		translateStore(REGISTER[source], memSizeBytes(destinationFrame[1]), destinationFrame[2], destinationFrame[3], output);
		return 0;
	}
	if (REGISTER[source] && REGISTER[destination]) {
		if (REGISTER[source] === REGISTER[destination]) {
			return 0;
		}
		output.push(`MOV ${REGISTER[destination]}, ${REGISTER[source]}`);
		return 0;
	}
	if (isIntegerLiteral(source) && REGISTER[destination]) {
		if (lines[index + 1] === "SYSCALL") {
			output.push(...loadImmediate("X8", parseInteger(source)));
		} else {
			output.push(...loadImmediate(REGISTER[destination], parseInteger(source)));
		}
		return 0;
	}
	throw portableCError(
		"PORTABLE_C_ARM64_UNTRANSLATED",
		`ARM64 backend cannot translate 'MOV ${destination}, ${source}'`
	);
}

/**
 * Sign-extending narrow load into X0: MOVSX RAX, <BYTE|WORD|DWORD> PTR [...].
 * LDRSB/LDRSH/LDRSW keep C signed-char/short/int promotion exact.
 */
function translateMovsx(memory, output) {
	const parsed = memory.match(PATTERNS.frameMemory);
	if (!parsed) {
		throw portableCError(
			"PORTABLE_C_ARM64_UNTRANSLATED",
			`ARM64 backend cannot translate 'MOVSX RAX, ${memory}'`
		);
	}
	const bytes = memSizeBytes(parsed[1]);
	const base = parsed[2];
	const offset = Number(parsed[3] || 0);
	const mnemonic = bytes === 1 ? "LDURSB" : bytes === 2 ? "LDURSH" : "LDURSW";
	if (base === "RBP") {
		if (offset <= 255) {
			output.push(`${mnemonic} X0, [FP, #-${offset}]`);
			return;
		}
		output.push(...loadImmediate("X9", BigInt(offset)), "SUB X9, FP, X9", `${mnemonic.replace("LDUR", "LDR")} X0, [X9]`);
		return;
	}
	output.push(`${mnemonic.replace("LDUR", "LDR")} X0, [${REGISTER[base]}]`);
}

/**
 * Bit-preserving integer<->SIMD transfer. FMOV32 moves through W/S views,
 * FMOV64 through X/D views; the bit pattern is never interpreted.
 */
function translateFmov(width, destination, source, output) {
	const wide = width === "64";
	const armDst = simdReg(destination, wide);
	const armSrc = simdReg(source, wide);
	output.push(`FMOV ${armDst}, ${armSrc}`);
}

/** Maps a portable FMOV operand to its ARM64 register text. */
function simdReg(operand, wide) {
	if (/^S[0-7]$/.test(operand) || /^D[0-7]$/.test(operand)) return operand;
	const mapped = REGISTER[operand];
	if (!mapped) {
		throw portableCError(
			"PORTABLE_C_ARM64_UNTRANSLATED",
			`ARM64 backend cannot map FMOV register '${operand}'`
		);
	}
	// Integer side uses the W view for 32-bit transfers, X for 64-bit.
	return wide ? mapped : mapped.replace(/^X/, "W");
}

function memSizeBytes(size) {
	if (size === "BYTE") return 1;
	if (size === "WORD") return 2;
	if (size === "DWORD") return 4;
	return 8;
}

function translateLoad(target, bytes, base, offsetText, output) {
	const wide = bytes === 8 ? target : target.replace(/^X/, "W");
	if (base === "RBP") {
		translateFrameAccess(bytes, "LDUR", "LDR", wide, Number(offsetText), output);
		return;
	}
	output.push(`${bytes === 8 ? "LDR" : bytes === 4 ? "LDR" : bytes === 2 ? "LDRH" : "LDRB"} ${wide}, [${REGISTER[base]}]`);
}

function translateStore(source, bytes, base, offsetText, output) {
	const wide = bytes === 8 ? source : source.replace(/^X/, "W");
	if (base === "RBP") {
		translateFrameAccess(bytes, "STUR", "STR", wide, Number(offsetText), output);
		return;
	}
	output.push(`${bytes === 8 ? "STR" : bytes === 4 ? "STR" : bytes === 2 ? "STRH" : "STRB"} ${wide}, [${REGISTER[base]}]`);
}

function translateFrameAccess(bytes, unscaled, scaled, register, offset, output) {
	const suffix = bytes === 8 ? "" : bytes === 4 ? "" : bytes === 2 ? "H" : "B";
	if (offset <= 255) {
		output.push(`${unscaled}${suffix} ${register}, [FP, #-${offset}]`);
		return;
	}
	output.push(...loadImmediate("X9", BigInt(offset)), "SUB X9, FP, X9", `${scaled}${suffix} ${register}, [X9]`);
}

function armOperand(operand) {
	if (REGISTER[operand]) return REGISTER[operand];
	return `#${parseInteger(operand)}`;
}

function isIntegerLiteral(text) {
	return /^(-?[0-9]+|0x[0-9a-fA-F]+)$/.test(text);
}

function parseInteger(text) {
	let value;
	try {
		value = BigInt(text);
	} catch {
		throw portableCError(
			"PORTABLE_C_ARM64_INTEGER_RANGE",
			`ARM64 backend cannot encode integer literal '${text}'`
		);
	}
	if (value < -(1n << 63n) || value > (1n << 64n) - 1n) {
		throw portableCError(
			"PORTABLE_C_ARM64_INTEGER_RANGE",
			`ARM64 backend cannot encode integer literal '${text}'`
		);
	}
	return value;
}

function isGlobalDataLine(text) {
	const match = text.match(/^([A-Za-z_][A-Za-z0-9_]*): (.+)$/);
	if (!match) return false;
	return /^(-?[0-9]+(, -?[0-9]+)*|[A-Za-z_][A-Za-z0-9_]*)$/.test(match[2]);
}

function normalizeLabel(label) {
	return label.startsWith("$") ? label.slice(1) : label;
}

/**
 * Loads a 64-bit immediate into an X register with MOVZ/MOVK/MOVN.
 * Every 16-bit chunk is emitted exactly; values above 32 bits no longer
 * truncate. Negative values keep true two's-complement encoding.
 */
function loadImmediate(register, value) {
	const v = BigInt(value);
	// 32-bit fast path: the historic MOVZ/MOVN idiom, byte-exact with the
	// original backend. MOVN sign-extends through the full 64-bit register,
	// so negative 32-bit values arrive correctly widened.
	if (v >= -(1n << 31n) && v < (1n << 32n)) {
		const n = Number(v);
		if (n >= 0 && n <= 0xffff) {
			return [`MOVZ ${register}, #${n}`];
		}
		if (n >= 0) {
			const lines = [`MOVZ ${register}, #${n & 0xffff}`];
			if (n >>> 16) lines.push(`MOVK ${register}, #${(n >>> 16) & 0xffff}, LSL #16`);
			return lines;
		}
		const lines = [`MOVN ${register}, #${(~n) & 0xffff}`];
		const high = (n >>> 16) & 0xffff;
		if (high !== 0xffff) lines.push(`MOVK ${register}, #${high}, LSL #16`);
		return lines;
	}
	// Full 64-bit path: MOVZ the low chunk, MOVK every nonzero higher chunk.
	// Used for 64-bit literals and addresses the old 32-bit idiom truncated.
	const masked = v & ((1n << 64n) - 1n);
	const chunk = index => Number((masked >> BigInt(16 * index)) & 0xffffn);
	const lines = [`MOVZ ${register}, #${chunk(0)}`];
	for (let index = 1; index < 4; index += 1) {
		if (chunk(index) !== 0) {
			lines.push(`MOVK ${register}, #${chunk(index)}, LSL #${16 * index}`);
		}
	}
	return lines;
}
