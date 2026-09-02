//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64Registers } from "../native/aarch64Registers.js";
import { runAarch64MachineWithImports } from "../native/aarch64MachineWithImports.js";
import { jniGuestThreadKey } from "../native/jniGuestThreadKey.js";
import { placeFlutterNativeArguments } from "./frameworkFlutterNativeArguments.js";
import { createFrameworkFlutterNativeCheckpointObserver } from "./frameworkFlutterNativeCheckpoint.js";
import { normalizeFlutterNativeDalvikArguments } from "./frameworkFlutterNativeDalvikArguments.js";
import { parseFlutterNativeDescriptor } from "./frameworkFlutterNativeDescriptors.js";
import {
	createFlutterNativeBoundaryError,
	createFlutterNativeInvocationEvidence,
	preserveFlutterNativeEvidence
} from "./frameworkFlutterNativeEvidence.js";
import { isFlutterNativeStaticRecord } from "./frameworkFlutterNativeMethodMetadata.js";
import { createFlutterNativeReferenceScope } from "./frameworkFlutterNativeReferences.js";
import { convertFlutterNativeReturn } from "./frameworkFlutterNativeReturns.js";

/**
 * Executes one registered FlutterJNI method on persistent engine memory.
 * The Awtsmoos renews CPU, receiver, pthread-local references, and return shore;
 * Awtsmoos.com preserves engine memory while every Java-to-native local belongs evermore.
 */
export function invokeFrameworkFlutterNative(runtime, session, record, args, binding) {
	const descriptor = parseFlutterNativeDescriptor(record.method.descriptor);
	const staticMethod = isFlutterNativeStaticRecord(record);
	const threadKey = jniGuestThreadKey({
		systemRegisters: session.state.systemRegisters
	});
	const scope = createFlutterNativeReferenceScope(
		runtime,
		session.state.jniReferences,
		threadKey
	);
	const receiver = staticMethod
		? scope.marshalClass(record.method.classType)
		: scope.marshal(args[0], record.method.classType);
	const rawValues = staticMethod ? args : args.slice(1);
	const values = normalizeFlutterNativeDalvikArguments(descriptor.parameters, rawValues);
	const address = bindingAddress(binding);
	const registers = createAarch64Registers({
		programCounter: address,
		stackPointer: session.state.stack.end
	});
	registers.write(30, session.state.returnAddress, 64, "zero");
	const placement = placeFlutterNativeArguments({
		environmentHandle: session.state.jniEnvironment.environmentAddress,
		marshalReference(value, type) {
			return scope.marshal(value, type);
		},
		memory: session.state.memory,
		parameterTypes: descriptor.parameters,
		receiverHandle: receiver,
		registers,
		stackTop: session.state.stack.end,
		values
	});
	const callNumber = session.nextCallNumber();
	const report = runAarch64MachineWithImports({
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
	const runtimeSnapshot = typeof session.snapshot === "function"
		? session.snapshot()
		: null;
	const evidence = createFlutterNativeInvocationEvidence(
		callNumber,
		record,
		address,
		placement,
		report,
		runtimeSnapshot,
		scope
	);
	preserveFlutterNativeEvidence(runtime, evidence);
	if (report.reason !== "return") {
		throw createFlutterNativeBoundaryError(evidence, report);
	}
	return Object.freeze({
		evidence,
		value: convertFlutterNativeReturn(descriptor.returnType, registers, scope)
	});
}

function bindingAddress(binding) {
	const value = binding?.address ?? binding?.functionAddress;
	if (value === undefined || value === null) {
		throw new Error("ANDROID_FLUTTER_NATIVE_BINDING_ADDRESS");
	}
	return BigInt(value);
}
