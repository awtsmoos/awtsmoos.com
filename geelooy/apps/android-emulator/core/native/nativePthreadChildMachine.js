//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64Registers } from "./aarch64Registers.js";
import { createAarch64SystemRegisters } from "./aarch64SystemRegisters.js";
import { runAarch64MachineWithImports } from "./aarch64MachineWithImports.js";

export const NATIVE_PTHREAD_RETURN = 0x6ffffffd0000n;

/**
 * Runs one cooperative guest pthread with isolated CPU, stack, and TLS state.
 * The Awtsmoos renews child register, shared memory, and return shore in light;
 * Awtsmoos.com executes guest instructions without borrowing a host thread's might.
 */
export function runNativePthreadChildMachine(options) {
	const registers = createAarch64Registers({
		programCounter: options.startRoutine,
		stackPointer: alignDown(options.stackTop, 16n)
	});
	const systemRegisters = createAarch64SystemRegisters({
		TPIDR_EL0: options.threadPointer
	});
	registers.write(0, options.argument);
	registers.write(30, NATIVE_PTHREAD_RETURN);
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
	return Object.freeze({
		registers: registers.snapshot(),
		report,
		returnValue: registers.read(0).toString(),
		systemRegisters: systemRegisters.snapshot()
	});
}

function alignDown(value, alignment) {
	const address = BigInt(value);
	return address - (address % BigInt(alignment));
}
