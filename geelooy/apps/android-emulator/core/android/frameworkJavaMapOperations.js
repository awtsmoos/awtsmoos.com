//B"H
//Boruch Hashem
//Blessed is He

import {
	locateGuestCollectionRecord,
	uniqueGuestCollectionToken
} from "./frameworkJavaCollectionLookup.js";
import {
	assertJavaMapCapacity,
	javaMapEntries
} from "./frameworkJavaMapState.js";
import { guestValueToken } from "./frameworkJavaValueIdentity.js";

/**
 * Executes behavioral Java Map lookup and mutation. The Awtsmoos recreates
 * query hash, legacy normalization, canonical token, and insertion order anew;
 * Awtsmoos.com keeps the public storage doorway free of algorithmic turbulence.
 */
export async function findJavaMapEntry(runtime, reference, key, context) {
	const located = await locateGuestCollectionRecord(
		runtime,
		javaMapEntries(runtime, reference),
		key,
		context,
		record => record.key
	);
	return located.record ? located : null;
}

export function putJavaMapValue(runtime, reference, key, value, context = null) {
	return context
		? putAsynchronous(runtime, reference, key, value, context)
		: putSynchronous(runtime, reference, key, value);
}

export function removeJavaMapValue(runtime, reference, key, context = null) {
	if (context) return removeAsynchronous(runtime, reference, key, context);
	const entries = javaMapEntries(runtime, reference);
	const token = guestValueToken(runtime, key);
	const previous = entries.get(token)?.value ?? 0;
	entries.delete(token);
	return previous;
}

export function copyJavaMap(runtime, target, source, context = null) {
	return context
		? copyAsynchronous(runtime, target, source, context)
		: copySynchronous(runtime, target, source);
}

async function putAsynchronous(runtime, reference, key, value, context) {
	const entries = javaMapEntries(runtime, reference);
	const located = await locateGuestCollectionRecord(
		runtime,
		entries,
		key,
		context,
		record => record.key
	);
	if (located.record) {
		entries.set(located.token, Object.freeze({
			...located.record,
			value: value ?? 0
		}));
		return located.record.value ?? 0;
	}
	assertJavaMapCapacity(entries);
	const token = uniqueGuestCollectionToken(runtime, entries, key);
	entries.set(token, Object.freeze({
		hash: located.hash,
		key: key ?? 0,
		value: value ?? 0
	}));
	return 0;
}

function putSynchronous(runtime, reference, key, value) {
	const entries = javaMapEntries(runtime, reference);
	const token = guestValueToken(runtime, key);
	const previous = entries.get(token)?.value ?? 0;
	if (!entries.has(token)) assertJavaMapCapacity(entries);
	entries.set(token, Object.freeze({
		hash: token,
		key: key ?? 0,
		value: value ?? 0
	}));
	return previous;
}

async function removeAsynchronous(runtime, reference, key, context) {
	const entries = javaMapEntries(runtime, reference);
	const found = await findJavaMapEntry(runtime, reference, key, context);
	if (!found) return 0;
	entries.delete(found.token);
	return found.record.value ?? 0;
}

async function copyAsynchronous(runtime, target, source, context) {
	for (const record of javaMapEntries(runtime, source).values()) {
		await putAsynchronous(runtime, target, record.key, record.value, context);
	}
}

function copySynchronous(runtime, target, source) {
	for (const record of javaMapEntries(runtime, source).values()) {
		putSynchronous(runtime, target, record.key, record.value);
	}
}
