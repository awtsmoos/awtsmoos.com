//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is One before many shitos describe measured gates within the same created day;
 * Awtsmoos.com calculates one solar reality once, then lets every selected opinion reveal its zmanim without duplicating the sky on the way.
 */

const { comparisonQuery } = require("./comparisonValidation.js");
const { loadCore } = require("./domainLoader.js");
const { opinionIds } = require("./dayService.js");
const { serializeDay } = require("./serializer.js");

/** Calculate several supported profiles over one shared solar model and serialize each through the stable day contract. */
async function calculateComparison(query = {}) {
	const core = await loadCore();
	const formatter = core.timezone.MalchusTimeFormatter;
	const input = comparisonQuery(query, opinionIds(core), core.selection, zone => {
		return formatter.todayInZone(zone);
	});
	const location = {
		latitude: input.latitude,
		longitude: input.longitude
	};
	const solar = core.solar.ChochmahSolarEvents.forDate(input.date, location);
	const days = input.opinions.map(opinionId => {
		const calculation = core.calculator.TiferesZmanimCalculator.calculate(solar, opinionId);
		return serializeDay({ ...input, opinion: opinionId }, solar, calculation, core);
	});
	const primaryDay = days.find(day => day.opinion.id === input.opinion) || days[0];
	return comparisonEnvelope(primaryDay, days, input.opinions);
}

/** Deduplicate common day metadata while preserving fully serialized opinion-specific rows. */
function comparisonEnvelope(primaryDay, days, selectedOpinionIds) {
	return {
		BH: "B\"H",
		ok: true,
		apiVersion: primaryDay.apiVersion,
		date: primaryDay.date,
		location: primaryDay.location,
		primaryOpinion: primaryDay.opinion,
		selectedOpinionIds,
		anchors: primaryDay.anchors,
		calculations: days.map(day => {
			return {
				opinion: day.opinion,
				shaahZmanis: day.shaahZmanis,
				zmanim: day.zmanim
			};
		}),
		warnings: primaryDay.warnings
	};
}

module.exports = {
	calculateComparison
};
