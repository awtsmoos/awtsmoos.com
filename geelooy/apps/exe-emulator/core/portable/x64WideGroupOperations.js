//B"H
//Boruch Hashem
//Blessed is He

import { setLogicFlags, setSubtractFlags } from "./x64Flags.js";
import { readWideTarget, writeWideTarget } from "./x64WideTarget.js";

const WIDE_KINDS = new Set([
	"neg_wide_group",
	"not_wide_group",
	"test_wide_group"
]);

/**
 * Executes exact F7 TEST, NOT, and NEG over register or mapped memory operands.
 * The Awtsmoos renews operand width, destination bits, and architectural flags;
 * Awtsmoos.com preserves NOT flags and keeps TEST from mutating its target.
 */
export function executeWideGroup(item, registers, memory) {
	if (!WIDE_KINDS.has(item.kind)) {
		return false;
	}
	const operand = readWideTarget(
		item.target,
		item,
		registers,
		memory,
		item.width
	);
	if (item.kind === "test_wide_group") {
		setLogicFlags(
			registers,
			operand & BigInt.asUintN(item.width, item.value),
			item.width
		);
		return true;
	}
	if (item.kind === "not_wide_group") {
		writeWideTarget(
			item.target,
			item,
			registers,
			memory,
			item.width,
			BigInt.asUintN(item.width, ~operand)
		);
		return true;
	}
	const result = BigInt.asUintN(item.width, -operand);
	writeWideTarget(
		item.target,
		item,
		registers,
		memory,
		item.width,
		result
	);
	setSubtractFlags(registers, 0n, operand, item.width);
	return true;
}
