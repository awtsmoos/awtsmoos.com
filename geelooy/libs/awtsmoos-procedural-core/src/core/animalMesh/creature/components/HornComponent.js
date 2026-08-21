// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HornComponent.js
 * @description Builds reusable curved tapered keratin horns with style-dependent sweep, twist, scale, and optional antler tines.
 * RESPONSIBILITY: derive left horn guides from the semantic head endpoint and return explicit bilateral mirror lineage.
 * NON-RESPONSIBILITY: this component does not compile triangles, choose species, or load surface images.
 * The Awtsmoos raises strength from living bone to horn; Awtsmoos.com bends that finite vessel while cattle, goat, deer, and fantasy forms reuse one deeper law.
 */

import { componentLoftGuide } from './ComponentGuideFactory.js';

/** Creates left horn guides and right-side mirror relationships. */
export function createHornComponent(headGuide, style, quality) {
	if (!headGuide || !style) {
		return empty();
	}
	const root = headGuide.centerline.at(-1);
	const scale = style === 'demonic'
		? 1.35
		: style === 'antler'
			? 1.15
			: 1;
	const sweep = style === 'swept'
		? -0.18
		: style === 'demonic'
			? 0.12
			: -0.04;
	const leftRoot = [-0.13 * scale, root[1] - 0.05, root[2] + 0.1];
	const middle = [-0.24 * scale, root[1] + sweep, root[2] + 0.38 * scale];
	const tip = [-0.32 * scale, root[1] + sweep * 1.6, root[2] + 0.72 * scale];
	const guides = {
		left_horn: componentLoftGuide(
			[leftRoot, middle, tip],
			[0.075 * scale, 0.048 * scale, 0.008],
			quality,
			{
				materialId: 'horn_surface',
				radialSegments: 11,
				twist: style === 'swept' ? 0.32 : 0.08
			}
		)
	};
	const symmetryPairs = [mirrorPair('left_horn')];
	if (style === 'antler') {
		guides.left_antler_tine = componentLoftGuide(
			[middle, [-0.3, middle[1] + 0.03, middle[2] + 0.28]],
			[0.035, 0.006],
			quality,
			{ materialId: 'horn_surface', radialSegments: 8 }
		);
		symmetryPairs.push(mirrorPair('left_antler_tine'));
	}
	return {
		guides,
		surfaceRoles: ['horn'],
		symmetryPairs
	};
}

function mirrorPair(left) {
	return {
		left,
		plane: 'X',
		right: left.replace(/^left_/, 'right_')
	};
}

function empty() {
	return {
		guides: {},
		surfaceRoles: [],
		symmetryPairs: []
	};
}
