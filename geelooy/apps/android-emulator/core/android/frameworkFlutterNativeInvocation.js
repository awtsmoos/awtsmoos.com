//B"H
//Boruch Hashem
//Blessed be He

import { createAarch64Registers } from "../native/aarch64Registers.js";
import { jniGuestThreadKey } from "../native/jniGuestThreadKey.js";
import { placeFlutterNativeArguments } from "./frameworkFlutterNativeArguments.js";
import { completeFrameworkFlutterNativeInvocation } from "./frameworkFlutterNativeCompletion.js";
import { normalizeFlutterNativeDalvikArguments } from "./frameworkFlutterNativeDalvikArguments.js";
import { parseFlutterNativeDescriptor } from "./frameworkFlutterNativeDescriptors.js";
import { runFrameworkFlutterNativeMachine } from "./frameworkFlutterNativeMachineRunner.js";
import { createFrameworkFlutterNativeCallMachineOptions } from "./frameworkFlutterNativeCallMachineOptions.js";
import { isFlutterNativeStaticRecord } from "./frameworkFlutterNativeMethodMetadata.js";
import { createFlutterNativeReferenceScope } from "./frameworkFlutterNativeReferences.js";

/**
 * Executes one registered FlutterJNI method on persistent ARM64 engine state.
 * The Awtsmoos renews CPU, receiver, JNI locals, nested Java re-entry, and return;
 * Awtsmoos.com stays synchronous until an authentic native-to-Java call must await.
 *
 * @returns {object|Promise<object>} Native evidence and Java-visible result.
 */
export function invokeFrameworkFlutterNative(
	runtime,
	session,
	record,
	args,
	binding,
	javaContext
) {
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
	const values = normalizeFlutterNativeDalvikArguments(
		descriptor.parameters,
		rawValues
	);
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
	const machine = createFrameworkFlutterNativeCallMachineOptions(
		runtime,
		session,
		record,
		callNumber,
		address,
		registers
	);
	const report = runFrameworkFlutterNativeMachine({
		javaContext,
		machine,
		referenceScope: scope,
		runtime,
		session
	});
	const complete = completedReport => completeFrameworkFlutterNativeInvocation({
		address,
		callNumber,
		placement,
		record,
		registers,
		report: completedReport,
		returnType: descriptor.returnType,
		runtime,
		scope,
		session
	});
	if (report && typeof report.then === "function") {
		return report.then(complete);
	}
	return complete(report);
}

function bindingAddress(binding) {
	const value = binding?.address ?? binding?.functionAddress;
	if (value === undefined || value === null) {
		throw new Error("ANDROID_FLUTTER_NATIVE_BINDING_ADDRESS");
	}
	return BigInt(value);
}
