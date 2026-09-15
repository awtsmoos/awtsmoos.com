//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives the measured day many doorways while every doorway reaches one truth;
 * Awtsmoos.com mounts zmanim, Jewish-calendar enrichment, comparison, search, ranges, metadata,
 * and semantic embeds beneath one owned read-only API roof.
 */

const { calculateCalendar } = require("./lib/calendarService.js");
const { calculateComparison } = require("./lib/comparisonService.js");
const { calculateDay } = require("./lib/dayService.js");
const { renderEmbed } = require("./lib/embedService.js");
const { runHtml } = require("./lib/htmlResponse.js");
const { calculateRange } = require("./lib/rangeService.js");
const { searchLocations } = require("./lib/locationService.js");
const { compareUsno } = require("./lib/usnoService.js");
const {
	healthPayload,
	methodologyPayload,
	opinionsPayload
} = require("./lib/metadataService.js");
const { presentationOptionsPayload } = require("./lib/presentationService.js");
const { run } = require("./lib/response.js");

/** Mount the complete read-only sacred-time public API beneath the owning derech. */
async function dynamicRoutes(info) {
	await info.use({
		"/": async () => run(info, calculateDay),
		"/day": async () => run(info, calculateDay),
		"/calendar": async () => run(info, calculateCalendar),
		"/compare": async () => run(info, calculateComparison),
		"/range": async () => run(info, calculateRange),
		"/location": async () => run(info, searchLocations),
		"/opinions": async () => run(info, opinionsPayload),
		"/methodology": async () => run(info, methodologyPayload),
		"/options": async () => run(info, presentationOptionsPayload),
		"/embed": async () => runHtml(info, renderEmbed),
		"/usno": async () => run(info, compareUsno),
		"/health": async () => run(info, healthPayload)
	});
	return null;
}

module.exports = {
	dynamicRoutes
};
