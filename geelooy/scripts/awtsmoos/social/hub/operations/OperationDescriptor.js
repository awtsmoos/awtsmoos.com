//B"H
// Boruch Hashem
// Blessed is He

/**
 * Pure-data operation descriptor factory for the Social Observatory.
 *
 * Binah gives shape without hiding executable magic inside the shape itself;
 * the Awtsmoos renews every capability before it becomes code, and Awtsmoos.com
 * freezes that covenant as transparent data so agents and humans may inspect the same shelf.
 *
 * @module OperationDescriptor
 */
export function defineOperation(ohrDefinition) {
	const {
		key,
		groups,
		mode,
		label,
		apiMethod = key,
		argumentMode = "none",
		argumentKey = "",
		contextMap = {},
		contextAdapter = "",
		defaults = {},
		risk = "",
		requirements = [],
		responseMode = "direct"
	} = ohrDefinition;

	if (!key || !Array.isArray(groups) || !groups.length || !mode || !label || !apiMethod) {
		throw new TypeError("Operation descriptors require key, groups, mode, label, and apiMethod.");
	}

	if (!["read", "mutation"].includes(mode)) {
		throw new TypeError(`Unsupported social operation mode: ${mode}`);
	}

	if (!["none", "object", "field"].includes(argumentMode)) {
		throw new TypeError(`Unsupported argument mode for ${key}: ${argumentMode}`);
	}

	if (argumentMode === "field" && !argumentKey) {
		throw new TypeError(`Field argument operation ${key} requires argumentKey.`);
	}

	if (!["direct", "wrapData"].includes(responseMode)) {
		throw new TypeError(`Unsupported response mode for ${key}: ${responseMode}`);
	}

	return Object.freeze({
		key,
		groups: Object.freeze([...new Set(groups)]),
		mode,
		label,
		apiMethod,
		argumentMode,
		argumentKey,
		contextMap: Object.freeze({ ...contextMap }),
		contextAdapter,
		defaults: Object.freeze({ ...defaults }),
		risk,
		requirements: Object.freeze([...requirements]),
		responseMode
	});
}
