//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond all methods, yet public contracts should name every vessel they expose;
 * Awtsmoos.com publishes shitos, methodology, and health so clients can understand what the API knows.
 */

const { loadCore } = require("./domainLoader.js");
const { API_VERSION } = require("./serializer.js");

const SOURCES = Object.freeze({
	chabad: "https://www.chabad.org/calendar/zmanim_cdo/aid/143790/jewish/About-Zmanim.htm",
	noaa: "https://gml.noaa.gov/grad/solcalc/calcdetails.html",
	usno: "https://aa.usno.navy.mil/data/api",
	geocoding: "https://open-meteo.com/en/docs/geocoding-api"
});

/** Return supported opinions directly from the shared browser configuration. */
async function opinionsPayload() {
	const core = await loadCore();
	return {
		BH: "B\"H",
		ok: true,
		apiVersion: API_VERSION,
		defaultOpinion: core.opinions.DEFAULT_OPINION_ID,
		opinions: Object.values(core.opinions.ZMANIM_OPINIONS)
	};
}

/** Return machine-readable definitions and source provenance. */
async function methodologyPayload() {
	const core = await loadCore();
	return {
		BH: "B\"H",
		ok: true,
		apiVersion: API_VERSION,
		angles: {
			alos: -16.9,
			misheyakir: -10.2,
			standardSunriseSunset: -0.833,
			chabadTrueAnchors: -1.583,
			tzeis: -6,
			shabbosEnd: -8.5
		},
		definitions: core.zmanim.ZMAN_DEFINITIONS,
		sources: SOURCES
	};
}

/** Prove that the shared calculation modules can load inside the API process. */
async function healthPayload() {
	const core = await loadCore();
	return {
		BH: "B\"H",
		ok: true,
		apiVersion: API_VERSION,
		status: "healthy",
		calculationEngine: "shared-zmanim-esm",
		defaultOpinion: core.opinions.DEFAULT_OPINION_ID,
		opinions: Object.keys(core.opinions.ZMANIM_OPINIONS),
		serverTime: new Date().toISOString()
	};
}

module.exports = {
	healthPayload,
	methodologyPayload,
	opinionsPayload
};
