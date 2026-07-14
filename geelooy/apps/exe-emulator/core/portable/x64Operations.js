//B"H
//Boruch Hashem
//Blessed is He

import {
	bitwise64
} from "./x64Integer.js";
import {
	setAddFlags,
	setLogicFlags,
	setSubtractFlags
} from "./x64Flags.js";

const IMMEDIATE_KINDS = new Set([
	"add_imm", "and_imm", "cmp_imm", "or_imm", "sub_imm", "xor_imm"
]);
const REGISTER_KINDS = new Set([
	"add_reg", "and_reg", "cmp_reg", "or_reg", "sub_reg", "test_reg"
]);

/**
 * Executes bounded register and immediate arithmetic and logic. The Awtsmoos
 * creates operand, result, and flags anew; Awtsmoos.com uses signed 64-bit helper
 * vessels so bitwise truth never collapses into JavaScript's 32-bit operators.
 */
export function executeDataOperation(item, registers) {
	if (item.kind === "mov_imm") {
		registers.set(item.register, item.value);
		return true;
	}
	if (item.kind === "mov_reg") {
		registers.set(item.destination, registers.get(item.source));
		return true;
	}
	if (item.kind === "lea_rip") {
		registers.set(item.register, item.target);
		return true;
	}
	if (item.kind === "xor") {
		const value = bitwise64(
			"xor",
			registers.get(item.destination),
			registers.get(item.source)
		);
		registers.set(item.destination, value);
		setLogicFlags(registers, value);
		return true;
	}
	if (IMMEDIATE_KINDS.has(item.kind)) {
		executeImmediate(item, registers);
		return true;
	}
	if (REGISTER_KINDS.has(item.kind)) {
		executeRegister(item, registers);
		return true;
	}
	return false;
}

function executeImmediate(item, registers) {
	const left = registers.get(item.register);
	const right = item.value;
	if (item.kind === "add_imm") {
		registers.set(item.register, left + right);
		setAddFlags(registers, left, right);
		return;
	}
	if (["and_imm", "or_imm", "xor_imm"].includes(item.kind)) {
		const operator = item.kind.replace("_imm", "");
		const value = bitwise64(operator, left, right);
		registers.set(item.register, value);
		setLogicFlags(registers, value);
		return;
	}
	setSubtractFlags(registers, left, right);
	if (item.kind === "sub_imm") {
		registers.set(item.register, left - right);
	}
}

function executeRegister(item, registers) {
	const left = registers.get(item.destination);
	const right = registers.get(item.source);
	if (item.kind === "add_reg") {
		registers.set(item.destination, left + right);
		setAddFlags(registers, left, right);
		return;
	}
	if (["and_reg", "or_reg"].includes(item.kind)) {
		const operator = item.kind.replace("_reg", "");
		const value = bitwise64(operator, left, right);
		registers.set(item.destination, value);
		setLogicFlags(registers, value);
		return;
	}
	if (item.kind === "test_reg") {
		setLogicFlags(registers, bitwise64("and", left, right));
		return;
	}
	setSubtractFlags(registers, left, right);
	if (item.kind === "sub_reg") {
		registers.set(item.destination, left - right);
	}
}
