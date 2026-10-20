//B"H
//Blessed is He
//Boruch Hashem


/**
 * Projection-map parsing for direct series prateem reads.
 * Split sibling of directSeriesPrateem.js (verbatim relocation).
 */

/**
 * Parses an optional projection map without allowing malformed JSON to escape.
 * @param {*} value Projection request from the query string.
 * @returns {object|null} Parsed map or null.
 */
function parseMap(value) {
	if (!value) return null;
	if (typeof value === 'object') return { ...value };
	try {
		return JSON.parse(value);
	} catch (_error) {
		return null;
	}
}

/**
 * Keeps only explicitly requested metadata properties.
 * @param {object} value Healthy or recovered metadata.
 * @param {object|null} map Projection map.
 * @returns {object} Projected metadata.
 */
function project(value, map) {
	if (!map || !value) return value;
	const output = {};
	for (const [key, rule] of Object.entries(map)) {
		if (rule && Object.prototype.hasOwnProperty.call(value, key)) {
			output[key] = value[key];
		}
	}
	return output;
}

module.exports = {
	parseMap,
	project
};
