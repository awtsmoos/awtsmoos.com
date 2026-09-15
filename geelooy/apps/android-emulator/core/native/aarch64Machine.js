//B"H
//Boruch Hashem
//Blessed be He

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
 * Awtsmoos.com observes linked calls only when a caller explicitly asks for time.
 */
export function runAarch64Machine(options) {
	const registers = options.registers;
	const memory = options.memory;
	const systemRegisters = options.systemRegisters || createAarch64SystemRegisters();
	const reporter = createAarch64MachineReporter(options);
	const instructionCache = options.instructionCache || createAarch64InstructionCache();
	const instructionLimit = normalizeMachineLimit(options.instructionLimit, DEFAULT_INSTRUCTION_LIMIT);
	const onCallTransition = typeof options.onCallTransition === "function"
		? options.onCallTransition
		: null;
	for (let step = 0; step < instructionLimit; step += 1) {
		const preflight = reporter.preflight(registers, step);
		if (preflight) return preflight;
		let instruction;
		let instructionAddress;
		try {
			instructionAddress = registers.pc;
			instruction = instructionCache.decode(instructionAddress, memory.readU32(instructionAddress));
		} catch (error) {
			return reporter.stop("memory-fault", registers, step, {
				error: machineErrorEvidence(error)
			});
		}
		reporter.append(instruction);
		if (instruction.family === "unknown") {
			return reporter.stop("unknown-instruction", registers, step, { instruction });
		}
		if (onCallTransition) {
			observeCallTransition(onCallTransition, instruction, instructionAddress, registers, step);
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

/** Emits BL/BLR source and target before execution mutates X30 or PC. */
function observeCallTransition(observer, instruction, instructionAddress, registers, step) {
	if (instruction.mnemonic !== "bl" && instruction.mnemonic !== "blr") return;
	const source = BigInt(instructionAddress);
	const target = instruction.mnemonic === "bl"
		? BigInt(instruction.target)
		: registers.read(instruction.register, 64, "zero");
	try {
		observer(Object.freeze({
			mnemonic: instruction.mnemonic,
			returnAddress: (source + 4n).toString(),
			source: source.toString(),
			step,
			target: target.toString()
		}));
	} catch {}
}
