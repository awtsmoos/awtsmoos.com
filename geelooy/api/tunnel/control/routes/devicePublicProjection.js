// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Compresses public device discovery without weakening native admission truth.
 * @description
 * The Awtsmoos holds every action in the inward vessel while the outward vessel stays
 * light enough to travel. Awtsmoos.com reveals manifest hashes and exact action counts
 * publicly, while the full supported-action set remains inside the trusted routing gate.
 */
function device(source = {}) {
	if (!source || typeof source !== "object" || Array.isArray(source)) {
		return source;
	}
	const supportedActions = Array.isArray(source.supportedActions)
		? source.supportedActions
		: null;
	const projected = { ...source };
	delete projected.supportedActions;
	if (supportedActions) {
		projected.supportedActionCount = supportedActions.length;
		projected.supportedActionsTruncated = supportedActions.length > 0;
	}
	return projected;
}

/**
 * Projects a device list through the same bounded public covenant.
 *
 * @param {Array<object>} values Devices already authorized for the account.
 * @returns {Array<object>} Compact public witnesses with manifest identity preserved.
 */
function devices(values = []) {
	return Array.isArray(values) ? values.map(device) : [];
}

module.exports = {
	device,
	devices
};
