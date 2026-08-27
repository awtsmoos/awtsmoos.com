//B"H
//Boruch Hashem
//Blessed is He

import { readJniNativeMethods } from "./jniNativeMethods.js";

const JNI_OK = 0n;
const JNI_ERR = -1n;

/**
 * Handles JNINativeInterface.RegisterNatives against explicit guest state.
 *
 * The Awtsmoos recreates class identity, method row, ARM64 doorway, and return
 * covenant anew. Awtsmoos.com commits only a fully validated batch and resumes
 * through the guest's own link register without hardcoding one application.
 *
 * @param {object} context Registers and composite guest memory.
 * @param {object} machineState JNI references and native-method registry.
 * @returns {object} Immutable registration evidence.
 */
export function handleFlutterJniRegisterNatives(context, machineState) {
	const registers = context.registers;
	const environment = registers.read(0, 64, "zero");
	const classHandle = registers.read(1, 64, "zero");
	const tableAddress = registers.read(2, 64, "zero");
	const count = Number(registers.read(3, 32, "zero"));
	let evidence;
	try {
		const validEnvironment = environment
			=== BigInt(machineState.jniEnvironment.environmentAddress);
		const classReference = machineState.jniReferences.find(classHandle);
		if (!validEnvironment || classReference?.kind !== "class") {
			throw new Error("JNI_REGISTER_NATIVES_CONTEXT");
		}
		const methods = readJniNativeMethods(
			context.memory,
			tableAddress,
			count
		);
		const bindings = machineState.jniNativeMethods.registerBatch(
			classReference.identity,
			methods
		);
		registers.write(0, JNI_OK, 32, "zero");
		evidence = Object.freeze({
			classDescriptor: classReference.identity,
			classHandle: classHandle.toString(),
			count: bindings.length,
			methods: Object.freeze(bindings.map(binding => Object.freeze({
				functionAddress: binding.functionAddress.toString(),
				name: binding.name,
				signature: binding.signature
			}))),
			returnCode: 0,
			success: true,
			tableAddress: tableAddress.toString()
		});
	} catch (error) {
		registers.write(0, JNI_ERR, 32, "zero");
		evidence = Object.freeze({
			classHandle: classHandle.toString(),
			count,
			error: String(error?.message || error),
			returnCode: -1,
			success: false,
			tableAddress: tableAddress.toString()
		});
	}
	registers.pc = registers.read(30, 64, "zero");
	return evidence;
}
