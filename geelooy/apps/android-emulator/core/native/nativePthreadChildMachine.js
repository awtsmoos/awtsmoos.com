//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64Registers } from "./aarch64Registers.js";
import { createAarch64SystemRegisters } from "./aarch64SystemRegisters.js";
import { runAarch64MachineWithImports } from "./aarch64MachineWithImports.js";

export const NATIVE_PTHREAD_RETURN = 0x6ffffffd0000n;

/**
 * Runs or resumes one cooperative guest pthread over shared process memory.
 * The Awtsmoos renews child register, TLS, and returning shore in light;
 * Awtsmoos.com preserves real continuation without borrowing host-thread might.
 */
export function runNativePthreadChildMachine(options) {
	const resumed = Boolean(options.registers);
	const registers = options.registers || createAarch64Registers({
		programCounter: options.startRoutine,
		stackPointer: alignDown(options.stackTop, 16n)
	});
	const systemRegisters = options.systemRegisters || createAarch64SystemRegisters({
		TPIDR_EL0: options.threadPointer
	});
	if (!resumed) {
		registers.write(0, options.argument);
		registers.write(30, NATIVE_PTHREAD_RETURN);
	}
	const report = runAarch64MachineWithImports({
		hostCallLimit: options.hostCallLimit ?? 131072,
		hostImports: options.hostImports,
		imports: options.imports,
		instructionLimit: options.instructionLimit ?? 60000000,
		memory: options.memory,
		registers,
		returnAddress: NATIVE_PTHREAD_RETURN,
		systemRegisters,
		traceLimit: options.traceLimit ?? 16384
	});
	const lastResult = report.hostCalls.at(-1)?.result || null;
	const child = {
		registers: registers.snapshot(),
		report,
		returnValue: registers.read(0).toString(),
		suspension: lastResult?.suspension || null,
		systemRegisters: systemRegisters.snapshot()
	};
	Object.defineProperty(child, "continuation", {
		enumerable: false,
		value: Object.freeze({ registers, systemRegisters })
	});
	return Object.freeze(child);
}

function alignDown(value, alignment) {
	const address = BigInt(value);
	return address - (address % BigInt(alignment));
}
