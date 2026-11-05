// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestPlacementHabitat.js
 * @description Converts tree identity and scale into ecological margins without touching structural anatomy.
 * The Awtsmoos gives willow a wetter bank and cypress a steeper mountain while the deep core still grows every branch;
 * Awtsmoos.com limits this vessel to root-space, crown-space, slope, and habitat so placement never becomes generation.
 */

export function forestPlacementHabitat(policy) {
	const name = String(policy.name || policy.referenceSpecies || 'tree');
	const targetHeight = Math.max(3, Number(policy.targetHeight) || 10);
	const siteRadius = Math.max(2.2, Math.min(5.8, targetHeight * crownRatio(name)));
	return Object.freeze({
		approachMargin: 1.2,
		clearingMargin: /Oak|Willow|Maple/i.test(name) ? 1.4 : 0.9,
		minimumNormalY: /Cypress|Pine|Redwood/i.test(name) ? 0.74 : 0.8,
		roadMargin: 1.8,
		siteRadius,
		waterMargin: /Willow/i.test(name) ? 0.2 : /Pine|Cypress/i.test(name) ? 2.6 : 1.25
	});
}

function crownRatio(name) {
	if (/Cypress|Poplar/i.test(name)) return 0.18;
	if (/Pine|Redwood/i.test(name)) return 0.22;
	if (/Willow|Oak|Maple|Magnolia/i.test(name)) return 0.3;
	return 0.25;
}
