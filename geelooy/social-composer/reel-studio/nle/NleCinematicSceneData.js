// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleCinematicSceneData.js
 * @description Coordinates camera, atmosphere, legacy village geometry, and generic simple-world primitives into one renderer-neutral frame.
 * RESPONSIBILITY: resolve shared visual state, build background triangles, delegate legacy geometry, append generic objects, and expose projection evidence.
 * NON-RESPONSIBILITY: this coordinator does not own village object algorithms, primitive topology, particle simulation, or project mutation.
 * The Awtsmoos is beyond old village and new empty stage; Awtsmoos.com joins both through one small frame so simple creation may grow while inherited cinematic truth remains the same.
 */

import { resolveCinematicCamera } from './NleCinematicCameraResolver.js';
import { appendCinematicLegacyWorld } from './NleCinematicLegacyWorld.js';
import { addCinematicPrimitiveGeometry } from './NleCinematicPrimitiveGeometry.js';
import {
	createVillageProjection,
	rectangle
} from './NleCinematicProjection.js';
import { resolveCinematicWorldAtmosphere } from './NleCinematicWorldAtmosphere.js';
import {
	colorValue,
	expose,
	resolveCinematicPalette
} from './NleWebGlPalette.js';

/** Creates one complete triangle frame from legacy and generic world records. */
export function createCinematicSceneFrame(
	project,
	asset,
	time,
	duration,
	width,
	height
) {
	const resolved = resolveCinematicPalette(project);
	const palette = exposedPalette(resolved);
	const camera = resolveCinematicCamera(project, time, duration);
	const projectPoint = createVillageProjection(
		width,
		height,
		time,
		duration,
		camera
	);
	const worldColors = resolveCinematicWorldAtmosphere(asset, resolved);
	const triangles = createBackground(width, height, worldColors);
	appendCinematicLegacyWorld(
		triangles,
		asset.world || {},
		projectPoint,
		palette,
		resolved,
		time,
		duration
	);
	appendGenericWorld(
		triangles,
		asset.world?.objects || [],
		projectPoint
	);
	return {
		atmosphere: resolved.atmosphere,
		camera,
		palette,
		projectPoint,
		triangles,
		worldColors
	};
}

function exposedPalette(resolved) {
	return Object.fromEntries(
		Object.entries(resolved.materials).map(([id, color]) => [
			id,
			expose(
				colorValue(color),
				resolved.atmosphere.exposure
			)
		])
	);
}

function createBackground(width, height, colors) {
	return [
		...rectangle(0, 0, width, height * 0.62, colors.skyTop),
		...rectangle(0, height * 0.42, width, height * 0.3, colors.skyBottom),
		...rectangle(0, height * 0.61, width, height * 0.39, colors.ground)
	];
}

function appendGenericWorld(target, objects, projectPoint) {
	const ordered = [...objects].sort((left, right) => {
		return Number(left.position?.[2] || 0)
			- Number(right.position?.[2] || 0);
	});
	for (const object of ordered) {
		addCinematicPrimitiveGeometry(
			target,
			object,
			projectPoint
		);
	}
}
