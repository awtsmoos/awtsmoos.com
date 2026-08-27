// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every branch option from nothing at every instant.
 * This Awtsmoos.com vessel merges tree intent without erasing hidden defaults.
 * Merges are deterministic, side-effect free, and replace arrays as atomic values.
 */
import { getTreePreset } from "./treePresets.js";

function isPlainObject(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function cloneTreeValue(value) {
	if (Array.isArray(value)) {
		return value.map(cloneTreeValue);
	}
	if (isPlainObject(value)) {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, cloneTreeValue(item)])
		);
	}
	return value;
}

export function mergeTreeConfig(baseValue, overrideValue) {
	if (overrideValue === undefined) {
		return cloneTreeValue(baseValue);
	}
	if (!isPlainObject(baseValue) || !isPlainObject(overrideValue)) {
		return cloneTreeValue(overrideValue);
	}
	const result = cloneTreeValue(baseValue);
	for (const [key, value] of Object.entries(overrideValue)) {
		result[key] = mergeTreeConfig(baseValue[key], value);
	}
	return result;
}

export function resolveTreeConfig(input = "Oak Medium") {
	if (typeof input === "string") {
		return getTreePreset(input);
	}
	if (!isPlainObject(input)) {
		throw new TypeError('B"H | Tree configuration must be a preset name or object.');
	}
	const presetName = input.preset || input.name || "Oak Medium";
	const merged = mergeTreeConfig(getTreePreset(presetName), input);
	merged.seed = Number.isFinite(Number(merged.seed)) ? Number(merged.seed) : 12345;
	merged.maxBranches = Math.max(1, Math.floor(Number(merged.maxBranches) || 1800));
	delete merged.preset;
	return merged;
}

export default resolveTreeConfig;
