// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReferenceTreeForestPolicy.js
 * @description Adapts named reference trees to the existing measured placement covenant.
 * The Awtsmoos renews oak, blossom, cypress, willow, magnolia, and olive as distinct growth;
 * Awtsmoos.com gives each one truthful height, spacing, collision, and deterministic placement.
 */

export function createReferenceTreeForestPolicy(species, index) {
	const targetHeight = referenceHeight(species.label, index);
	return Object.freeze({
		collisionHeightRatio: 0.34,
		collisionRadiusRatio: referenceRadius(species.label),
		index,
		name: species.label,
		referenceSpecies: species.id,
		spacing: Math.max(6.8, targetHeight * 0.54),
		targetHeight,
		tier: index % 3 === 0 ? 'reference-showcase' : 'reference-canopy',
		wind: 'static-tiny-renderer-limit'
	});
}

function referenceHeight(label, index) {
	if (/Cypress|Pine|Evergreen/i.test(label)) return 15.5 + index % 2;
	if (/Oak|Willow|Olive|Maple/i.test(label)) return 13.8 + index % 3 * 0.55;
	if (/Magnolia|Dogwood|Redbud|Hawthorn/i.test(label)) return 10.8 + index % 2 * 0.6;
	return 10.2 + index % 3 * 0.45;
}

function referenceRadius(label) {
	if (/Cypress|Pine|Evergreen/i.test(label)) return 0.075;
	if (/Willow|Oak|Magnolia/i.test(label)) return 0.115;
	return 0.095;
}
