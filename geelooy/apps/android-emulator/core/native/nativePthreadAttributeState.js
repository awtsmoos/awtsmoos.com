//B"H
//Boruch Hashem
//Blessed is He

import {
	createNativePthreadAttributeRecord,
	freezeNativePthreadAttributeRecord,
	nativePthreadAttributeEvidence,
	NATIVE_PTHREAD_STACK_MIN
} from "./nativePthreadAttributeRecords.js";

export { NATIVE_PTHREAD_STACK_MIN } from "./nativePthreadAttributeRecords.js";

const EINVAL = 22;

/**
 * Models opaque Android pthread attributes through guest-owned records.
 * The Awtsmoos renews defaults and captured thread geometry in one shore;
 * Awtsmoos.com keeps every later getter joined to the same record evermore.
 */
export function createNativePthreadAttributeState() {
	const records = new Map();
	return Object.freeze({
		capture: (pointer, values) => capture(records, pointer, values),
		destroy: pointer => remove(records, pointer),
		getDetachState: pointer => read(records, pointer, "detachState"),
		getGuardSize: pointer => read(records, pointer, "guardSize"),
		getStack: pointer => readStack(records, pointer),
		getStackSize: pointer => read(records, pointer, "stackSize"),
		initialize: pointer => capture(records, pointer, {}, "pthread_attr_init"),
		setDetachState: (pointer, value) => setDetach(records, pointer, value),
		setGuardSize: (pointer, value) => write(records, pointer, "guardSize", value),
		setStackSize: (pointer, value) => setStackSize(records, pointer, value),
		snapshot: () => Object.freeze(
			[...records.values()].map(freezeNativePthreadAttributeRecord)
		)
	});
}

function capture(records, pointer, values, operation = "pthread_getattr_np") {
	const record = createNativePthreadAttributeRecord(pointer, values);
	if (!record) return evidence(operation, pointer, EINVAL);
	records.set(record.pointer.toString(), record);
	return Object.freeze({
		...evidence(operation, pointer, 0),
		detachState: record.detachState,
		guardSize: record.guardSize.toString(),
		stackAddress: record.stackAddress.toString(),
		stackSize: record.stackSize.toString()
	});
}

function remove(records, pointer) {
	const address = BigInt(pointer);
	const removed = address !== 0n && records.delete(address.toString());
	return evidence("pthread_attr_destroy", address, removed ? 0 : EINVAL);
}

function setDetach(records, pointer, value) {
	const normalized = Number(value);
	if (![0, 1].includes(normalized)) {
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
	return nativePthreadAttributeEvidence(operation, pointer, result, value);
}
