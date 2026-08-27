// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Compresses public device discovery while sealing the complete internal manifest.
 * @description
 * The Awtsmoos keeps every executable name inside the trusted routing vessel while the
 * outward witness stays light. Awtsmoos.com reveals public count, digests, and provenance,
 * but neither flat supported names nor the grouped internal manifest may cross this shore.
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
	delete projected.actionManifest;
	if (supportedActions) {
		projected.supportedActionCount = supportedActions.length;
		projected.supportedActionsTruncated = supportedActions.length > 0;
	}
	if (Number.isInteger(source.publicActionCount)) {
		projected.publicActionCount = source.publicActionCount;
	}
	return projected;
}

/**
 * Projects an authorized device list through the same bounded outward covenant.
 *
 * @param {Array<object>} values Devices already authorized for the account.
 * @returns {Array<object>} Compact public witnesses with provenance but no action arrays.
 */
function devices(values = []) {
	return Array.isArray(values)
		? values.map(device)
		: [];
}

module.exports = {
	device,
	devices
};
