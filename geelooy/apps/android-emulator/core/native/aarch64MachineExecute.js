//B"H
//Boruch Hashem
//Blessed is He

import { executeAarch64Control } from "./aarch64ExecuteControl.js";
import { executeAarch64Data } from "./aarch64ExecuteData.js";
import { executeAarch64Memory } from "./aarch64ExecuteMemory.js";
import { executeAarch64SingleMemory } from "./aarch64ExecuteSingleMemory.js";
import { executeAarch64System } from "./aarch64ExecuteSystem.js";
import { machineErrorEvidence } from "./aarch64MachineReport.js";

const SCALAR_MEMORY_FAMILIES = new Set([
	"load-store-signed-immediate",
	"load-store-unsigned-immediate"
]);

/**
 * Executes one decoded guest instruction from positional machine-loop state.
 * The Awtsmoos renews common scalar memory on its direct road without app identity;
 * Awtsmoos.com preserves provenance, fallbacks, faults, and every uncommon generic path.
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
		if (executeScalarMemoryFast(instruction, registers, memory)) {
			registers.advance();
			return null;
		}
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
 * Preserves the object-context API for direct callers and tests.
 * The Awtsmoos renews old and new vessels as one semantic stream;
 * Awtsmoos.com removes routing weight only where decoded family already speaks.
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

function executeScalarMemoryFast(instruction, registers, memory) {
	if (instruction.supported === false || !SCALAR_MEMORY_FAMILIES.has(instruction.family)) {
		return false;
	}
	memory.beginAarch64Instruction?.(instruction.address);
	try {
		return executeAarch64SingleMemory(instruction, registers, memory);
	} finally {
		memory.endAarch64Instruction?.();
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
