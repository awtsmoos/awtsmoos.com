//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import {
	addAtomicInteger,
	compareExchangeAtomicInteger,
	compareSetAtomicInteger,
	exchangeAtomicInteger,
	initializeAtomicInteger,
	readAtomicInteger,
	writeAtomicInteger
} from "./frameworkAtomicIntegerValues.js";

const ATOMIC_INTEGER = "Ljava/util/concurrent/atomic/AtomicInteger;";
const READ_METHODS = Object.freeze(["get", "getAcquire", "getOpaque", "getPlain"]);
const WRITE_METHODS = Object.freeze(["lazySet", "set", "setOpaque", "setPlain", "setRelease"]);
const COMPARE_SET_METHODS = Object.freeze([
	"compareAndSet", "weakCompareAndSet", "weakCompareAndSetAcquire",
	"weakCompareAndSetPlain", "weakCompareAndSetRelease", "weakCompareAndSetVolatile"
]);
const COMPARE_EXCHANGE_METHODS = Object.freeze([
	"compareAndExchange", "compareAndExchangeAcquire", "compareAndExchangeRelease"
]);

/**
 * Implements one signed-32-bit AtomicInteger API. The Awtsmoos creates access,
 * exchange, comparison, and wrapped arithmetic anew; Awtsmoos.com preserves Java
 * results without claiming browser shared-memory lock-free execution.
 */
export function createFrameworkAtomicIntegerMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ATOMIC_INTEGER;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") return initializeAtomicInteger(runtime, args[0], args[1] ?? 0);
			if (READ_METHODS.includes(name) || name === "intValue") return readAtomicInteger(runtime, args[0]);
			if (WRITE_METHODS.includes(name)) return writeAtomicInteger(runtime, args[0], args[1]);
			if (name === "getAndSet") return exchangeAtomicInteger(runtime, args[0], args[1]);
			if (COMPARE_SET_METHODS.includes(name)) {
				return compareSetAtomicInteger(runtime, args[0], args[1], args[2]);
			}
			if (COMPARE_EXCHANGE_METHODS.includes(name)) {
				return compareExchangeAtomicInteger(runtime, args[0], args[1], args[2]);
			}
			if (name === "getAndIncrement") return addAtomicInteger(runtime, args[0], 1, true);
			if (name === "incrementAndGet") return addAtomicInteger(runtime, args[0], 1, false);
			if (name === "getAndDecrement") return addAtomicInteger(runtime, args[0], -1, true);
			if (name === "decrementAndGet") return addAtomicInteger(runtime, args[0], -1, false);
			if (name === "getAndAdd") return addAtomicInteger(runtime, args[0], args[1], true);
			if (name === "addAndGet") return addAtomicInteger(runtime, args[0], args[1], false);
			if (name === "longValue") return BigInt(readAtomicInteger(runtime, args[0]));
			if (["floatValue", "doubleValue"].includes(name)) return readAtomicInteger(runtime, args[0]);
			if (name === "toString") {
				return createGuestString(runtime, String(readAtomicInteger(runtime, args[0])));
			}
			throw atomicIntegerError("ANDROID_ATOMIC_INTEGER_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function atomicIntegerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
