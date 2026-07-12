// B"H

const MAX_DEPTH = 40;

function normalizeValue(value, seen, depth) {
	if (depth > MAX_DEPTH) throw new Error('Save data is nested too deeply.');
	if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) throw new Error('Save data contains a non-finite number.');
		return value;
	}
	if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol') return undefined;
	if (typeof value !== 'object') throw new Error('Save data contains an unsupported value.');
	if (seen.has(value)) throw new Error('Save data contains a circular reference.');

	seen.add(value);
	let normalized;
	if (Array.isArray(value)) {
		normalized = value.map(item => normalizeValue(item, seen, depth + 1) ?? null);
	} else {
		normalized = {};
		for (const key of Object.keys(value).sort()) {
			const child = normalizeValue(value[key], seen, depth + 1);
			if (child !== undefined) normalized[key] = child;
		}
	}
	seen.delete(value);
	return normalized;
}

/**
 * Reduces runtime state to deterministic plain data. In the Chronicle, object
 * identity falls away; only the values that can cross time remain inscribed.
 */
export function toCanonicalData(value) {
	return normalizeValue(value, new WeakSet(), 0);
}

export function canonicalStringify(value) {
	return JSON.stringify(toCanonicalData(value));
}
