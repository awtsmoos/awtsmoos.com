//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { isNativeGlesBufferTarget } from "./nativeGlesBufferTargets.js";

const BUFFER_MAP_POINTER = 0x88bd;
const BUFFER_SIZE = 0x8764;
const BUFFER_MAP_LENGTH = 0x9120;
const BUFFER_MAP_OFFSET = 0x9121;

/** Registers mapped-pointer and 64-bit metadata queries for the current buffer. */
export function registerNativeGles3BufferObjectQueryHandlers(registry, vertexInput) {
	registry.register("glGetBufferPointerv", context => getPointer(context, vertexInput));
	registry.register("glGetBufferParameteri64v", context => getParameter64(context, vertexInput));
}

function getPointer(context, vertexInput) {
	const target = u32(context, 0);
	const pname = u32(context, 1);
	const destination = readNativeGlesArgument(context, 2, 64);
	const outcome = boundRecord(vertexInput, target, nativeGlesThreadValue(context));
	let success = outcome.success && pname === BUFFER_MAP_POINTER;
	if (outcome.success && !success) vertexInput.buffers.domain.invalidEnum(outcome.thread);
	const value = success ? outcome.record.mapping?.address || 0n : 0n;
	if (success) writeUint64(context.memory, destination, value);
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glGetBufferPointerv", pname, success, target, value: value.toString() });
}

function getParameter64(context, vertexInput) {
	const target = u32(context, 0);
	const pname = u32(context, 1);
	const destination = readNativeGlesArgument(context, 2, 64);
	const outcome = boundRecord(vertexInput, target, nativeGlesThreadValue(context));
	let value = outcome.success ? bufferValue(outcome.record, pname) : null;
	if (outcome.success && value === null) vertexInput.buffers.domain.invalidEnum(outcome.thread);
	if (value !== null) writeInt64(context.memory, destination, value);
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glGetBufferParameteri64v", pname, success: value !== null, target, value });
}

function boundRecord(vertexInput, target, thread) {
	const query = vertexInput.buffers.domain.prepare(thread);
	if (!query.valid) return { success: false, thread: query.thread };
	if (!isNativeGlesBufferTarget(target)) {
		vertexInput.buffers.domain.invalidEnum(query.thread);
		return { success: false, thread: query.thread };
	}
	const record = vertexInput.buffers.boundRecord(query.context, target);
	if (!record) {
		vertexInput.buffers.domain.invalidOperation(query.thread);
		return { success: false, thread: query.thread };
	}
	return { record, success: true, thread: query.thread };
}

function bufferValue(record, pname) {
	if (pname === BUFFER_SIZE) return record.bytes.length;
	if (pname === BUFFER_MAP_LENGTH) return record.mapping?.length || 0;
	if (pname === BUFFER_MAP_OFFSET) return record.mapping?.offset || 0;
	return null;
}

function u32(context, index) {
	return Number(readNativeGlesArgument(context, index, 32));
}

function writeInt64(memory, address, value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigInt64(0, BigInt(value), true);
	memory.write(address, bytes);
}

function writeUint64(memory, address, value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigUint64(0, BigInt(value), true);
	memory.write(address, bytes);
}
