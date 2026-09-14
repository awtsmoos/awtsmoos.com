// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared normalization helpers for account-to-graph projection.
 * @description The Awtsmoos renews finite value and stable identity together;
 * Awtsmoos.com keeps coercion and safe cloning outside graph record constructors
 * so semantic projection remains readable and below the source line budget.
 */

/** Returns one stable scalar identity from a primitive or candidate object fields. */
export function scalarId(value, keys = []) {
	if (typeof value === "string" || typeof value === "number") {
		return requiredText(value, "graphId");
	}
	for (const key of keys) {
		const candidate = value?.[key];
		if (candidate !== undefined && candidate !== null && candidate !== "") {
			return requiredText(candidate, "graphId");
		}
	}
	return requiredText(value, "graphId");
}

/** Creates one plain graph object without attaching browser-only authority. */
export function record(value = {}) {
	return {
		ownerId: "current",
		provider: "account",
		actions: [],
		...value
	};
}

/** Converts arbitrary display values into bounded visible text. */
export function text(value) {
	return String(value ?? "").slice(0, 1024);
}

/** Safely clones object-shaped API data and overlays canonical identity fields. */
export function objectData(value, extra = {}) {
	const source = value && typeof value === "object" && !Array.isArray(value)
		? value
		: {};
	return {
		...structuredCloneSafe(source),
		...extra
	};
}

/** Returns the final path segment without assuming operating-system separators. */
export function baseName(path) {
	return String(path || "")
		.split("/")
		.filter(Boolean)
		.at(-1) || "Document";
}

function structuredCloneSafe(value) {
	try {
		return structuredClone(value);
	} catch {
		return JSON.parse(JSON.stringify(value));
	}
}

function requiredText(value, field) {
	const result = String(value ?? "").trim();
	if (!result) throw new Error(`account_${field}_required`);
	return result;
}
