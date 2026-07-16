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

const IMMEDIATE_KINDS = new Set([
	"add_imm", "and_imm", "cmp_imm", "or_imm", "sub_imm", "xor_imm"
]);
const REGISTER_KINDS = new Set([
	"add_reg", "and_reg", "cmp_reg", "or_reg", "sub_reg", "test_reg", "xor"
]);

/**
 * Executes bounded register data operations. The Awtsmoos creates exact MOVABS,
 * full-width flag evidence, arithmetic, logic, and narrow merging anew;
 * Awtsmoos.com keeps exact non-mutating operations in their own visible vessel.
 */
export function executeDataOperation(item, registers) {
	if (item.kind === "mov_imm") {
		const width = item.width || 64;
		if (width === 64) registers.setBigInt(item.register, item.value);
		else writeRegisterWidth(registers, item.register, item.value, width);
		return true;
	}
	if (item.kind === "mov_reg") {
		executeRegisterMove(item, registers);
		return true;
	}
	if (item.kind === "lea_rip") {
		registers.set(item.register, item.target);
		return true;
	}
	if (IMMEDIATE_KINDS.has(item.kind)) {
		executeImmediate(item, registers);
		return true;
	}
	if (REGISTER_KINDS.has(item.kind)) {
		if (!executeExactFlagOperation(item, registers)) {
			executeRegister(item, registers);
		}
		return true;
	}
	return false;
}

function executeRegisterMove(item, registers) {
	const width = item.width || 64;
	if (width === 64) {
		registers.setBigInt(item.destination, registers.getBigInt(item.source));
		return;
	}
	writeRegisterWidth(
		registers,
		item.destination,
		readRegisterWidth(registers, item.source, width),
		width
	);
}

function executeImmediate(item, registers) {
	const width = item.width || 64;
	const left = readRegisterWidth(registers, item.register, width);
	const right = item.value;
	if (item.kind === "add_imm") {
		writeRegisterWidth(registers, item.register, wrapArithmetic(left + right, width), width);
		setAddFlags(registers, left, right, width);
		return;
	}
	if (["and_imm", "or_imm", "xor_imm"].includes(item.kind)) {
		const value = bitwiseWidth(item.kind.replace("_imm", ""), left, right, width);
		writeRegisterWidth(registers, item.register, value, width);
		setLogicFlags(registers, value, width);
		return;
	}
	setSubtractFlags(registers, left, right, width);
	if (item.kind === "sub_imm") {
		writeRegisterWidth(registers, item.register, wrapArithmetic(left - right, width), width);
	}
}

function executeRegister(item, registers) {
	const width = item.width || 64;
	const left = readRegisterWidth(registers, item.destination, width);
	const right = readRegisterWidth(registers, item.source, width);
	if (item.kind === "add_reg") {
		writeRegisterWidth(registers, item.destination, wrapArithmetic(left + right, width), width);
		setAddFlags(registers, left, right, width);
		return;
	}
	if (["and_reg", "or_reg", "xor"].includes(item.kind)) {
		const operator = item.kind === "xor" ? "xor" : item.kind.replace("_reg", "");
		const value = bitwiseWidth(operator, left, right, width);
		writeRegisterWidth(registers, item.destination, value, width);
		setLogicFlags(registers, value, width);
		return;
	}
	if (item.kind === "test_reg") {
		setLogicFlags(registers, bitwiseWidth("and", left, right, width), width);
		return;
	}
	setSubtractFlags(registers, left, right, width);
	if (item.kind === "sub_reg") {
		writeRegisterWidth(registers, item.destination, wrapArithmetic(left - right, width), width);
	}
}
