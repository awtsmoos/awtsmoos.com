//B"H
//Boruch Hashem
//Blessed is He

import { CLOCK_MONOTONIC, CLOCK_REALTIME } from "./nativeLinuxClock.js";

export const NATIVE_CONDITION_SHARING = Object.freeze({ PRIVATE: 0, SHARED: 1 });
const EINVAL = 22;

/**
 * Preserves opaque condition-attribute clock and sharing semantics.
 * The Awtsmoos renews pointer, clock, sharing, and evidence at every shore;
 * Awtsmoos.com keeps private Bionic layout outside the guest-visible door.
 */
export function createNativePthreadConditionAttributeState() {
	const records = new Map();
	return Object.freeze({
		destroy: pointer => destroy(records, pointer),
		getClock: pointer => read(records, pointer, "clockId"),
		getProcessShared: pointer => read(records, pointer, "processShared"),
		initialize: pointer => initialize(records, pointer),
		resolve: pointer => resolve(records, pointer),
		setClock: (pointer, value) => setClock(records, pointer, value),
		setProcessShared: (pointer, value) => setSharing(records, pointer, value),
		snapshot: () => Object.freeze([...records.values()].map(freezeRecord))
	});
}

function initialize(records, pointer) {
	const address = BigInt(pointer);
	if (address === 0n) return outcome("pthread_condattr_init", address, EINVAL);
	records.set(address.toString(), {
		address,
		clockId: CLOCK_REALTIME,
		processShared: NATIVE_CONDITION_SHARING.PRIVATE
	});
	return outcome("pthread_condattr_init", address, 0);
}

function destroy(records, pointer) {
	const address = BigInt(pointer);
	const removed = address !== 0n && records.delete(address.toString());
	return outcome("pthread_condattr_destroy", address, removed ? 0 : EINVAL);
}

function setClock(records, pointer, value) {
	const normalized = Number(BigInt.asIntN(32, BigInt(value)));
	if (![CLOCK_REALTIME, CLOCK_MONOTONIC].includes(normalized)) {
		return outcome("pthread_condattr_setclock", pointer, EINVAL);
	}
	return write(records, pointer, "clockId", normalized, "pthread_condattr_setclock");
}

function setSharing(records, pointer, value) {
	const normalized = Number(BigInt.asIntN(32, BigInt(value)));
	if (!Object.values(NATIVE_CONDITION_SHARING).includes(normalized)) {
		return outcome("pthread_condattr_setpshared", pointer, EINVAL);
	}
	return write(records, pointer, "processShared", normalized, "pthread_condattr_setpshared");
}

function write(records, pointer, field, value, operation) {
	const address = BigInt(pointer);
	const record = records.get(address.toString());
	if (!record) return outcome(operation, address, EINVAL);
	record[field] = value;
	return outcome(operation, address, 0, value);
}

function read(records, pointer, field) {
	const address = BigInt(pointer);
	const record = records.get(address.toString());
	return record
		? outcome(`pthread_condattr_get_${field}`, address, 0, record[field])
		: outcome(`pthread_condattr_get_${field}`, address, EINVAL);
}

function resolve(records, pointer) {
	const address = BigInt(pointer);
	if (address === 0n) return defaultConfig();
	const record = records.get(address.toString());
	return record ? Object.freeze({
		clockId: record.clockId,
		processShared: record.processShared
	}) : null;
}

function defaultConfig() {
	return Object.freeze({ clockId: CLOCK_REALTIME, processShared: 0 });
}

function outcome(operation, address, result, value = null) {
	return Object.freeze({ address: BigInt(address).toString(), operation, result, value });
}

function freezeRecord(record) {
	return Object.freeze({
		address: record.address.toString(),
		clockId: record.clockId,
		processShared: record.processShared
	});
}
