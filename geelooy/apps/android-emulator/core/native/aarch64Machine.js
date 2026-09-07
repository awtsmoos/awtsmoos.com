//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64InstructionCache } from "./aarch64InstructionCache.js";
import { executeAarch64MachineInstructionFast } from "./aarch64MachineExecute.js";
import {
	createAarch64MachineReporter,
	machineErrorEvidence,
	normalizeMachineLimit
} from "./aarch64MachineReport.js";
import { createAarch64SystemRegisters } from "./aarch64SystemRegisters.js";

const DEFAULT_INSTRUCTION_LIMIT = 100000;

/**
 * Fetches, decodes, and executes bounded AArch64 guest instructions.
 * The Awtsmoos renews every fetched word while remembered form can rhyme;
 * Awtsmoos.com keeps rich evidence at boundaries and drops healthy wrapper time.
 */
export function runAarch64Machine(options) {
	const registers = options.registers;
	const memory = options.memory;
	const systemRegisters = options.systemRegisters
		|| createAarch64SystemRegisters();
	const reporter = createAarch64MachineReporter(options);
	const instructionCache = options.instructionCache
		|| createAarch64InstructionCache();
	const instructionLimit = normalizeMachineLimit(
		options.instructionLimit,
		DEFAULT_INSTRUCTION_LIMIT
	);
	for (let step = 0; step < instructionLimit; step += 1) {
		const preflight = reporter.preflight(registers, step);
		if (preflight) return preflight;
		let instruction;
		try {
			const address = registers.pc;
			instruction = instructionCache.decode(
				address,
				memory.readU32(address)
			);
		} catch (error) {
			return reporter.stop("memory-fault", registers, step, {
				error: machineErrorEvidence(error)
			});
		}
		reporter.append(instruction);
		if (instruction.family === "unknown") {
			return reporter.stop(
				"unknown-instruction",
				registers,
				step,
				{ instruction }
			);
		}
		const executed = executeAarch64MachineInstructionFast(
			instruction,
			memory,
			registers,
			reporter,
			step,
			systemRegisters
		);
		if (executed) return executed;
	}
	return reporter.stop("budget", registers, instructionLimit);
}
