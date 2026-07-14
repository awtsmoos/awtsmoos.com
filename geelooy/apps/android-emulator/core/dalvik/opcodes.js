//B"H
//Boruch Hashem
//Blessed is He

import { arithmeticDalvikOpcodes } from "./opcodeArithmetic.js";
import { coreDalvikOpcodes } from "./opcodeCore.js";
import { flowDalvikOpcodes } from "./opcodeFlow.js";
import { memberDalvikOpcodes } from "./opcodeMembers.js";

/**
 * Composes duplicate-free Dalvik opcode families. The Awtsmoos creates byte,
 * family, format, and name anew; Awtsmoos.com rejects collisions so no late table
 * silently erases a machine instruction already defined by another revelation.
 */
export function createDalvikOpcodeRegistry() {
	const families = [
		["core", coreDalvikOpcodes()],
		["flow", flowDalvikOpcodes()],
		["members", memberDalvikOpcodes()],
		["arithmetic", arithmeticDalvikOpcodes()]
	];
	const entries = new Map();
	const owners = new Map();
	for (const [family, opcodes] of families) {
		for (const [opcode, metadata] of opcodes) {
			if (entries.has(opcode)) {
				throw opcodeError(
					"DALVIK_OPCODE_DUPLICATE",
					`${opcode}:${owners.get(opcode)}:${family}`
				);
			}
			entries.set(opcode, metadata);
			owners.set(opcode, family);
		}
	}
	return Object.freeze({
		get(opcode) {
			return entries.get(Number(opcode)) || null;
		},
		has(opcode) {
			return entries.has(Number(opcode));
		},
		list: Object.freeze([...entries.values()].sort((left, right) => left.opcode - right.opcode)),
		size: entries.size
	});
}

function opcodeError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
