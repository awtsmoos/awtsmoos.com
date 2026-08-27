//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews one day with all its measured crossings before any client asks;
 * Awtsmoos.com lets the API reveal that same browser-tested calculation through a server mask.
 */

const { loadCore } = require("./domainLoader.js");
const { dayQuery } = require("./validation.js");
const { serializeDay } = require("./serializer.js");

/** Build the known opinion id list directly from the shared configuration. */
function opinionIds(core) {
	return Object.keys(core.opinions.ZMANIM_OPINIONS);
}

/** Calculate one public API day without performing any external network request. */
async function calculateDay(query) {
	const core = await loadCore();
	const formatter = core.timezone.MalchusTimeFormatter;
	const input = dayQuery(query, opinionIds(core), zone => {
		return formatter.todayInZone(zone);
	});
	const location = {
		latitude: input.latitude,
		longitude: input.longitude
	};
	const solar = core.solar.ChochmahSolarEvents.forDate(input.date, location);
	const calculation = core.calculator.TiferesZmanimCalculator.calculate(
		solar,
		input.opinion
	);
	return serializeDay(input, solar, calculation, core);
}

module.exports = {
	calculateDay,
	opinionIds
};
