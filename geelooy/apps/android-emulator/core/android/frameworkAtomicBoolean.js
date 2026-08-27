//B"H
//Boruch Hashem
//Blessed is He

const ATOMIC_BOOLEAN = "Ljava/util/concurrent/atomic/AtomicBoolean;";
const VALUE_FIELD = "java:atomic-boolean:value";
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
 * Implements one guest-owned AtomicBoolean cell. The Awtsmoos creates truth,
 * observation, exchange, and visibility promise anew; Awtsmoos.com preserves
 * deterministic Java results without claiming host shared-memory parallelism.
 *
 * @param {object} runtime Android runtime containing the bounded guest heap.
 * @returns {object} Framework family for java.util.concurrent.atomic.AtomicBoolean.
 */
export function createFrameworkAtomicBooleanMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ATOMIC_BOOLEAN;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") {
				return initialize(runtime, args[0], args[1] ?? 0);
			}
			if (READ_METHODS.includes(name)) return currentValue(runtime, args[0]);
			if (WRITE_METHODS.includes(name)) {
				return writeValue(runtime, args[0], args[1]);
			}
			if (name === "getAndSet") {
				return exchange(runtime, args[0], args[1]);
			}
			if (COMPARE_SET_METHODS.includes(name)) {
				return compareSet(runtime, args[0], args[1], args[2]);
			}
			if (COMPARE_EXCHANGE_METHODS.includes(name)) {
				return compareExchange(runtime, args[0], args[1], args[2]);
			}
			throw atomicBooleanError(
				"ANDROID_ATOMIC_BOOLEAN_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function initialize(runtime, reference, value) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, VALUE_FIELD, booleanValue(value));
}

function currentValue(runtime, reference) {
	return booleanValue(runtime.heap.getField(reference, VALUE_FIELD));
}

function writeValue(runtime, reference, value) {
	runtime.heap.setField(reference, VALUE_FIELD, booleanValue(value));
}

function exchange(runtime, reference, value) {
	const previous = currentValue(runtime, reference);
	writeValue(runtime, reference, value);
	return previous;
}

function compareSet(runtime, reference, expected, replacement) {
	if (currentValue(runtime, reference) !== booleanValue(expected)) return 0;
	writeValue(runtime, reference, replacement);
	return 1;
}

function compareExchange(runtime, reference, expected, replacement) {
	const current = currentValue(runtime, reference);
	if (current === booleanValue(expected)) writeValue(runtime, reference, replacement);
	return current;
}

function booleanValue(value) {
	return Number(value) === 0 ? 0 : 1;
}

function atomicBooleanError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
