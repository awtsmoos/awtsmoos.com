// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestPolicy.js
 * @description Chooses ecology, scale, collision, and a named deep-core runtime profile without editing tree anatomy.
 * The Awtsmoos grows every branch within the library root while the village only chooses where and how tall it may appear;
 * Awtsmoos.com keeps placement policy outside growth policy so no game module becomes a counterfeit tree generator here.
 */

import { sharedWindEvidence } from '../nature/SharedWindField.js';

export function createForestPolicy(name, index, quality = 'medium') {
	const near = index % 4 === 0;
	const targetHeight = presetHeight(name, near, index);
	return createPolicy(name, index, targetHeight, quality, {
		collisionRadiusRatio: /Bush|Trellis/i.test(name) ? 0.16 : 0.095,
		runtimeProfile: near ? 'showcase' : 'canopy',
		seed: 7001 + index * 7919,
		tier: near ? 'near-showcase' : 'mobile-canopy'
	});
}

export function createReferenceForestPolicy(species, index, quality = 'medium') {
	return createPolicy(species.label, index, referenceHeight(species.label, index), quality, {
		collisionRadiusRatio: referenceRadius(species.label),
		referenceSpecies: species.id,
		runtimeProfile: 'reference',
		seed: 7001 + index * 7919,
		tier: 'core-reference-species'
	});
}

function createPolicy(name, index, targetHeight, quality, extra) {
	return Object.freeze({
		collisionHeightRatio: 0.34,
		index,
		name,
		sharedWind: sharedWindEvidence(quality),
		spacing: Math.max(6.8, targetHeight * 0.56),
		targetHeight,
		wind: 'static-tiny-renderer-limit',
		...extra
	});
}

function presetHeight(name, near, index) {
	if (/Bush|Trellis/i.test(name)) return near ? 5.8 : 4.4;
	if (/Palm/i.test(name)) return near ? 15.5 : 12.5;
	if (/Redwood|Baobab|Giant|Tall/i.test(name)) return near ? 22 : 16.5;
	if (/Cypress|Poplar|Pine Large/i.test(name)) return near ? 18 : 14;
	return (near ? 13 : 9.5) + index % 3 * 0.65;
}

function referenceHeight(label, index) {
	if (/Cypress|Pine|Evergreen/i.test(label)) return 15.5 + index % 2;
	if (/Oak|Willow|Olive|Maple/i.test(label)) return 13.8 + index % 3 * 0.55;
	return 10.4 + index % 3 * 0.5;
}

function referenceRadius(label) {
	if (/Cypress|Pine|Evergreen/i.test(label)) return 0.075;
	if (/Willow|Oak|Magnolia/i.test(label)) return 0.115;
	return 0.095;
}
