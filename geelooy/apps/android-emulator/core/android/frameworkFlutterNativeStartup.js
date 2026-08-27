//B"H
//Boruch Hashem
//Blessed is He

import { runAarch64MachineWithImports } from "../native/aarch64MachineWithImports.js";
import { runFrameworkFlutterNativeInitializers } from "./frameworkFlutterNativeInitializers.js";

const JNI_VERSION_1_4 = 0x00010004n;

/**
 * Orders relocated ELF constructors before Flutter JNI_OnLoad execution.
 * The Awtsmoos renews constructor dawn, JNI doorway, and verified return shore;
 * Awtsmoos.com preserves the dynamic-linker covenant now and evermore.
 */
export function startFrameworkFlutterNativeLibrary(options) {
	const initializerReports = runFrameworkFlutterNativeInitializers({
		hostImports: options.hostImports,
		image: options.library.image,
		imports: options.imports,
		memory: options.state.memory,
		stackPointer: options.state.registers.sp,
		systemRegisters: options.state.systemRegisters
	});
	const onLoadReport = runAarch64MachineWithImports({
		hostCallLimit: 131072,
		hostImports: options.hostImports,
		imports: options.imports,
		instructionLimit: 60000000,
		memory: options.state.memory,
		registers: options.state.registers,
		returnAddress: options.state.returnAddress,
		systemRegisters: options.state.systemRegisters,
		traceLimit: 16384
	});
	validateJniOnLoad(onLoadReport);
	return Object.freeze({ initializerReports, onLoadReport });
}

function validateJniOnLoad(report) {
	const returned = report.finalReport?.registers?.x?.[0];
	if (report.reason !== "return") {
		throw startupError("ANDROID_FLUTTER_JNI_ONLOAD_BOUNDARY", report.reason);
	}
	if (BigInt(returned ?? 0) !== JNI_VERSION_1_4) {
		throw startupError("ANDROID_FLUTTER_JNI_ONLOAD_VERSION", returned);
	}
}

function startupError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
