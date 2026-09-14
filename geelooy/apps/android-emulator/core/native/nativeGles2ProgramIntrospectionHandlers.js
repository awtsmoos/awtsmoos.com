//B"H
//Boruch Hashem
//Blessed be He

import { readNativeCString } from "./nativeCString.js";
import { readNativeGlesArgument, readNativeGlesSigned32 } from "./nativeGlesArguments.js";
import {
	finishNativeGlesValue,
	finishNativeGlesVoid,
	nativeGlesThreadValue,
	writeNativeGlesInt32,
	writeNativeGlesText
} from "./nativeGlesHandlerSupport.js";
import { writeNativeGlesInt32Values } from "./nativeGlesQueryMemory.js";
import {
	nativeGlesActiveAttributes,
	nativeGlesActiveUniforms,
	nativeGlesAttributeLocation
} from "./nativeGlesProgramIntrospection.js";

/** Registers GLES2 program attachment, attribute, and active-symbol introspection. */
export function registerNativeGles2ProgramIntrospectionHandlers(registry, objects) {
	registry.register("glGetAttachedShaders", context => getAttached(context, objects));
	registry.register("glGetAttribLocation", context => getAttribLocation(context, objects));
	registry.register("glGetActiveAttrib", context => getActive(context, objects, false));
	registry.register("glGetActiveUniform", context => getActive(context, objects, true));
}

/** Copies attached shader handles up to maxCount and writes the returned count. */
function getAttached(context, objects) {
	const program = Number(readNativeGlesArgument(context, 0, 32));
	const maximum = readNativeGlesSigned32(context, 1);
	const countAddress = readNativeGlesArgument(context, 2, 64);
	const shadersAddress = readNativeGlesArgument(context, 3, 64);
	const thread = nativeGlesThreadValue(context);
	const outcome = objects.program(program, thread);
	let success = outcome.success && maximum >= 0;
	if (outcome.success && maximum < 0) objects.domain.invalidValue(thread);
	const shaders = success ? [...outcome.record.attached].slice(0, maximum) : [];
	if (success && countAddress !== 0n) writeNativeGlesInt32(context.memory, countAddress, shaders.length);
	if (success && shaders.length && shadersAddress !== 0n) {
		writeNativeGlesInt32Values(context.memory, shadersAddress, shaders);
	}
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glGetAttachedShaders", program, shaders, success });
}

/** Returns an explicit or deterministic automatic linked attribute location. */
function getAttribLocation(context, objects) {
	const program = Number(readNativeGlesArgument(context, 0, 32));
	const pointer = readNativeGlesArgument(context, 1, 64);
	const name = pointer === 0n
		? ""
		: readNativeCString(context.memory, pointer, { maxBytes: 4096 }).text;
	const thread = nativeGlesThreadValue(context);
	const outcome = objects.program(program, thread);
	let location = -1;
	if (outcome.success && outcome.record.linked) {
		location = nativeGlesAttributeLocation(outcome.record, objects, thread, name);
	} else if (outcome.success) {
		objects.domain.invalidOperation(thread);
	}
	finishNativeGlesValue(context, BigInt.asUintN(32, BigInt(location)), 32);
	return Object.freeze({ location, name, operation: "glGetAttribLocation", program });
}

/** Writes one active attribute or uniform record using the GLES string/query ABI. */
function getActive(context, objects, uniform) {
	const program = Number(readNativeGlesArgument(context, 0, 32));
	const index = Number(readNativeGlesArgument(context, 1, 32));
	const capacity = readNativeGlesSigned32(context, 2);
	const lengthAddress = readNativeGlesArgument(context, 3, 64);
	const sizeAddress = readNativeGlesArgument(context, 4, 64);
	const typeAddress = readNativeGlesArgument(context, 5, 64);
	const nameAddress = readNativeGlesArgument(context, 6, 64);
	const thread = nativeGlesThreadValue(context);
	const outcome = objects.program(program, thread);
	const rows = outcome.success && outcome.record.linked
		? (uniform ? nativeGlesActiveUniforms : nativeGlesActiveAttributes)(outcome.record, objects, thread)
		: [];
	let success = outcome.success && outcome.record.linked && capacity >= 0 && index < rows.length;
	if (outcome.success && !outcome.record.linked) objects.domain.invalidOperation(thread);
	else if (outcome.success && (capacity < 0 || index >= rows.length)) objects.domain.invalidValue(thread);
	if (success) writeActive(context, rows[index], capacity, lengthAddress, sizeAddress, typeAddress, nameAddress);
	finishNativeGlesVoid(context);
	return Object.freeze({ index, operation: uniform ? "glGetActiveUniform" : "glGetActiveAttrib", program, success });
}

/** Writes name length, size, enum type, and null-terminated name. */
function writeActive(context, record, capacity, lengthAddress, sizeAddress, typeAddress, nameAddress) {
	const name = record.size > 1 ? `${record.name}[0]` : record.name;
	writeNativeGlesText(context.memory, nameAddress, capacity, name, lengthAddress);
	if (sizeAddress !== 0n) writeNativeGlesInt32(context.memory, sizeAddress, record.size);
	if (typeAddress !== 0n) writeNativeGlesInt32(context.memory, typeAddress, record.enumeration);
}
