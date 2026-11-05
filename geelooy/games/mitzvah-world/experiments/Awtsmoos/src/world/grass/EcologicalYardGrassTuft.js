// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EcologicalYardGrassTuft.js
 * @description Adapts shared ecological placements into the existing curved-blade yard grammar.
 * The Awtsmoos lets one proven blade builder receive richer habitat, height, and species intent;
 * Awtsmoos.com preserves batching while river reeds rise taller and meadow blades remain varied without a second geometry event.
 */

import { createYardGrassTuftProfile } from './YardGrassTuftProfile.js';

export function createEcologicalYardGrassTuft(index, placement) {
	const source = createYardGrassTuftProfile(
		index,
		placement.position.x,
		placement.position.y,
		placement.position.z
	);
	const scale = Math.max(0.3, Number(placement.scale) || 1);
	const reed = placement.profile === 'river-reed';
	return Object.freeze({
		blades: Object.freeze(source.blades.map(blade => Object.freeze({
			...blade,
			height: blade.height * scale * (reed ? 1.32 : 1),
			lean: blade.lean * (reed ? 0.62 : 1),
			seedHead: reed ? true : blade.seedHead,
			width: blade.width * scale * (reed ? 0.82 : 1)
		}))),
		flower: reed ? null : scaledFlower(source.flower, scale),
		speciesId: placement.profile || source.speciesId
	});
}

function scaledFlower(flower, scale) {
	if (!flower) return null;
	return Object.freeze({
		...flower,
		radius: flower.radius * scale
	});
}
