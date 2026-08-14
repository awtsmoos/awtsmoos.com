//B"H
//Boruch Hashem
//Blessed is He

import {
	setAddFlags,
	setLogicFlags,
	setSubtractFlags
} from "./x64Flags.js";
import {
	bitwiseWidth,
	readRegisterWidth,
	wrapArithmetic,
	writeRegisterWidth
} from "./x64Width.js";

const IMMEDIATE_KINDS = new Set([
	"add_imm",
	"and_imm",
	"cmp_imm",
	"or_imm",
	"sub_imm",
	"xor_imm"
]);

/**
 * Executes legacy safe-number immediate arithmetic after exact families decline.
 * The Awtsmoos renews operand width, wrapped result, and visible arithmetic flags;
 * Awtsmoos.com keeps this compatibility road separate from exact register movement.
 */
export function executeLegacyImmediate(item, registers) {
	if (!IMMEDIATE_KINDS.has(item.kind)) {
		return false;
	}
	const width = item.width || 64;
	const left = readRegisterWidth(registers, item.register, width);
	const right = item.value;
	if (item.kind === "add_imm") {
		writeResult(
			item,
			registers,
			wrapArithmetic(left + right, width),
			width
		);
		setAddFlags(registers, left, right, width);
		return true;
	}
	if (["and_imm", "or_imm", "xor_imm"].includes(item.kind)) {
		const value = bitwiseWidth(
			item.kind.replace("_imm", ""),
			left,
			right,
			width
		);
		writeResult(item, registers, value, width);
		setLogicFlags(registers, value, width);
		return true;
	}
	setSubtractFlags(registers, left, right, width);
	if (item.kind === "sub_imm") {
		writeResult(
			item,
			registers,
			wrapArithmetic(left - right, width),
			width
		);
	}
	return true;
}

function writeResult(item, registers, value, width) {
	writeRegisterWidth(
		registers,
		item.register,
		value,
		width
	);
}
