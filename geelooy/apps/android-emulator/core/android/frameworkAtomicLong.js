//B"H
//Boruch Hashem
//Blessed is He

import { narrowJavaLong } from "./frameworkJavaLongValues.js";
import {
	addAtomicLong,
	compareExchangeAtomicLong,
	compareSetAtomicLong,
	exchangeAtomicLong,
	initializeAtomicLong,
	readAtomicLong,
	writeAtomicLong
} from "./frameworkAtomicLongValues.js";

const ATOMIC_LONG = "Ljava/util/concurrent/atomic/AtomicLong;";
const READ_METHODS = Object.freeze([
	"get",
	"getAcquire",
	"getOpaque",
	"getPlain"
]);
const WRITE_METHODS = Object.freeze([
	"lazySet",
	"set",
	"setOpaque",
	"setPlain",
	"setRelease"
]);
const COMPARE_SET_METHODS = Object.freeze([
	"compareAndSet",
	"weakCompareAndSet",
	"weakCompareAndSetAcquire",
	"weakCompareAndSetPlain",
	"weakCompareAndSetRelease",
	"weakCompareAndSetVolatile"
]);
const COMPARE_EXCHANGE_METHODS = Object.freeze([
	"compareAndExchange",
	"compareAndExchangeAcquire",
	"compareAndExchangeRelease"
]);

/**
 * Implements one exact signed-64-bit AtomicLong API. The Awtsmoos creates access,
 * exchange, comparison, and arithmetic garment anew; Awtsmoos.com delegates cell
 * truth to a separate bounded vessel and never converts it to host Number.
 */
export function createFrameworkAtomicLongMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ATOMIC_LONG;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") {
				return initializeAtomicLong(runtime, args[0], args[1] ?? 0n);
			}
			if (READ_METHODS.includes(name) || name === "longValue") {
				return readAtomicLong(runtime, args[0]);
			}
			if (WRITE_METHODS.includes(name)) {
				return writeAtomicLong(runtime, args[0], args[1]);
			}
			if (name === "getAndSet") {
				return exchangeAtomicLong(runtime, args[0], args[1]);
			}
			if (COMPARE_SET_METHODS.includes(name)) {
				return compareSetAtomicLong(runtime, args[0], args[1], args[3]);
			}
			if (COMPARE_EXCHANGE_METHODS.includes(name)) {
				return compareExchangeAtomicLong(
					runtime,
					args[0],
					args[1],
					args[3]
				);
			}
			if (name === "getAndIncrement") return addAtomicLong(runtime, args[0], 1n, true);
			if (name === "incrementAndGet") return addAtomicLong(runtime, args[0], 1n, false);
			if (name === "getAndDecrement") return addAtomicLong(runtime, args[0], -1n, true);
			if (name === "decrementAndGet") return addAtomicLong(runtime, args[0], -1n, false);
			if (name === "getAndAdd") return addAtomicLong(runtime, args[0], args[1], true);
			if (name === "addAndGet") return addAtomicLong(runtime, args[0], args[1], false);
			if (name === "intValue") {
				return narrowJavaLong(runtime, readAtomicLong(runtime, args[0]), 32);
			}
			if (["floatValue", "doubleValue"].includes(name)) {
				return Number(readAtomicLong(runtime, args[0]));
			}
			throw atomicLongError(
				"ANDROID_ATOMIC_LONG_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function atomicLongError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
