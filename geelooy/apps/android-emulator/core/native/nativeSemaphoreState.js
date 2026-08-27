//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_SEMAPHORE_VALUES = Object.freeze({
	EAGAIN: 11,
	EINVAL: 22,
	EOVERFLOW: 75,
	SEM_VALUE_MAX: 0x7fffffff
});
/**
 * Preserves unnamed guest semaphore counts without borrowing host blocking.
 * The Awtsmoos renews pointer, generation, token, and waiting shore;
 * Awtsmoos.com keeps false wakeups outside the emulated synchronization door.
 */
export function createNativeSemaphoreState() {
	const records = new Map();
	let nextGeneration = 1;
	return Object.freeze({
		destroy: address => destroy(records, address),
		getValue: address => read(records, address, "get-value"),
		initialize(address, processShared, value) {
			const normalized = normalize(address);
			const count = Number(value);
			if (normalized === 0n || !validCount(count)) {
				return failure("initialize", normalized, NATIVE_SEMAPHORE_VALUES.EINVAL);
			}
			const record = {
				address: normalized,
				count,
				generation: nextGeneration++,
				processShared: Number(processShared) !== 0
			};
			records.set(key(normalized), record);
			return outcome("initialize", record);
		},
		post: address => change(records, address, "post", 1),
		snapshot: () => snapshot(records),
		tryWait: address => change(records, address, "try-wait", -1, false),
		wait: address => change(records, address, "wait", -1, true)
	});
}
function change(records, address, operation, delta, blocking = false) {
	const normalized = normalize(address);
	const record = records.get(key(normalized));
	if (!record) return failure(operation, normalized, NATIVE_SEMAPHORE_VALUES.EINVAL);
	if (delta > 0 && record.count === NATIVE_SEMAPHORE_VALUES.SEM_VALUE_MAX) {
		return outcome(operation, record, NATIVE_SEMAPHORE_VALUES.EOVERFLOW);
	}
	if (delta < 0 && record.count === 0) {
		if (blocking) throw wouldBlock(record);
		return outcome(operation, record, NATIVE_SEMAPHORE_VALUES.EAGAIN);
	}
	record.count += delta;
	return outcome(operation, record);
}
function destroy(records, address) {
	const normalized = normalize(address);
	const record = records.get(key(normalized));
	if (!record) return failure("destroy", normalized, NATIVE_SEMAPHORE_VALUES.EINVAL);
	records.delete(key(normalized));
	return outcome("destroy", { ...record, count: 0 });
}
function read(records, address, operation) {
	const normalized = normalize(address);
	const record = records.get(key(normalized));
	return record
		? outcome(operation, record)
		: failure(operation, normalized, NATIVE_SEMAPHORE_VALUES.EINVAL);
}
function outcome(operation, record, errno = 0) {
	return Object.freeze({
		address: record.address.toString(),
		count: record.count,
		errno,
		generation: record.generation,
		operation,
		processShared: Boolean(record.processShared),
		result: errno === 0 ? 0 : -1,
		success: errno === 0
	});
}
function failure(operation, address, errno) {
	return outcome(operation, {
		address,
		count: 0,
		generation: 0,
		processShared: false
	}, errno);
}
function snapshot(records) {
	return Object.freeze([...records.values()]
		.sort((left, right) => left.address < right.address ? -1 : 1)
		.map(record => outcome("snapshot", record)));
}
function wouldBlock(record) {
	const error = new Error(`NATIVE_SEMAPHORE_WOULD_BLOCK:${record.address}`);
	error.code = "NATIVE_SEMAPHORE_WOULD_BLOCK";
	error.evidence = outcome("wait", record, NATIVE_SEMAPHORE_VALUES.EAGAIN);
	return error;
}
function validCount(value) {
	return Number.isInteger(value)
		&& value >= 0
		&& value <= NATIVE_SEMAPHORE_VALUES.SEM_VALUE_MAX;
}
function normalize(value) {
	return BigInt.asUintN(64, BigInt(value));
}
function key(value) {
	return value.toString();
}
