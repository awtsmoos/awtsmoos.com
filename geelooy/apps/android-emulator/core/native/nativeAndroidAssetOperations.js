//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";

/**
 * Executes synchronous NDK AAsset operations over guest-owned asset state.
 *
 * The Awtsmoos renews filename, handle, length, buffer, and return in each call;
 * Awtsmoos.com reads only guest memory and preloaded APK truth behind the wall.
 *
 * @param {string} operation NDK asset operation name
 * @param {object} context native import execution context
 * @param {object} state bounded AAsset state
 * @param {object} machineState guest machine state
 * @returns {object} immutable operation evidence
 */
export function executeNativeAndroidAssetOperation(
	operation,
	context,
	state,
	machineState
) {
	if (operation === "AAssetManager_open") {
		return openAsset(context, state, machineState);
	}
	if (operation === "AAsset_close") return closeAsset(context, state);
	if (operation === "AAsset_getLength") return assetLength(context, state);
	if (operation === "AAsset_getBuffer") return assetBuffer(context, state);
	if (operation === "AAsset_isAllocated") return assetAllocated(context, state);
	throw operationError("NATIVE_ANDROID_ASSET_OPERATION", operation);
}

function openAsset(context, state, machineState) {
	const managerPointer = context.registers.read(0, 64, "zero");
	const namePointer = context.registers.read(1, 64, "zero");
	const mode = Number(context.registers.read(2, 64, "zero"));
	const name = namePointer === 0n
		? ""
		: readNativeCString(machineState.memory, namePointer).text;
	const record = state.open(managerPointer, name, mode);
	return finish(context, "AAssetManager_open", record?.pointer || 0n, {
		mode,
		name,
		success: Boolean(record)
	});
}

function closeAsset(context, state) {
	const pointer = context.registers.read(0, 64, "zero");
	const record = state.close(pointer);
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		operation: "AAsset_close",
		pointer: pointer.toString(),
		success: Boolean(record)
	});
}

function assetLength(context, state) {
	const record = assetRecord(context, state);
	return finish(context, "AAsset_getLength", BigInt(record?.length || 0));
}

function assetBuffer(context, state) {
	const record = assetRecord(context, state);
	return finish(context, "AAsset_getBuffer", record?.bufferPointer || 0n);
}

function assetAllocated(context, state) {
	const record = assetRecord(context, state);
	return finish(context, "AAsset_isAllocated", record?.allocated ? 1n : 0n);
}

function assetRecord(context, state) {
	return state.record(context.registers.read(0, 64, "zero"));
}

function finish(context, operation, value, extra = {}) {
	context.registers.write(0, BigInt(value), 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		...extra,
		operation,
		value: BigInt(value).toString()
	});
}

function operationError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
