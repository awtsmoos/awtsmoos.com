// B"H
// Boruch Hashem
// Blessed is He
/** @module PersonalizationControl @description Gives users inspectable and reversible discovery control. */

/** Creates one frozen personalization preference set. */
export function createPersonalizationControl(input = {}) {
	return Object.freeze({
		enabled: input.enabled !== false,
		signals: Object.freeze({ ...(input.signals || {}) }),
		hiddenObjectIds: Object.freeze(unique(input.hiddenObjectIds || [])),
		mutedContexts: Object.freeze(unique(input.mutedContexts || [])),
		updatedAt: String(input.updatedAt || new Date().toISOString())
	});
}

/** Clears learned preferences while preserving explicit subscriptions elsewhere. */
export function clearPersonalization(control) {
	return createPersonalizationControl({
		enabled: control?.enabled !== false,
		signals: {},
		hiddenObjectIds: [],
		mutedContexts: [],
		updatedAt: new Date().toISOString()
	});
}

function unique(values) {
	return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}
