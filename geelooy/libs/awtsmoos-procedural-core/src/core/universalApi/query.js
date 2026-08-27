// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { readPath } from "./data.js";

function compare(actual, expected) {
	if (expected && typeof expected === "object" && !Array.isArray(expected)) {
		if ("eq" in expected) return actual === expected.eq;
		if ("ne" in expected) return actual !== expected.ne;
		if ("gt" in expected) return actual > expected.gt;
		if ("gte" in expected) return actual >= expected.gte;
		if ("lt" in expected) return actual < expected.lt;
		if ("lte" in expected) return actual <= expected.lte;
		if ("contains" in expected) return actual?.includes?.(expected.contains) ?? false;
		if ("startsWith" in expected) return String(actual).startsWith(expected.startsWith);
		if ("exists" in expected) return expected.exists === (actual !== undefined);
	}
	return actual === expected;
}

function matches(resource, where = {}) {
	return Object.entries(where).every(([path, expected]) => compare(readPath(resource, path), expected));
}

/** Executes deterministic filtering, ordering, projection, and pagination. */
export function queryResources(document, input) {
	const bucket = document.resources[input.resource] ?? {};
	let values = Object.values(bucket).filter((resource) => matches(resource, input.where));
	for (const order of [...(input.orderBy ?? [])].reverse()) {
		const direction = order.direction === "descending" ? -1 : 1;
		values.sort((left, right) => {
			const a = readPath(left, order.field);
			const b = readPath(right, order.field);
			return a === b ? 0 : a > b ? direction : -direction;
		});
	}
	if (!input.orderBy?.length) values.sort((a, b) => String(a.id).localeCompare(String(b.id)));
	const offset = Math.max(0, input.offset ?? 0);
	const limit = Math.max(0, input.limit ?? 100);
	const page = values.slice(offset, offset + limit);
	const items = input.select?.length
		? page.map((resource) => Object.fromEntries(input.select.map((key) => [key, readPath(resource, key)])))
		: page;
	return { items, total: values.length, offset, limit };
}
