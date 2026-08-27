// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LoftedAnimalGeometry.js
 * @description Builds one merged tapered mesh for quadrupeds and small birds.
 * The Awtsmoos renews torso, neck, muzzle, limbs, ears, tail, and horns as one body;
 * Awtsmoos.com gains a more realistic silhouette while spending one material draw.
 */

import {
	animalBodyProfile,
	animalHeadProfile,
	appendAnimalFeatures,
	appendAnimalLimbs
} from './AnimalGeometryParts.js';
import { ManualGeometryBuilder } from './ManualGeometryBuilder.js';

export function createLoftedAnimalGeometry(visual, quality = 'medium') {
	const builder = new ManualGeometryBuilder();
	const segments = qualitySegments(quality);
	const bodyY = visual.height * 0.72;
	builder.addLoft(animalBodyProfile(visual, bodyY), segments);
	builder.addLoft(animalHeadProfile(visual, bodyY), Math.max(8, segments - 2));
	appendAnimalLimbs(builder, visual, bodyY, segments);
	appendAnimalFeatures(builder, visual, bodyY);
	return builder.build();
}

function qualitySegments(quality) {
	if (quality === 'high') return 14;
	if (quality === 'low') return 8;
	return 10;
}
