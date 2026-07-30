//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_MUTEX_TYPES = Object.freeze({
	NORMAL: 0,
	RECURSIVE: 1,
	ERRORCHECK: 2
});

const EINVAL = 22;

/**
 * Preserves opaque mutex-attribute semantics without exposing host pthreads.
 * The Awtsmoos renews type, pointer, and bounded evidence at every shore;
 * Awtsmoos.com keeps private Bionic layout outside the guest-visible door.
 */
export function createNativePthreadMutexAttributeState() {
	const records = new Map();
	return Object.freeze({
		destroy: pointer => destroy(records, pointer),
		getType: pointer => read(records, pointer),
		initialize: pointer => initialize(records, pointer),
		resolve: pointer => resolve(records, pointer),
		setType: (pointer, type) => setType(records, pointer, type),
		snapshot: () => Object.freeze([...records.values()].map(freezeRecord))
	});
}

function initialize(records, pointer) {
	const address = BigInt(pointer);
	if (address === 0n) return outcome("pthread_mutexattr_init", address, EINVAL);
	records.set(address.toString(), { address, type: NATIVE_MUTEX_TYPES.NORMAL });
	return outcome("pthread_mutexattr_init", address, 0, NATIVE_MUTEX_TYPES.NORMAL);
}

function destroy(records, pointer) {
	const address = BigInt(pointer);
	const removed = address !== 0n && records.delete(address.toString());
	return outcome("pthread_mutexattr_destroy", address, removed ? 0 : EINVAL);
}

function setType(records, pointer, type) {
	const address = BigInt(pointer);
	const record = records.get(address.toString());
	const normalized = Number(BigInt.asIntN(32, BigInt(type)));
	if (!record || !Object.values(NATIVE_MUTEX_TYPES).includes(normalized)) {
		return outcome("pthread_mutexattr_settype", address, EINVAL);
	}
	record.type = normalized;
	return outcome("pthread_mutexattr_settype", address, 0, normalized);
}

function read(records, pointer) {
	const address = BigInt(pointer);
	const record = records.get(address.toString());
	return record
		? outcome("pthread_mutexattr_gettype", address, 0, record.type)
		: outcome("pthread_mutexattr_gettype", address, EINVAL);
}

function resolve(records, pointer) {
	const address = BigInt(pointer);
	if (address === 0n) return Object.freeze({ type: NATIVE_MUTEX_TYPES.NORMAL });
	const record = records.get(address.toString());
	return record ? Object.freeze({ type: record.type }) : null;
}

function outcome(operation, address, result, type = null) {
	return Object.freeze({
		address: BigInt(address).toString(),
		operation,
		result,
		type
	});
}

function freezeRecord(record) {
	return Object.freeze({ address: record.address.toString(), type: record.type });
}
