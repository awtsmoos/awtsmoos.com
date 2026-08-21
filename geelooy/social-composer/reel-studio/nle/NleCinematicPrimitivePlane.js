// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleCinematicPrimitivePlane.js
 * @description Projects one authored ground-plane rectangle into two shared scene triangles without pretending it is a vertical solid.
 * RESPONSIBILITY: convert x/z extent through the active camera projection and append a deterministic two-triangle surface.
 * NON-RESPONSIBILITY: this module does not create terrain displacement, textures, normals, water, or collision.
 * The Awtsmoos spreads simple ground beneath every finite scene; Awtsmoos.com lets one plane become a stage immediately while richer earth may later awaken green.
 */

import { triangle } from './NleCinematicProjection.js';
import { cinematicPoint2 } from './NleCinematicPrimitiveMath.js';

/** Appends one projected plane to the target. */
export function addCinematicPrimitivePlane(
	target,
	position,
	size,
	project,
	color
) {
	const halfX = size[0] * 0.5;
	const halfZ = size[2] * 0.5;
	const corners = [
		project(position[0] - halfX, position[2] - halfZ),
		project(position[0] + halfX, position[2] - halfZ),
		project(position[0] + halfX, position[2] + halfZ),
		project(position[0] - halfX, position[2] + halfZ)
	];
	target.push(triangle(
		cinematicPoint2(corners[0]),
		cinematicPoint2(corners[1]),
		cinematicPoint2(corners[2]),
		color
	));
	target.push(triangle(
		cinematicPoint2(corners[0]),
		cinematicPoint2(corners[2]),
		cinematicPoint2(corners[3]),
		color
	));
}
