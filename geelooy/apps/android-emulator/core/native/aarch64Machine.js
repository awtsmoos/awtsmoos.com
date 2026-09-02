//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64InstructionCache } from "./aarch64InstructionCache.js";
import { executeAarch64MachineInstruction } from "./aarch64MachineExecute.js";
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
 * Awtsmoos.com reuses decode only while guest bytes remain the same in time.
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
		const fetched = fetchInstruction(
			memory,
			registers,
			reporter,
			instructionCache,
			step
		);
		if (fetched.stop) return fetched.stop;
		const instruction = fetched.instruction;
		reporter.append(instruction);
		if (instruction.family === "unknown") {
			return reporter.stop(
				"unknown-instruction",
				registers,
				step,
				{ instruction }
			);
		}
		const executed = executeAarch64MachineInstruction({
			instruction,
			memory,
			registers,
			reporter,
			step,
			systemRegisters
		});
		if (executed) return executed;
	}
	return reporter.stop("budget", registers, instructionLimit);
}

function fetchInstruction(memory, registers, reporter, instructionCache, step) {
	try {
		const address = registers.pc;
		const word = memory.readU32(address);
		return Object.freeze({
			instruction: instructionCache.decode(address, word),
			stop: null
		});
	} catch (error) {
		return Object.freeze({
			instruction: null,
			stop: reporter.stop("memory-fault", registers, step, {
				error: machineErrorEvidence(error)
			})
		});
	}
}
