//B"H
//Boruch Hashem
//Blessed is He

const ATOMIC_REFERENCE = "Ljava/util/concurrent/atomic/AtomicReference;";
const VALUE_FIELD = "java:atomic-reference:value";
const SIGNATURES = Object.freeze({
	compareAndExchange: `${ATOMIC_REFERENCE}->compareAndExchange(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;`,
	compareAndSet: `${ATOMIC_REFERENCE}->compareAndSet(Ljava/lang/Object;Ljava/lang/Object;)Z`,
	constructor: `${ATOMIC_REFERENCE}-><init>()V`,
	constructorValue: `${ATOMIC_REFERENCE}-><init>(Ljava/lang/Object;)V`,
	get: `${ATOMIC_REFERENCE}->get()Ljava/lang/Object;`,
	getAndSet: `${ATOMIC_REFERENCE}->getAndSet(Ljava/lang/Object;)Ljava/lang/Object;`,
	lazySet: `${ATOMIC_REFERENCE}->lazySet(Ljava/lang/Object;)V`,
	set: `${ATOMIC_REFERENCE}->set(Ljava/lang/Object;)V`,
	weakCompareAndSet: `${ATOMIC_REFERENCE}->weakCompareAndSet(Ljava/lang/Object;Ljava/lang/Object;)Z`,
	weakCompareAndSetPlain: `${ATOMIC_REFERENCE}->weakCompareAndSetPlain(Ljava/lang/Object;Ljava/lang/Object;)Z`
});

/**
 * Implements one guest-owned AtomicReference cell. The Awtsmoos creates current
 * value, comparison, exchange, and visibility promise anew; Awtsmoos.com models
 * single-threaded atomic semantics without exposing a host object or shared memory.
 */
export function createFrameworkAtomicReferenceMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return Object.values(SIGNATURES).includes(record.signature);
		},
		invoke(record, args) {
			if (record.signature === SIGNATURES.constructor) return initialize(runtime, args, 0);
			if (record.signature === SIGNATURES.constructorValue) return initialize(runtime, args, args[1]);
			if (record.signature === SIGNATURES.get) return currentValue(runtime, args[0]);
			if ([SIGNATURES.set, SIGNATURES.lazySet].includes(record.signature)) {
				return writeValue(runtime, args[0], args[1]);
			}
			if (record.signature === SIGNATURES.getAndSet) return exchange(runtime, args[0], args[1]);
			if (record.signature === SIGNATURES.compareAndExchange) {
				return compareExchange(runtime, args[0], args[1], args[2]);
			}
			return compareSet(runtime, args[0], args[1], args[2]);
		}
	});
}

function initialize(runtime, args, value) {
	runtime.heap.get(args[0]);
	runtime.heap.setField(args[0], VALUE_FIELD, value ?? 0);
	return undefined;
}

function currentValue(runtime, reference) {
	return runtime.heap.getField(reference, VALUE_FIELD);
}

function writeValue(runtime, reference, value) {
	runtime.heap.setField(reference, VALUE_FIELD, value ?? 0);
	return undefined;
}

function exchange(runtime, reference, value) {
	const previous = currentValue(runtime, reference);
	writeValue(runtime, reference, value);
	return previous;
}

function compareExchange(runtime, reference, expected, replacement) {
	const current = currentValue(runtime, reference);
	if (sameValue(current, expected)) writeValue(runtime, reference, replacement);
	return current;
}

function compareSet(runtime, reference, expected, replacement) {
	const current = currentValue(runtime, reference);
	if (!sameValue(current, expected)) return 0;
	writeValue(runtime, reference, replacement);
	return 1;
}

function sameValue(left, right) {
	if (left === right) return true;
	return Boolean(left?.kind === "dalvik-reference"
		&& right?.kind === "dalvik-reference"
		&& left.id === right.id);
}
