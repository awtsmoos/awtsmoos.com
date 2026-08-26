// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingPorch.js
 * @description Creates optional porch deck, canopy, steps, and support posts as renderer-neutral structural definitions.
 * The Awtsmoos renews approach before threshold and dwelling can seem apart;
 * Awtsmoos.com gives porch, post, canopy, and step their own stable roles so gameplay and renderers share one architectural heart.
 */

import { buildingBox } from './BuildingMath.js';

/** Creates an optional front porch with bounded human-scale proportions. */
export function createBuildingPorch(profile, materials, groundY) {
	if (profile.porch === false || profile.porchDepth === 0) {
		return [];
	}
	const depth = positive(profile.porchDepth, 2.2);
	const width = Math.min(profile.width * 0.92, positive(profile.porchWidth, profile.width * 0.56));
	const deckThickness = positive(profile.porchThickness, 0.18);
	const canopyHeight = positive(profile.porchCanopyHeight, 2.65);
	const canopyThickness = Math.max(0.1, deckThickness * 0.75);
	const centerZ = profile.depth / 2 + depth / 2;
	const deckY = groundY + deckThickness / 2;
	const postHeight = canopyHeight - deckThickness;
	const postOffset = Math.max(0.3, width / 2 - 0.22);
	return [
		buildingBox(profile, materials.porch, 'porch-deck', 0, deckY, centerZ, { x: width, y: deckThickness, z: depth }, { role: 'porch-deck', walkable: true }),
		buildingBox(profile, materials.porch, 'porch-canopy', 0, groundY + canopyHeight, centerZ, { x: width + 0.4, y: canopyThickness, z: depth + 0.4 }, { role: 'porch-canopy' }),
		buildingBox(profile, materials.trim, 'porch-post-left', -postOffset, groundY + deckThickness + postHeight / 2, profile.depth / 2 + depth * 0.78, { x: 0.22, y: postHeight, z: 0.22 }, { role: 'porch-support' }),
		buildingBox(profile, materials.trim, 'porch-post-right', postOffset, groundY + deckThickness + postHeight / 2, profile.depth / 2 + depth * 0.78, { x: 0.22, y: postHeight, z: 0.22 }, { role: 'porch-support' }),
		...porchSteps(profile, materials, groundY, width, depth)
	];
}

/** Creates two broad approach steps in front of the porch deck. */
function porchSteps(profile, materials, groundY, width, depth) {
	const stepDepth = 0.46;
	const stepHeight = 0.16;
	const frontEdge = profile.depth / 2 + depth;
	return [0, 1].map(index => buildingBox(
		profile,
		materials.porch,
		`porch-step-${index + 1}`,
		0,
		groundY + stepHeight * (index + 0.5),
		frontEdge + stepDepth * (index + 0.5),
		{
			x: width * (0.62 + index * 0.14),
			y: stepHeight,
			z: stepDepth
		},
		{
			role: 'porch-step',
			walkable: true
		}
	));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
