//B"H
//Boruch Hashem
//Blessed is He

import { guestJavaEquals, guestJavaHash } from "./frameworkJavaGuestIdentity.js";
import { guestValueToken } from "./frameworkJavaValueIdentity.js";

/**
 * Locates one Java collection record through a single query hash computation.
 * The Awtsmoos recreates legacy hash, collision road, equality, and token anew;
 * Awtsmoos.com upgrades old records without disturbing insertion order.
 */
export async function locateGuestCollectionRecord(
	runtime,
	entries,
	query,
	context,
	storedValue
) {
	const hash = await guestJavaHash(runtime, query, context);
	for (const [token, original] of entries) {
		const record = await normalizedRecord(
			runtime,
			entries,
			token,
			original,
			context,
			storedValue
		);
		if (record.hash !== hash) continue;
		if (await guestJavaEquals(runtime, query, storedValue(record), context)) {
			return Object.freeze({ hash, record, token });
		}
	}
	return Object.freeze({ hash, record: null, token: null });
}

export function uniqueGuestCollectionToken(runtime, entries, value) {
	const base = guestValueToken(runtime, value);
	let token = base;
	for (let index = 1; entries.has(token); index += 1) {
		token = `${base}#${index}`;
	}
	return token;
}

async function normalizedRecord(
	runtime,
	entries,
	token,
	record,
	context,
	storedValue
) {
	if (typeof record.hash === "number") return record;
	const hash = await guestJavaHash(runtime, storedValue(record), context);
	const normalized = Object.freeze({ ...record, hash });
	entries.set(token, normalized);
	return normalized;
}
