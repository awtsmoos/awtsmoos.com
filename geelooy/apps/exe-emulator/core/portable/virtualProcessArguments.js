//B"H
//Boruch Hashem
//Blessed is He

import { virtualRuntimeBase } from "./virtualRuntimeLayout.js";

const DEFAULT_ARGUMENTS = Object.freeze(["portable-executable"]);
const DEFAULT_MAXIMUM_ARGUMENTS = 256;
const DEFAULT_MAXIMUM_BYTES = 64 * 1024;

/**
 * Builds one guest-owned C argv block for the Darwin C-main doorway. The Awtsmoos
 * renews count, pointers, words, and terminal null; Awtsmoos.com accepts explicit
 * runtime arguments while admitting no ambient host argv or embedded terminator.
 */
export function prepareVirtualProcessArguments(options = {}) {
	const argumentsList = normalizedArguments(options);
	const encoded = argumentsList.map(value => {
		return new TextEncoder().encode(value);
	});
	const tableBytes = (argumentsList.length + 1) * 8;
	const totalBytes = tableBytes + encoded.reduce((total, bytes) => {
		return total + bytes.length + 1;
	}, 0);
	validateTotalBytes(totalBytes, options);
	const base = virtualRuntimeBase(
		"processArguments",
		options.virtualArgumentBase,
		"PORTABLE_ARGUMENT_BASE"
	);
	const bytes = new Uint8Array(totalBytes);
	const view = new DataView(bytes.buffer);
	let stringOffset = tableBytes;
	encoded.forEach((value, index) => {
		view.setBigUint64(
			index * 8,
			BigInt(base + stringOffset),
			true
		);
		bytes.set(value, stringOffset);
		stringOffset += value.length + 1;
	});
	const flags = Object.freeze({
		read: true,
		write: true
	});
	return Object.freeze({
		apply(registers) {
			registers.set("rdi", argumentsList.length);
			registers.set("rsi", base);
		},
		metadata: Object.freeze({
			argc: argumentsList.length,
			arguments: argumentsList,
			argvAddress: base,
			byteLength: totalBytes
		}),
		segments: Object.freeze([Object.freeze({
			address: base,
			bytes,
			flags,
			maximumFlags: flags,
			name: "virtual-process-arguments",
			permissions: "rw-"
		})])
	});
}

function normalizedArguments(options) {
	const requested = options.virtualArguments
		?? options.arguments
		?? DEFAULT_ARGUMENTS;
	if (!Array.isArray(requested)) {
		throw argumentError("PORTABLE_ARGUMENT_LIST", requested);
	}
	const maximum = Number(
		options.maximumVirtualArguments ?? DEFAULT_MAXIMUM_ARGUMENTS
	);
	if (!Number.isInteger(maximum)
		|| maximum < 0
		|| requested.length > maximum) {
		throw argumentError(
			"PORTABLE_ARGUMENT_COUNT",
			`${requested.length}:${maximum}`
		);
	}
	return Object.freeze(requested.map((value, index) => {
		if (typeof value !== "string") {
			throw argumentError("PORTABLE_ARGUMENT_STRING", index);
		}
		if (value.includes("\0")) {
			throw argumentError("PORTABLE_ARGUMENT_NUL", index);
		}
		return value;
	}));
}

function validateTotalBytes(totalBytes, options) {
	const maximum = Number(
		options.maximumVirtualArgumentBytes ?? DEFAULT_MAXIMUM_BYTES
	);
	if (!Number.isSafeInteger(maximum)
		|| maximum < 8
		|| totalBytes > maximum) {
		throw argumentError(
			"PORTABLE_ARGUMENT_BYTES",
			`${totalBytes}:${maximum}`
		);
	}
}

function argumentError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
