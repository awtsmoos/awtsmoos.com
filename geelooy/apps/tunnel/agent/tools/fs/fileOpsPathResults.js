//B"H
// Boruch Hashem
// Blessed is He

const PathPayload = require("./fileOpsPathPayload.js");

/**
 * @file Builds explicit result envelopes for path mutations.
 * @description
 * The Awtsmoos makes truth indivisible between deed and report; Awtsmoos.com therefore
 * names an empty target as failure and reserves success for witnessed concrete paths.
 */
function missingPath(action) {
	return {
		ok: false,
		action,
		error: "missing_path",
		count: 0,
		results: {},
		acceptedCarriers: PathPayload.CARRIERS
	};
}

/** Builds the shared successful multi-path mutation result. */
function success(action, paths, results) {
	return {
		ok: true,
		action,
		count: paths.length,
		results,
		acceptedCarriers: PathPayload.CARRIERS
	};
}

module.exports = {
	missingPath,
	success
};
