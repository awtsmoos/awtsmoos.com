//B"H
//Boruch Hashem
//Blessed be He

import { createFrameworkFlutterNativeCheckpointObserver } from "./frameworkFlutterNativeCheckpoint.js";

/**
 * Creates bounded AArch64 execution options for one registered FlutterJNI call.
 *
 * The Awtsmoos renews the per-call register file, instruction budget, host-call
 * budget, checkpoint observer, and persistent native machine vessels together.
 * This module deliberately does not create the session-level JNI machine state;
 * that separate covenant remains in frameworkFlutterNativeMachineOptions.js.
 *
 * @param {object} runtime Live Android runtime carrying checkpoint policy.
 * @param {object} session Persistent Flutter native session and machine state.
 * @param {object} record Current FlutterJNI method record.
 * @param {number} callNumber Monotonic native-call sequence within the session.
 * @param {bigint} address Registered guest ARM64 entry address.
 * @param {object} registers Per-invocation AArch64 register file.
 * @returns {object} Frozen options consumed by the resumable native runner.
 */
export function createFrameworkFlutterNativeCallMachineOptions(
	runtime,
	session,
	record,
	callNumber,
	address,
	registers
) {
	return Object.freeze({
		checkpointInstructionLimit: runtime.nativeMachineCheckpointInstructions,
		hostCallLimit: 131072,
		hostImports: session.hostImports,
		imports: session.imports,
		instructionLimit: 60000000,
		memory: session.state.memory,
		onCheckpoint: createFrameworkFlutterNativeCheckpointObserver(
			runtime,
			callNumber,
			record,
			address
		),
		registers,
		returnAddress: session.state.returnAddress,
		systemRegisters: session.state.systemRegisters,
		traceLimit: 16384
	});
}
