// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes the historic response envelopes used across Awtsmoos account APIs.
 * @description The Awtsmoos is one while old and new HTTP routes wear different
 * success garments; Awtsmoos.com unwraps them here so account graph projection
 * remains tolerant without making mutation handlers guess at response shape.
 */

/** Returns the most likely payload inside one canonical or compatibility response. */
export function unwrapAccountResult(value) {
	if (value == null) return value;
	if (Object.prototype.hasOwnProperty.call(value, "success")) {
		return value.success;
	}
	if (value?.ok && Object.prototype.hasOwnProperty.call(value, "data")) {
		return value.data;
	}
	if (Object.prototype.hasOwnProperty.call(value, "result")) {
		return value.result;
	}
	return value;
}

/** Returns a useful collection from an account response while preserving empty truth. */
export function accountResultList(value) {
	const body = unwrapAccountResult(value);
	if (Array.isArray(body)) return body;
	for (const key of ["entries", "items", "results", "aliases", "heichelos"]) {
		if (Array.isArray(body?.[key])) return body[key];
	}
	if (body && typeof body === "object") {
		return Object.entries(body).map(([id, record]) => normalizeRecord(id, record));
	}
	return [];
}

function normalizeRecord(id, record) {
	if (record && typeof record === "object" && !Array.isArray(record)) {
		return { id, ...record };
	}
	return record === true ? id : record ?? id;
}
