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

const PATTERNS = Object.freeze({
	call: new RegExp(`^CALL (${LABEL})$`),
	cmp: new RegExp(`^CMP (${REGISTER_NAME}), (${REGISTER_NAME}|${INTEGER})$`),
	conditionalBranch: new RegExp(`^(JE|JNE|JL|JLE|JG|JGE) (\\$?${LABEL})$`),
	directive: /^\.(code|data)$/,
	frameMemory: /^QWORD PTR \[(RBP|R10|RAX)(?:-([0-9]+))?\]$/,
	jump: new RegExp(`^JMP (\\$?${LABEL})$`),
	label: new RegExp(`^(\\$?${LABEL}):$`),
	lea: new RegExp(`^LEA (RAX|R10), (${LABEL}|QWORD PTR \\[RBP-[0-9]+\\])$`),
	mov: new RegExp(`^MOV (${REGISTER_NAME}|RBP|RSP|QWORD PTR \\[[^\\]]+\\]), (.+)$`),
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
	const mov = text.match(PATTERNS.mov);
	if (mov) {
		return translateMov(mov[1], mov[2], source, index, output);
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

function translateMov(destination, source, lines, index, output) {
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
		translateLoad(REGISTER[destination], frame[1], frame[2], output);
		return 0;
	}
	if (destinationFrame && !frame) {
		translateStore(REGISTER[source], destinationFrame[1], destinationFrame[2], output);
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

function translateLoad(target, base, offsetText, output) {
	if (base === "RBP") {
		translateFrameAccess("LDUR", "LDR", target, Number(offsetText), output);
		return;
	}
	output.push(`LDR ${target}, [${REGISTER[base]}]`);
}

function translateStore(source, base, offsetText, output) {
	if (base === "RBP") {
		translateFrameAccess("STUR", "STR", source, Number(offsetText), output);
		return;
	}
	output.push(`STR ${source}, [${REGISTER[base]}]`);
}

function translateFrameAccess(unscaled, scaled, register, offset, output) {
	if (offset <= 255) {
		output.push(`${unscaled} ${register}, [FP, #-${offset}]`);
		return;
	}
	output.push(...loadImmediate("X9", offset), "SUB X9, FP, X9", `${scaled} ${register}, [X9]`);
}

function armOperand(operand) {
	if (REGISTER[operand]) return REGISTER[operand];
	return `#${parseInteger(operand)}`;
}

function isIntegerLiteral(text) {
	return /^(-?[0-9]+|0x[0-9a-fA-F]+)$/.test(text);
}

function parseInteger(text) {
	const value = Number(text);
	if (!Number.isSafeInteger(value)) {
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
 * Loads a signed 32-bit immediate into an X register with MOVZ/MOVK/MOVN.
 * Negative values keep true sign extension into the upper 32 bits.
 */
function loadImmediate(register, value) {
	if (value >= 0 && value <= 0xffff) {
		return [`MOVZ ${register}, #${value}`];
	}
	if (value >= 0) {
		const lines = [`MOVZ ${register}, #${value & 0xffff}`];
		if (value >>> 16) lines.push(`MOVK ${register}, #${(value >>> 16) & 0xffff}, LSL #16`);
		return lines;
	}
	const lines = [`MOVN ${register}, #${(~value) & 0xffff}`];
	const high = (value >>> 16) & 0xffff;
	if (high !== 0xffff) lines.push(`MOVK ${register}, #${high}, LSL #16`);
	return lines;
}
