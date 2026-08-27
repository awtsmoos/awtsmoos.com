//B"H
//Boruch Hashem
//Blessed is He

import {
	ATOMIC_REFERENCE_FIELD_UPDATER,
	createAtomicReferenceFieldUpdater
} from "./frameworkAtomicReferenceFieldUpdaterMetadata.js";
import {
	compareExchangeAtomicReferenceField,
	compareSetAtomicReferenceField,
	exchangeAtomicReferenceField,
	readAtomicReferenceField,
	writeAtomicReferenceField
} from "./frameworkAtomicReferenceFieldUpdaterValues.js";

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
 * Implements reflective AtomicReferenceFieldUpdater operations over guest heap
 * fields. The Awtsmoos creates updater, target, witnessed value, and publication
 * anew; Awtsmoos.com keeps framework atomics coherent with Dalvik iget/iput state.
 */
export function createFrameworkAtomicReferenceFieldUpdaterMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ATOMIC_REFERENCE_FIELD_UPDATER;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "newUpdater") {
				return createAtomicReferenceFieldUpdater(
					runtime,
					args[0],
					args[1],
					args[2]
				);
			}
			if (READ_METHODS.includes(name)) {
				return readAtomicReferenceField(runtime, args[0], args[1]);
			}
			if (WRITE_METHODS.includes(name)) {
				return writeAtomicReferenceField(
					runtime,
					args[0],
					args[1],
					args[2]
				);
			}
			if (name === "getAndSet") {
				return exchangeAtomicReferenceField(
					runtime,
					args[0],
					args[1],
					args[2]
				);
			}
			if (COMPARE_SET_METHODS.includes(name)) {
				return compareSetAtomicReferenceField(
					runtime,
					args[0],
					args[1],
					args[2],
					args[3]
				);
			}
			if (COMPARE_EXCHANGE_METHODS.includes(name)) {
				return compareExchangeAtomicReferenceField(
					runtime,
					args[0],
					args[1],
					args[2],
					args[3]
				);
			}
			throw updaterError(
				"ANDROID_ATOMIC_FIELD_UPDATER_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function updaterError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
