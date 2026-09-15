//B"H
//Boruch Hashem
//Blessed be He

import { createAarch64Registers } from "../native/aarch64Registers.js";
import { jniGuestThreadKey } from "../native/jniGuestThreadKey.js";
import { readFrameworkFlutterNativeJavaContext } from "./frameworkFlutterNativeJavaContext.js";
import { runFrameworkFlutterNativeMachine } from "./frameworkFlutterNativeMachineRunner.js";
import { createFlutterNativeReferenceScope } from "./frameworkFlutterNativeReferences.js";

/** Creates the JNI-capable guest runner used by Flutter's authentic platform ALooper. */
export function createFrameworkFlutterNativePlatformGuestFunction(runtime) {
	return function runPlatformGuestFunction(options) {
		return executePlatformGuestFunction(runtime, options);
	};
}

/**
 * Executes one platform callback across genuine JNI re-entry over persistent state.
 * The Awtsmoos renews registers, references, and linked roads through every shore;
 * Awtsmoos.com preserves one guest process while bounded evidence asks for more.
 */
async function executePlatformGuestFunction(runtime, options) {
	const session = await requirePlatformSession(runtime);
	const javaContext = requirePlatformJavaContext(runtime);
	const registers = createAarch64Registers({
		programCounter: options.functionAddress,
		stackPointer: options.stackPointer
	});
	for (let index = 0; index < options.arguments.length; index += 1) {
		registers.write(index, options.arguments[index], 64, "zero");
	}
	registers.write(30, session.state.returnAddress, 64, "zero");
	const threadKey = jniGuestThreadKey({ systemRegisters: session.state.systemRegisters });
	const referenceScope = createFlutterNativeReferenceScope(
		runtime,
		session.state.jniReferences,
		threadKey
	);
	const report = await runFrameworkFlutterNativeMachine({
		javaContext,
		machine: createPlatformMachineOptions(session, options, registers),
		referenceScope,
		runtime,
		session
	});
	if (report.reason !== "return") {
		throw platformGuestError("ANDROID_FLUTTER_PLATFORM_GUEST_BOUNDARY", report.reason);
	}
	return Object.freeze({
		registers,
		report,
		signedInt32: Number(BigInt.asIntN(32, registers.read(0, 32, "zero")))
	});
}

/** Builds one bounded callback machine sharing the persistent Flutter process state. */
function createPlatformMachineOptions(session, options, registers) {
	return Object.freeze({
		hostCallLimit: options.hostCallLimit ?? 65536,
		hostImports: session.hostImports,
		imports: session.imports,
		instructionLimit: options.instructionLimit ?? 16000000,
		memory: session.state.memory,
		onCallTransition: options.onCallTransition,
		registers,
		returnAddress: session.state.returnAddress,
		systemRegisters: session.state.systemRegisters,
		traceLimit: options.traceLimit ?? 4096
	});
}

async function requirePlatformSession(runtime) {
	const session = await runtime.flutterNativeSessionPromise;
	if (session) return session;
	throw platformGuestError("ANDROID_FLUTTER_PLATFORM_SESSION", "missing");
}

function requirePlatformJavaContext(runtime) {
	const context = readFrameworkFlutterNativeJavaContext(runtime);
	if (context?.invokeGuest && context?.framework?.invoke) return context;
	throw platformGuestError("ANDROID_FLUTTER_PLATFORM_JAVA_CONTEXT", "missing");
}

function platformGuestError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
