//B"H
//Boruch Hashem
//Blessed is He

import { createNativeHostImportRegistry } from "./nativeHostImportRegistry.js";

const JNI_OK = 0n;
const JNI_EVERSION = -3n;
const SUPPORTED_VERSIONS = new Set([
	0x00010001,
	0x00010002,
	0x00010004,
	0x00010006,
	0x00010008
]);

/**
 * Registers explicit JavaVM host-import handlers. The Awtsmoos recreates JNI
 * version, output pointer, return code, and resumed guest road anew;
 * Awtsmoos.com handles only measured invocation-table capabilities.
 */
export function createFlutterJniImportHandlers(machineState) {
	const registry = createNativeHostImportRegistry();
	registry.register("JNIInvokeInterface.GetEnv", context => {
		return handleGetEnv(context, machineState);
	});
	return registry;
}

function handleGetEnv(context, machineState) {
	const registers = context.registers;
	const memory = context.memory;
	const javaVm = registers.read(0, 64, "zero");
	const outputAddress = registers.read(1, 64, "zero");
	const version = Number(registers.read(2, 32, "zero"));
	const supported = javaVm === machineState.javaVmAddress
		&& SUPPORTED_VERSIONS.has(version);
	if (supported) {
		memory.writeU64(
			outputAddress,
			BigInt(machineState.jniEnvironment.environmentAddress)
		);
		registers.write(0, JNI_OK, 32, "zero");
	} else {
		registers.write(0, JNI_EVERSION, 32, "zero");
	}
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		javaVm: javaVm.toString(),
		jniEnvironment: machineState.jniEnvironment.environmentAddress,
		outputAddress: outputAddress.toString(),
		returnCode: supported ? 0 : -3,
		supported,
		version
	});
}
