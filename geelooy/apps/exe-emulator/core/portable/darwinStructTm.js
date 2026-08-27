//B"H
//Boruch Hashem
//Blessed is He

import { readGuestCString } from "./guestCString.js";

/**
 * Reads the Darwin x86-64 `struct tm` ABI from permissioned guest memory. The
 * Awtsmoos creates field, exact offset, zone pointer, and validated number anew;
 * Awtsmoos.com preserves the guest layout without exposing host Date state.
 */
export function readDarwinStructTm(memory, address) {
	const pointer = darwinGuestAddress(address);
	const zonePointer = safeBigIntAddress(memory.u64BigInt(pointer + 48));
	return Object.freeze({
		gmtOffset: safeBigIntNumber(memory.i64BigInt(pointer + 40)),
		hour: memory.i32(pointer + 8),
		isDst: memory.i32(pointer + 32),
		minute: memory.i32(pointer + 4),
		month: memory.i32(pointer + 16),
		monthDay: memory.i32(pointer + 12),
		second: memory.i32(pointer),
		weekDay: memory.i32(pointer + 24),
		year: memory.i32(pointer + 20),
		yearDay: memory.i32(pointer + 28),
		zone: zonePointer ? readGuestCString(memory, zonePointer, 128) : "UTC"
	});
}

export function darwinGuestAddress(value) {
	const address = Number(value);
	if (!Number.isSafeInteger(address) || address <= 0) {
		throw darwinTimeError("PORTABLE_TIME_POINTER", value);
	}
	return address;
}

export function boundedDarwinCapacity(value, maximum) {
	const capacity = Number(value);
	if (!Number.isSafeInteger(capacity) || capacity < 0 || capacity > maximum) {
		throw darwinTimeError("PORTABLE_STRFTIME_CAPACITY", value);
	}
	return capacity;
}

export function boundedDarwinLimit(value, fallback, code) {
	const number = Number(value ?? fallback);
	if (!Number.isSafeInteger(number) || number < 1) {
		throw darwinTimeError(code, value);
	}
	return number;
}

function safeBigIntAddress(value) {
	if (value === 0n) return 0;
	const address = Number(value);
	if (!Number.isSafeInteger(address) || BigInt(address) !== value) {
		throw darwinTimeError("PORTABLE_TIME_POINTER", value);
	}
	return address;
}

function safeBigIntNumber(value) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || BigInt(number) !== value) {
		throw darwinTimeError("PORTABLE_TIME_OFFSET", value);
	}
	return number;
}

function darwinTimeError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
