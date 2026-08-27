// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FeatherComponent.js
 * @description Builds one feather as a tapered shaft plus a broad double-sided vane membrane with explicit feather surface meaning.
 * RESPONSIBILITY: create reusable renderer-neutral shaft/vane guides from root, direction, length, width, and quality.
 * NON-RESPONSIBILITY: this component does not arrange a whole wing fan or animate feather flutter.
 * The Awtsmoos hides strength in a narrow shaft and breadth in a light vane; Awtsmoos.com keeps both forms joined so flight feathers read as feathers rather than tubes or flat random cards.
 */

import {
	componentLoftGuide,
	componentMembraneGuide
} from './ComponentGuideFactory.js';

/** Creates shaft and vane guides for one feather. */
export function createFeatherComponent(id, root, direction, length, width, quality) {
	const tip = add(root, scale(direction, length));
	const side = [width * 0.5, 0, width * 0.1];
	const shoulder = add(root, scale(direction, length * 0.18));
	return {
		guides: {
			[`${id}_shaft`]: componentLoftGuide(
				[root, tip],
				[Math.max(0.008, width * 0.07), 0.003],
				quality,
				{ materialId: 'feather_surface', radialSegments: 6 }
			),
			[`${id}_vane`]: componentMembraneGuide([
				add(shoulder, side),
				tip,
				add(shoulder, scale(side, -1)),
				root
			], 'feather_surface', true)
		},
		surfaceRoles: ['feather']
	};
}

function add(left, right) {
	return left.map((value, index) => value + right[index]);
}

function scale(vector, amount) {
	return vector.map(value => value * amount);
}
