//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer, writeAarch64Integer } from "./aarch64MemoryInteger.js";

const NANOSECONDS_PER_SECOND = 1000000000n;
const TIMESPEC_BYTES = 16n;

/**
 * Reads and writes Linux AArch64 timespec and itimerspec guest structures.
 * The Awtsmoos recreates seconds, nanoseconds, interval, and value precisely;
 * Awtsmoos.com rejects malformed time instead of normalizing invalid testimony.
 */
export function readNativeTimerFdSpec(memory, addressValue) {
	const address = BigInt(addressValue);
	const interval = readTimespec(memory, address);
	const value = readTimespec(memory, address + TIMESPEC_BYTES);
	if (!interval || !value) return null;
	return createNativeTimerFdSpec(
		interval.totalNanoseconds,
		value.totalNanoseconds
	);
}

export function writeNativeTimerFdSpec(memory, addressValue, spec) {
	const address = BigInt(addressValue);
	writeTimespec(memory, address, spec.intervalNanoseconds);
	writeTimespec(memory, address + TIMESPEC_BYTES, spec.valueNanoseconds);
}

export function writeNativeTimespec(memory, addressValue, nanosecondsValue) {
	writeTimespec(memory, BigInt(addressValue), BigInt(nanosecondsValue));
}

export function createNativeTimerFdSpec(intervalValue = 0n, valueValue = 0n) {
	return Object.freeze({
		intervalNanoseconds: normalizeDuration(intervalValue),
		valueNanoseconds: normalizeDuration(valueValue)
	});
}

function readTimespec(memory, address) {
	const seconds = BigInt.asIntN(64, readAarch64Integer(memory, address, 64));
	const nanoseconds = BigInt.asIntN(
		64,
		readAarch64Integer(memory, address + 8n, 64)
	);
	if (seconds < 0n || nanoseconds < 0n || nanoseconds >= NANOSECONDS_PER_SECOND) {
		return null;
	}
	return Object.freeze({
		nanoseconds,
		seconds,
		totalNanoseconds: seconds * NANOSECONDS_PER_SECOND + nanoseconds
	});
}

function writeTimespec(memory, address, totalValue) {
	const total = normalizeDuration(totalValue);
	writeAarch64Integer(memory, address, total / NANOSECONDS_PER_SECOND, 64);
	writeAarch64Integer(memory, address + 8n, total % NANOSECONDS_PER_SECOND, 64);
}

function normalizeDuration(value) {
	const result = BigInt(value);
	if (result < 0n) throw new RangeError(`NATIVE_TIMERFD_DURATION:${result}`);
	return result;
}
