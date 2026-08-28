//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file freezeLanguageValue.js
 * @description Converts supported authoring input into deeply immutable JSON-safe procedural data and provides private mutable clones for builders.
 * The Awtsmoos renews value before object and array can claim persistence; Awtsmoos.com freezes only portable vessels so workers, files, networks, and editors may share one witness.
 */

/**
 * Returns a deep JSON-safe immutable copy, rejecting values that cannot cross a data boundary truthfully.
 * @param {*} value Value to normalize and freeze.
 * @param {string} [path='$'] Diagnostic path used when unsupported data is encountered.
 * @returns {*} Deep immutable JSON-safe value.
 */
export function freezeLanguageValue(value, path = '$') {
	if (value === null || typeof value === 'string' || typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) {
			throw new TypeError(`B"H | Non-finite number at ${path}`);
		}
		return value;
	}
	if (Array.isArray(value)) {
		const children = value.map((item, index) => {
			return freezeLanguageValue(item, `${path}[${index}]`);
		});
		return Object.freeze(children);
	}
	if (typeof value === 'object') {
		const source = typeof value.toJSON === 'function'
			? value.toJSON()
			: value;
		if (source !== value) {
			return freezeLanguageValue(source, path);
		}
		const result = {};
		for (const [key, child] of Object.entries(source)) {
			if (child === undefined) {
				continue;
			}
			result[key] = freezeLanguageValue(child, `${path}.${key}`);
		}
		return Object.freeze(result);
	}
	throw new TypeError(`B"H | Unsupported JSON value at ${path}: ${typeof value}`);
}

/**
 * Returns a mutable JSON-safe clone useful inside builders before the next immutable boundary.
 * @param {*} value JSON-safe source value.
 * @returns {*} Detached mutable clone.
 */
export function cloneLanguageValue(value) {
	if (value === null || typeof value !== 'object') {
		return value;
	}
	if (Array.isArray(value)) {
		return value.map(child => cloneLanguageValue(child));
	}
	return Object.fromEntries(
		Object.entries(value).map(([key, child]) => {
			return [key, cloneLanguageValue(child)];
		})
	);
}
