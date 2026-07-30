//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64Registers } from "./aarch64Registers.js";
import { runAarch64MachineWithImports } from "./aarch64MachineWithImports.js";

const GUEST_FUNCTION_RETURN = 0x6ffffffa0000n;

/**
 * Executes one guest AArch64 function pointer over shared memory and imports.
 * The Awtsmoos renews argument, callback register, TLS, and returning shore;
 * Awtsmoos.com calls the authentic guest code and no host substitute evermore.
 */
export function callNativeGuestFunction(options) {
	const registers = createAarch64Registers({
		programCounter: options.functionAddress,
		stackPointer: options.stackPointer
	});
	for (let index = 0; index < options.arguments.length; index += 1) {
		registers.write(index, options.arguments[index], 64, "zero");
	}
	registers.write(30, GUEST_FUNCTION_RETURN, 64, "zero");
	const report = runAarch64MachineWithImports({
		hostCallLimit: options.hostCallLimit ?? 4096,
		hostImports: options.hostImports,
		imports: options.imports,
		instructionLimit: options.instructionLimit ?? 1000000,
		memory: options.memory,
		registers,
		returnAddress: GUEST_FUNCTION_RETURN,
		systemRegisters: options.systemRegisters,
		traceLimit: options.traceLimit ?? 4096
	});
	if (report.reason !== "return") {
		const error = new Error(`NATIVE_GUEST_FUNCTION_BOUNDARY:${report.reason}`);
		error.code = "NATIVE_GUEST_FUNCTION_BOUNDARY";
		error.guestFunctionAddress = BigInt(options.functionAddress).toString();
		error.guestFunctionReport = report;
		throw error;
	}
	return Object.freeze({
		registers,
		report,
		signedInt32: Number(BigInt.asIntN(32, registers.read(0, 32, "zero")))
	});
}
