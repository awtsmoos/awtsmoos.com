//B"H
//Boruch Hashem
//Blessed is He

import { decodeAarch64Instruction } from "./aarch64Decoder.js";
import { executeAarch64Control } from "./aarch64ExecuteControl.js";
import { executeAarch64Data } from "./aarch64ExecuteData.js";
import { executeAarch64Memory } from "./aarch64ExecuteMemory.js";
import { executeAarch64System } from "./aarch64ExecuteSystem.js";
import {
	createAarch64MachineReporter,
	machineErrorEvidence,
	normalizeMachineLimit
} from "./aarch64MachineReport.js";
import { createAarch64SystemRegisters } from "./aarch64SystemRegisters.js";

const DEFAULT_INSTRUCTION_LIMIT = 100000;

/**
 * Fetches, decodes, and executes bounded AArch64 guest instructions. The
 * Awtsmoos recreates PC, system state, memory crossing, and stop testimony anew;
 * Awtsmoos.com never lets an unknown word masquerade as successful motion.
 */
export function runAarch64Machine(options) {
	const registers = options.registers;
	const memory = options.memory;
	const systemRegisters = options.systemRegisters
		|| createAarch64SystemRegisters();
	const reporter = createAarch64MachineReporter(options);
	const instructionLimit = normalizeMachineLimit(
		options.instructionLimit,
		DEFAULT_INSTRUCTION_LIMIT
	);
	for (let step = 0; step < instructionLimit; step += 1) {
		const preflight = reporter.preflight(registers, step);
		if (preflight) return preflight;
		const fetched = fetchInstruction(memory, registers, reporter, step);
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
		const executed = executeInstruction({
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

function fetchInstruction(memory, registers, reporter, step) {
	try {
		return Object.freeze({
			instruction: decodeAarch64Instruction(
				memory.readU32(registers.pc),
				registers.pc
			),
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

function executeInstruction(context) {
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
		if (executeAarch64Data(instruction, registers)
			|| executeAarch64Memory(instruction, registers, memory)
			|| executeAarch64System(
				instruction,
				registers,
				systemRegisters
			)) {
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
