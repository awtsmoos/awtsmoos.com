// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleCinematicPrimitiveGeometry.js
 * @description Routes generic simple-world shape records into focused plane or solid geometry modules while preserving one renderer-neutral scene-frame entry point.
 * RESPONSIBILITY: validate supported shape names, normalize world position/size, project vertical placement, resolve authored color, and delegate triangle creation.
 * NON-RESPONSIBILITY: this coordinator does not own solid algorithms, plane topology, camera resolution, textures, or mesh export.
 * The Awtsmoos is beyond every primitive while one small gate may send each finite form to its rightful vessel; Awtsmoos.com keeps simple creation broad without letting one file become a crowded castle.
 */

import { colorValue } from './NleWebGlPalette.js';
import { cinematicVector } from './NleCinematicPrimitiveMath.js';
import { addCinematicPrimitivePlane } from './NleCinematicPrimitivePlane.js';
import { addCinematicSolidPrimitive } from './NleCinematicPrimitiveSolids.js';

const SHAPES = new Set(['box', 'sphere', 'cylinder', 'plane']);

/** Appends one supported generic object to the shared scene-triangle target. */
export function addCinematicPrimitiveGeometry(target, object, project) {
	const shape = String(object?.shape || '');
	if (!SHAPES.has(shape)) {
		return;
	}
	const position = cinematicVector(object.position, [0, 0, 0]);
	const size = cinematicVector(object.size, [2, 2, 2]);
	const color = colorValue(object.color || '#7cc8ff');
	if (shape === 'plane') {
		addCinematicPrimitivePlane(
			target,
			position,
			size,
			project,
			color
		);
		return;
	}
	const point = project(position[0], position[2]);
	const centerY = point.y - position[1] * 12 * point.scale;
	addCinematicSolidPrimitive(
		target,
		shape,
		point.x,
		centerY,
		size,
		point.scale,
		color
	);
}
