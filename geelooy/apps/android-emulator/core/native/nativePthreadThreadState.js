//B"H
//Boruch Hashem
//Blessed is He

import {
	createNativePthreadThreadRecord,
	freezeNativePthreadThread,
	nativePthreadThreadKey,
	nativePthreadThreadResult
} from "./nativePthreadThreadRecords.js";

const EINVAL = 22;
const ESRCH = 3;

/**
 * Preserves cooperative pthread identity, suspension, completion, and names.
 * The Awtsmoos renews handle and lifecycle from hidden source to visible shore;
 * Awtsmoos.com keeps mutable continuations private from serialized evidence.
 */
export function createNativePthreadThreadState() {
	const records = new Map();
	return Object.freeze({
		beginResume: handle => beginResume(records, handle),
		complete: (handle, child) => transition(records, handle, "completed", child),
		create: input => createRecord(records, input),
		detach: handle => detach(records, handle),
		fail: (handle, child) => transition(records, handle, "failed", child),
		join: handle => join(records, handle),
		lookup: handle => freezeNativePthreadThread(records.get(key(handle)) || null),
		setName: (handle, name, bytes) => setName(records, handle, name, bytes),
		snapshot: () => Object.freeze([...records.values()].map(freezeNativePthreadThread)),
		suspend: (handle, child) => suspend(records, handle, child),
		suspension: handle => readSuspension(records, handle)
	});
}

function createRecord(records, input) {
	const handle = BigInt(input.handle);
	if (handle === 0n || records.has(key(handle))) return result(EINVAL, null);
	const record = createNativePthreadThreadRecord(input);
	records.set(key(handle), record);
	return result(0, record);
}

function suspend(records, handle, child) {
	const record = records.get(key(handle));
	if (!record || !child?.continuation || !child?.suspension) {
		return result(EINVAL, null);
	}
	record.childEvidence = child;
	record.continuation = child.continuation;
	record.status = "waiting-condition";
	record.wait = Object.freeze({ ...child.suspension });
	return result(0, record);
}

function readSuspension(records, handle) {
	const record = records.get(key(handle));
	if (!record || record.status !== "waiting-condition") return result(ESRCH, null);
	return Object.freeze({
		code: 0,
		continuation: record.continuation,
		record: freezeNativePthreadThread(record),
		wait: record.wait
	});
}

function beginResume(records, handle) {
	const record = records.get(key(handle));
	if (!record || record.status !== "waiting-condition") return result(ESRCH, null);
	record.status = "running";
	return result(0, record);
}

function transition(records, handle, status, child) {
	const record = records.get(key(handle));
	if (!record) return result(ESRCH, null);
	record.childEvidence = child;
	record.continuation = null;
	record.returnValue = BigInt(child?.returnValue || 0);
	record.status = status;
	record.wait = null;
	return result(0, record);
}

function setName(records, handle, name, byteLength) {
	const record = records.get(key(handle));
	if (!record) return result(ESRCH, null);
	record.name = String(name);
	record.nameByteLength = Number(byteLength);
	return result(0, record);
}

function detach(records, handle) {
	const record = records.get(key(handle));
	if (!record || record.detached) return result(EINVAL, null);
	record.detached = true;
	return result(0, record);
}

function join(records, handle) {
	const record = records.get(key(handle));
	if (!record) return result(ESRCH, null);
	if (record.detached || record.status !== "completed") return result(EINVAL, null);
	return result(0, record);
}

function result(code, record) {
	return nativePthreadThreadResult(code, record);
}

function key(handle) {
	return nativePthreadThreadKey(handle);
}
