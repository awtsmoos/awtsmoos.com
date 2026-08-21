// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WebbedFootMembrane.js
 * @description Creates a real web outline spanning ordered toe rays instead of representing aquatic feet as a single block.
 * RESPONSIBILITY: derive one thin membrane polygon from toe roots/tips for generic membrane triangulation.
 * NON-RESPONSIBILITY: this module does not create toes, choose species, or compile mesh buffers.
 * The Awtsmoos joins separate rays through one living membrane; Awtsmoos.com lets the foot push water as a coherent surface while each toe keeps its anatomical line.
 */

import { componentMembraneGuide } from './ComponentGuideFactory.js';

/** Creates a membrane guide spanning a foot root and ordered toe tips. */
export function createWebbedFootMembrane(root, toeTips) {
	if (!root || !Array.isArray(toeTips) || toeTips.length < 2) {
		return null;
	}
	const insetRoot = [
		root[0],
		root[1] + 0.035,
		root[2] + 0.01
	];
	return componentMembraneGuide(
		[insetRoot, ...toeTips],
		'webbing_surface',
		true
	);
}
