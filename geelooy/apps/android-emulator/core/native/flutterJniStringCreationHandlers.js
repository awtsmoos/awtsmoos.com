//B"H
//Boruch Hashem
//Blessed be He

import { elf64Error } from "./elf64Errors.js";

const JAVA_STRING_DESCRIPTOR = "Ljava/lang/String;";
const MAXIMUM_STRING_UNITS = 16 * 1024 * 1024;
const UNIT_CHUNK_SIZE = 4096;

/**
 * Registers JNI constructors that turn guest-owned UTF-16 into Java string refs.
 *
 * `NewString` preserves every 16-bit Java code unit exactly, including embedded NUL
 * and unpaired surrogate values. Each call creates a fresh local JNI identity owned
 * by the active JNI thread; equal text therefore never fabricates object identity.
 *
 * @param {object} registry Native host-import registry receiving JNI slot handlers.
 * @param {object} machineState Persistent JNI memory, references, and TLS state.
 * @returns {object} The same registry for fluent registration composition.
 */
export function registerFlutterJniStringCreationHandlers(registry, machineState) {
	let sequence = 0;
	registry.register("JNINativeInterface.NewString", context => {
		sequence += 1;
		return createUtf16String(context, machineState, sequence);
	});
	return registry;
}

/** Creates one fresh local JNI string reference from guest jchar memory. */
function createUtf16String(context, machineState, sequence) {
	validateEnvironment(context.registers, machineState);
	const address = context.registers.read(1, 64, "zero");
	const rawLength = context.registers.read(2, 32, "zero");
	const length = Number(BigInt.asIntN(32, rawLength));
	validateLength(address, length);
	const value = readUtf16Units(context.memory, address, length);
	const threadKey = readThreadKey(machineState);
	const handle = machineState.jniReferences.create(
		"string",
		`jni-new-string:${sequence}`,
		value,
		{
			descriptor: JAVA_STRING_DESCRIPTOR,
			operation: "NewString",
			scope: "local"
		},
		threadKey
	);
	context.registers.write(0, handle, 64, "zero");
	resume(context.registers);
	return Object.freeze({
		handle: handle.toString(),
		length,
		operation: "NewString",
		thread: threadKey.toString()
	});
}

/** Reads bounded little-endian jchar units without normalizing Java text. */
function readUtf16Units(memory, address, length) {
	if (length === 0) return "";
	const bytes = memory.read(address, length * 2);
	let value = "";
	for (let start = 0; start < length; start += UNIT_CHUNK_SIZE) {
		const end = Math.min(length, start + UNIT_CHUNK_SIZE);
		const units = [];
		for (let index = start; index < end; index += 1) {
			const byteOffset = index * 2;
			units.push(bytes[byteOffset] | (bytes[byteOffset + 1] << 8));
		}
		value += String.fromCharCode(...units);
	}
	return value;
}

/** Rejects impossible JNI lengths and nonempty strings with a null jchar source. */
function validateLength(address, length) {
	if (!Number.isInteger(length) || length < 0 || length > MAXIMUM_STRING_UNITS) {
		throw elf64Error("JNI_NEW_STRING_LENGTH", String(length));
	}
	if (length > 0 && BigInt(address) === 0n) {
		throw elf64Error("JNI_NEW_STRING_NULL", String(length));
	}
}

/** Validates that the call arrived through this machine's real JNIEnv pointer. */
function validateEnvironment(registers, machineState) {
	const actual = registers.read(0, 64, "zero");
	const expected = BigInt(machineState.jniEnvironment.environmentAddress);
	if (actual !== expected) {
		throw elf64Error("JNI_STRING_ENVIRONMENT", actual.toString());
	}
}

/** Resolves the active JNI thread/TLS owner for local-reference frame lifetime. */
function readThreadKey(machineState) {
	try {
		return BigInt(machineState.systemRegisters?.read("TPIDR_EL0") || 0n);
	} catch {
		return 0n;
	}
}

/** Returns from the JNI import to the authentic guest link register. */
function resume(registers) {
	registers.pc = registers.read(30, 64, "zero");
}
