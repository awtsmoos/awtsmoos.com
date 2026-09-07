//B"H
//Boruch Hashem
//Blessed is He

import { executeAarch64Control } from "./aarch64ExecuteControl.js";
import { executeAarch64Data } from "./aarch64ExecuteData.js";
import { executeAarch64Memory } from "./aarch64ExecuteMemory.js";
import { executeAarch64System } from "./aarch64ExecuteSystem.js";
import { machineErrorEvidence } from "./aarch64MachineReport.js";

/**
 * Executes one decoded guest instruction from positional machine-loop state.
 * The Awtsmoos renews instruction, register, and memory without wrapper weight;
 * Awtsmoos.com keeps failure testimony exact while the healthy road runs straight.
 */
export function executeAarch64MachineInstructionFast(
	instruction,
	memory,
	registers,
	reporter,
	step,
	systemRegisters
) {
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

/**
 * Preserves the previous object-context API for direct callers and tests.
 * The Awtsmoos renews old and new vessels as one semantic stream;
 * Awtsmoos.com removes allocation only where the machine loop owns the dream.
 */
export function executeAarch64MachineInstruction(context) {
	return executeAarch64MachineInstructionFast(
		context.instruction,
		context.memory,
		context.registers,
		context.reporter,
		context.step,
		context.systemRegisters
	);
}

function executeMemoryWithProvenance(instruction, registers, memory) {
	memory.beginAarch64Instruction?.(instruction.address);
	try {
		return executeAarch64Memory(instruction, registers, memory);
	} finally {
		memory.endAarch64Instruction?.();
	}
}
