//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives the measured day many doorways while every doorway reaches one truth;
 * Awtsmoos.com mounts health, search, ranges, methods, and zmanim through one transparent roof.
 */

const { calculateDay } = require("./lib/dayService.js");
const { calculateRange } = require("./lib/rangeService.js");
const { searchLocations } = require("./lib/locationService.js");
const { compareUsno } = require("./lib/usnoService.js");
const {
	healthPayload,
	methodologyPayload,
	opinionsPayload
} = require("./lib/metadataService.js");
const { run } = require("./lib/response.js");

/** Mount the complete read-only Zmanim public API beneath the owning derech. */
async function dynamicRoutes(info) {
	await info.use({
		"/": async () => {
			return run(info, calculateDay);
		},
		"/day": async () => {
			return run(info, calculateDay);
		},
		"/range": async () => {
			return run(info, calculateRange);
		},
		"/location": async () => {
			return run(info, searchLocations);
		},
		"/opinions": async () => {
			return run(info, opinionsPayload);
		},
		"/methodology": async () => {
			return run(info, methodologyPayload);
		},
		"/usno": async () => {
			return run(info, compareUsno);
		},
		"/health": async () => {
			return run(info, healthPayload);
		}
	});
	return null;
}

module.exports = {
	dynamicRoutes
};
