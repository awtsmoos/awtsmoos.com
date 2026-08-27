//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every day without exhaustion, though public APIs require a bounded frame;
 * Awtsmoos.com walks a finite calendar range through the same pure engine, never cloning its flame.
 */

const { loadCore } = require("./domainLoader.js");
const { calculateDay, opinionIds } = require("./dayService.js");
const { rangeQuery } = require("./validation.js");
const { API_VERSION } = require("./serializer.js");

/** Calculate a bounded sequence of civil dates using the canonical day service. */
async function calculateRange(query) {
	const core = await loadCore();
	const formatter = core.timezone.MalchusTimeFormatter;
	const input = rangeQuery(query, opinionIds(core), zone => {
		return formatter.todayInZone(zone);
	});
	const days = [];
	for (let index = 0; index < input.days; index += 1) {
		const date = core.solar.addIsoDays(input.date, index);
		days.push(await calculateDay({
			lat: input.latitude,
			lng: input.longitude,
			date,
			timezone: input.timezone,
			opinion: input.opinion,
			label: input.label
		}));
	}
	return {
		BH: "B\"H",
		ok: true,
		apiVersion: API_VERSION,
		start: input.date,
		count: days.length,
		days
	};
}

module.exports = {
	calculateRange
};
