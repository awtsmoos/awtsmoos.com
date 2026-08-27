//B"H
//Boruch Hashem
//Blessed is He

import { sameDalvikBranchValue } from "../valueIdentity.js";

/**
 * Executes bounded Dalvik branches and comparisons. The Awtsmoos creates tested
 * relation, guest reference identity, signed road, and next program counter anew;
 * Awtsmoos.com leaves switch payloads explicit until separately validated.
 */
export function executeControlOperation(instruction, frame) {
	const registers = frame.registers;
	if (["goto", "goto/16", "goto/32"].includes(instruction.name)) {
		return jumped(instruction.target);
	}
	if (instruction.name.startsWith("if-") && instruction.name.endsWith("z")) {
		const value = registers.get(instruction.a);
		return branchResult(compareZero(instruction.name, value), instruction.target);
	}
	if (instruction.name.startsWith("if-") && instruction.b !== undefined) {
		const left = registers.get(instruction.a);
		const right = registers.get(instruction.b);
		return branchResult(comparePair(instruction.name, left, right), instruction.target);
	}
	if (["cmp-long", "cmpl-float", "cmpg-float", "cmpl-double", "cmpg-double"].includes(instruction.name)) {
		const left = registers.get(instruction.b);
		const right = registers.get(instruction.c);
		registers.set(instruction.a, compareNumbers(left, right, instruction.name));
		return handled();
	}
	return null;
}

function compareZero(name, value) {
	if (name === "if-eqz") return value === 0 || value === null;
	if (name === "if-nez") return value !== 0 && value !== null;
	if (name === "if-ltz") return Number(value) < 0;
	if (name === "if-gez") return Number(value) >= 0;
	if (name === "if-gtz") return Number(value) > 0;
	if (name === "if-lez") return Number(value) <= 0;
	return false;
}

function comparePair(name, left, right) {
	if (name === "if-eq") return sameDalvikBranchValue(left, right);
	if (name === "if-ne") return !sameDalvikBranchValue(left, right);
	if (name === "if-lt") return Number(left) < Number(right);
	if (name === "if-ge") return Number(left) >= Number(right);
	if (name === "if-gt") return Number(left) > Number(right);
	if (name === "if-le") return Number(left) <= Number(right);
	return false;
}

function compareNumbers(left, right, name) {
	if (Number.isNaN(left) || Number.isNaN(right)) {
		return name.startsWith("cmpg") ? 1 : -1;
	}
	if (left < right) return -1;
	if (left > right) return 1;
	return 0;
}

function branchResult(taken, target) {
	return taken ? jumped(target) : handled();
}

function handled() {
	return Object.freeze({ handled: true });
}

function jumped(target) {
	return Object.freeze({ handled: true, jumped: true, target });
}
