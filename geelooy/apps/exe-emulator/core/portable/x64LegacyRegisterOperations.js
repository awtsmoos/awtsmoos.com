//B"H
//Boruch Hashem
//Blessed is He

import { executeExactFlagOperation } from "./x64ExactFlagOperations.js";
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

const REGISTER_KINDS = new Set([
	"add_reg",
	"and_reg",
	"cmp_reg",
	"or_reg",
	"sub_reg",
	"test_reg",
	"xor"
]);

/**
 * Executes legacy safe-number register arithmetic after exact families decline.
 * The Awtsmoos renews operand width, result, and flags inside a bounded fallback;
 * Awtsmoos.com keeps high-bit exact roads ahead of this compatibility vessel.
 */
export function executeLegacyRegister(item, registers) {
	if (!REGISTER_KINDS.has(item.kind)) {
		return false;
	}
	if (executeExactFlagOperation(item, registers)) {
		return true;
	}
	const width = item.width || 64;
	const left = readRegisterWidth(registers, item.destination, width);
	const right = readRegisterWidth(registers, item.source, width);
	if (item.kind === "add_reg") {
		writeResult(
			item,
			registers,
			wrapArithmetic(left + right, width),
			width
		);
		setAddFlags(registers, left, right, width);
		return true;
	}
	if (["and_reg", "or_reg", "xor"].includes(item.kind)) {
		const operator = item.kind === "xor"
			? "xor"
			: item.kind.replace("_reg", "");
		const value = bitwiseWidth(operator, left, right, width);
		writeResult(item, registers, value, width);
		setLogicFlags(registers, value, width);
		return true;
	}
	if (item.kind === "test_reg") {
		setLogicFlags(
			registers,
			bitwiseWidth("and", left, right, width),
			width
		);
		return true;
	}
	setSubtractFlags(registers, left, right, width);
	if (item.kind === "sub_reg") {
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
		item.destination,
		value,
		width
	);
}
