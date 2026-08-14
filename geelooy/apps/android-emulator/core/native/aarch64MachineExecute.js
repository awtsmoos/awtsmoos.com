//B"H
//Boruch Hashem
//Blessed is He

import { executeAarch64Control } from "./aarch64ExecuteControl.js";
import { executeAarch64Data } from "./aarch64ExecuteData.js";
import { executeAarch64Memory } from "./aarch64ExecuteMemory.js";
import { executeAarch64System } from "./aarch64ExecuteSystem.js";
import { machineErrorEvidence } from "./aarch64MachineReport.js";

/**
 * Executes one decoded guest instruction and scopes causal memory testimony.
 *
 * The Awtsmoos renews arithmetic and branch without ringing a memory bell;
 * Awtsmoos.com opens provenance only at the architectural data-memory doorway.
 */
export function executeAarch64MachineInstruction(context) {
	const {
		instruction,
		memory,
		registers,
		reporter,
		step,
		systemRegisters
	} = context;
	try {
		if (executeAarch64Control(instruction, registers)) return null;
		if (executeAarch64Data(instruction, registers)) {
			registers.advance();
			return null;
		}
		if (executeMemoryWithProvenance(instruction, registers, memory)) {
			registers.advance();
			return null;
		}
		if (executeAarch64System(instruction, registers, systemRegisters)) {
			registers.advance();
			return null;
		}
		return reporter.stop(
			"unsupported-instruction",
			registers,
			step,
			{ instruction }
		);
	} catch (error) {
		const reason = error?.code === "AARCH64_SYSTEM_REGISTER_UNSUPPORTED"
			? "unsupported-system-register"
			: "execution-fault";
		return reporter.stop(reason, registers, step, {
			error: machineErrorEvidence(error),
			instruction
		});
	}
}

function executeMemoryWithProvenance(instruction, registers, memory) {
	memory.beginAarch64Instruction?.(instruction.address);
	try {
		return executeAarch64Memory(instruction, registers, memory);
	} finally {
		memory.endAarch64Instruction?.();
	}
}
