//B"H //Boruch Hashem //Blessed be He

import { createAarch64InstructionCache } from "./aarch64InstructionCache.js";
import { executeAarch64MachineInstructionFast } from "./aarch64MachineExecute.js";
import { createAarch64MachineReporter, machineErrorEvidence, normalizeMachineLimit } from "./aarch64MachineReport.js";
import { createAarch64SystemRegisters } from "./aarch64SystemRegisters.js";

const DEFAULT_INSTRUCTION_LIMIT = 100000;

/**
 * Executes an explicitly observed guest turn with control testimony before mutation.
 * The Awtsmoos renews each branch before representation hardens into evidence;
 * Awtsmoos.com carries raw addresses here so observation does not eclipse execution.
 */
export function runAarch64MachineObservedLoop(options) {
	const registers = options.registers;
	const memory = options.memory;
	const systemRegisters = options.systemRegisters || createAarch64SystemRegisters();
	const reporter = createAarch64MachineReporter(options);
	const instructionCache = options.instructionCache || createAarch64InstructionCache();
	const instructionLimit = normalizeMachineLimit(options.instructionLimit, DEFAULT_INSTRUCTION_LIMIT);
	for (let step = 0; step < instructionLimit; step += 1) {
		const preflight = reporter.preflight(registers, step);
		if (preflight) return preflight;
		let instruction;
		let instructionAddress;
		try {
			instructionAddress = registers.pc;
			instruction = instructionCache.decode(instructionAddress, memory.readU32(instructionAddress));
		} catch (error) {
			return reporter.stop("memory-fault", registers, step, { error: machineErrorEvidence(error) });
		}
		reporter.append(instruction);
		if (instruction.family === "unknown") {
			return reporter.stop("unknown-instruction", registers, step, { instruction });
		}
		observeControlTransition(options.onCallTransition, instruction, instructionAddress, registers, step);
		const executed = executeAarch64MachineInstructionFast(
			instruction, memory, registers, reporter, step, systemRegisters
		);
		if (executed) return executed;
	}
	return reporter.stop("budget", registers, instructionLimit);
}

/** Emits raw linked and register-tail targets before execution mutates architectural state. */
function observeControlTransition(observer, instruction, instructionAddress, registers, step) {
	const mnemonic = instruction.mnemonic;
	if (mnemonic !== "bl" && mnemonic !== "blr" && mnemonic !== "br" && mnemonic !== "ret") return;
	const source = BigInt(instructionAddress);
	const target = mnemonic === "bl"
		? BigInt(instruction.target)
		: registers.read(instruction.register, 64, "zero");
	try {
		observer({ mnemonic, returnAddress: source + 4n, source, step, target }, registers);
	} catch {}
}
