//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond one shita and many while server HTML receives calculation and presentation as separate truthful lights;
 * Awtsmoos.com chooses single-day or selected-opinion data here, then hands one static document the exact shared results without creating another night.
 */

const { calculateComparison } = require("./comparisonService.js");
const { calculateDay } = require("./dayService.js");
const { renderEmbedDocument } = require("./embedHtml.js");
const { interactiveZmanimHref } = require("./interactiveLink.js");
const { presentationQuery } = require("./presentationService.js");

/** Calculate canonical single/comparison data and render it through the static presentation vessel. */
async function renderEmbed(query = {}) {
	const presentation = await presentationQuery(query);
	const comparison = wantsComparison(query)
		? await calculateComparison(query)
		: null;
	const day = comparison
		? primaryDayFromComparison(comparison)
		: await calculateDay(query);
	const interactiveHref = interactiveZmanimHref(query, presentation);
	return renderEmbedDocument(day, presentation, interactiveHref, Date.now(), comparison);
}

/** Any explicit selected-opinion parameter uses the same selection semantics as the browser. */
function wantsComparison(query) {
	return String(query.opinions || "").trim().length > 0;
}

/** Rehydrate the primary day shape from a deduplicated comparison envelope for existing markup. */
function primaryDayFromComparison(comparison) {
	const primary = comparison.calculations.find(calculation => {
		return calculation.opinion.id === comparison.primaryOpinion.id;
	}) || comparison.calculations[0];
	return {
		BH: comparison.BH,
		ok: comparison.ok,
		apiVersion: comparison.apiVersion,
		date: comparison.date,
		location: comparison.location,
		opinion: primary.opinion,
		shaahZmanis: primary.shaahZmanis,
		anchors: comparison.anchors,
		zmanim: primary.zmanim,
		warnings: comparison.warnings
	};
}

module.exports = {
	renderEmbed
};
