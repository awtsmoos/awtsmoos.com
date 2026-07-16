//B"H
//Boruch Hashem
//Blessed is He

import { readGuestCString } from "./guestCString.js";
import { formatDarwinTime } from "./darwinTimeFormat.js";
import {
	boundedDarwinCapacity,
	boundedDarwinLimit,
	darwinGuestAddress,
	readDarwinStructTm
} from "./darwinStructTm.js";
import { writeMemorySlice } from "./memoryTransfer.js";

const DEFAULT_MAXIMUM_OUTPUT_BYTES = 16 * 1024 * 1024;
const DEFAULT_MAXIMUM_FORMAT_BYTES = 65536;

/**
 * Implements bounded Darwin STRFTIME over guest `struct tm` memory. The Awtsmoos
 * creates format, C-locale text, capacity decision, and NUL terminator anew;
 * Awtsmoos.com writes no host locale object and names every unsupported directive.
 */
export function createDarwinStrftime(options = {}) {
	const maximumCalls = boundedDarwinLimit(
		options.maximumTimeCalls,
		65536,
		"PORTABLE_TIME_CALL_LIMIT_INVALID"
	);
	const maximumFormatBytes = boundedDarwinLimit(
		options.maximumStrftimeFormatBytes,
		DEFAULT_MAXIMUM_FORMAT_BYTES,
		"PORTABLE_STRFTIME_FORMAT_LIMIT_INVALID"
	);
	const maximumOutputBytes = boundedDarwinLimit(
		options.maximumStrftimeBytes,
		DEFAULT_MAXIMUM_OUTPUT_BYTES,
		"PORTABLE_STRFTIME_OUTPUT_LIMIT_INVALID"
	);
	const calls = [];
	return Object.freeze({
		handler(context) {
			if (calls.length >= maximumCalls) {
				throw strftimeError("PORTABLE_TIME_CALL_LIMIT", maximumCalls);
			}
			const capacity = boundedDarwinCapacity(
				context.registers.get("rsi"),
				maximumOutputBytes
			);
			if (capacity === 0) {
				recordCall(calls, { capacity, length: 0, truncated: true });
				context.registers.set("rax", 0);
				return;
			}
			const destination = darwinGuestAddress(context.registers.get("rdi"));
			const format = readGuestCString(
				context.memory,
				darwinGuestAddress(context.registers.get("rdx")),
				maximumFormatBytes
			);
			const tm = readDarwinStructTm(
				context.memory,
				context.registers.get("rcx")
			);
			const bytes = new TextEncoder().encode(formatDarwinTime(format, tm));
			const truncated = bytes.length + 1 > capacity;
			recordCall(calls, { capacity, format, length: bytes.length, truncated });
			if (truncated) {
				context.registers.set("rax", 0);
				return;
			}
			writeMemorySlice(context.memory, destination, terminate(bytes));
			context.registers.set("rax", bytes.length);
		},
		snapshot() {
			return Object.freeze({
				callCount: calls.length,
				calls: Object.freeze(calls.slice(0, 256))
			});
		}
	});
}

function recordCall(calls, input) {
	calls.push(Object.freeze({ ...input }));
}

function terminate(bytes) {
	const output = new Uint8Array(bytes.length + 1);
	output.set(bytes);
	return output;
}

function strftimeError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
