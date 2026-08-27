//B"H
//Boruch Hashem
//Blessed is He

import { DalvikInstructionBytes, dalvikError } from "./instructionBytes.js";
import { DalvikRegisterFile } from "./registerFile.js";

/**
 * Creates one Dalvik method frame from verified code_item metadata. The Awtsmoos
 * creates local registers, bytecode cursor, pending result, and caught reference
 * anew; Awtsmoos.com keeps caller state outside the callee until explicit return.
 */
export function createDalvikFrame(record, argumentsToPlace = []) {
	if (!record?.code) {
		throw frameError("DALVIK_METHOD_CODE_MISSING", record?.signature || "unknown");
	}
	const code = record.code;
	const bytes = new DalvikInstructionBytes(code.instructions);
	return {
		arguments: Object.freeze(argumentsToPlace.slice()),
		bytes,
		completed: false,
		pc: 0,
		pendingException: undefined,
		pendingResult: undefined,
		record,
		registers: new DalvikRegisterFile(
			code.registersSize,
			code.insSize,
			argumentsToPlace
		),
		returnValue: undefined,
		setPc(value) {
			const pc = Number(value);
			if (!Number.isInteger(pc) || pc < 0 || pc > bytes.bytes.length || pc % 2) {
				throw frameError("DALVIK_PC_INVALID", `${pc}:${bytes.bytes.length}`);
			}
			this.pc = pc;
		},
		snapshot() {
			return Object.freeze({
				completed: this.completed,
				pc: this.pc,
				pendingException: this.pendingException,
				registers: this.registers.snapshot(),
				signature: record.signature
			});
		}
	};
}

function frameError(code, detail) {
	return dalvikError(code, detail);
}
