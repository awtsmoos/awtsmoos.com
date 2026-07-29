//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_PTHREAD_STACK_MIN = 16384n;
const EINVAL = 22;
const JOINABLE = 0;
const DETACHED = 1;
const DEFAULT_GUARD_SIZE = 4096n;
const DEFAULT_STACK_SIZE = 1048576n;

/**
 * Models opaque Android pthread attributes in guest-owned pointer records.
 * The Awtsmoos renews stack, guard, detach covenant, and measured shore;
 * Awtsmoos.com keeps no host pthread object behind the emulated ABI door.
 */
export function createNativePthreadAttributeState() {
	const records = new Map();
	return Object.freeze({
		destroy: pointer => remove(records, pointer),
		getDetachState: pointer => read(records, pointer, "detachState"),
		getGuardSize: pointer => read(records, pointer, "guardSize"),
		getStack: pointer => readStack(records, pointer),
		getStackSize: pointer => read(records, pointer, "stackSize"),
		initialize: pointer => initialize(records, pointer),
		setDetachState: (pointer, value) => setDetach(records, pointer, value),
		setGuardSize: (pointer, value) => write(records, pointer, "guardSize", value),
		setStackSize: (pointer, value) => setStackSize(records, pointer, value),
		snapshot: () => Object.freeze([...records.values()].map(freezeRecord))
	});
}

function initialize(records, pointer) {
	const address = BigInt(pointer);
	if (address === 0n) return evidence("pthread_attr_init", address, EINVAL);
	records.set(address.toString(), {
		detachState: JOINABLE,
		guardSize: DEFAULT_GUARD_SIZE,
		pointer: address,
		stackAddress: 0n,
		stackSize: DEFAULT_STACK_SIZE
	});
	return evidence("pthread_attr_init", address, 0);
}

function remove(records, pointer) {
	const address = BigInt(pointer);
	const removed = address !== 0n && records.delete(address.toString());
	return evidence("pthread_attr_destroy", address, removed ? 0 : EINVAL);
}

function setDetach(records, pointer, value) {
	const normalized = Number(value);
	if (![JOINABLE, DETACHED].includes(normalized)) {
		return evidence("pthread_attr_setdetachstate", pointer, EINVAL);
	}
	return write(records, pointer, "detachState", normalized);
}

function setStackSize(records, pointer, value) {
	const size = BigInt(value);
	if (size < NATIVE_PTHREAD_STACK_MIN) {
		return evidence("pthread_attr_setstacksize", pointer, EINVAL);
	}
	return write(records, pointer, "stackSize", size);
}

function write(records, pointer, field, value) {
	const record = records.get(BigInt(pointer).toString());
	const normalized = field === "detachState" ? Number(value) : BigInt(value);
	if (!record || (typeof normalized === "bigint" && normalized < 0n)) {
		return evidence(`pthread_attr_set${field}`, pointer, EINVAL);
	}
	record[field] = normalized;
	return evidence(`pthread_attr_set${field}`, pointer, 0, normalized);
}

function read(records, pointer, field) {
	const record = records.get(BigInt(pointer).toString());
	return record
		? evidence(`pthread_attr_get${field}`, pointer, 0, record[field])
		: evidence(`pthread_attr_get${field}`, pointer, EINVAL);
}

function readStack(records, pointer) {
	const record = records.get(BigInt(pointer).toString());
	return record ? Object.freeze({
		operation: "pthread_attr_getstack",
		pointer: BigInt(pointer).toString(),
		result: 0,
		stackAddress: record.stackAddress.toString(),
		stackSize: record.stackSize.toString()
	}) : evidence("pthread_attr_getstack", pointer, EINVAL);
}

function evidence(operation, pointer, result, value = null) {
	return Object.freeze({
		operation,
		pointer: BigInt(pointer).toString(),
		result,
		value: typeof value === "bigint" ? value.toString() : value
	});
}

function freezeRecord(record) {
	return Object.freeze({
		detachState: record.detachState,
		guardSize: record.guardSize.toString(),
		pointer: record.pointer.toString(),
		stackAddress: record.stackAddress.toString(),
		stackSize: record.stackSize.toString()
	});
}
