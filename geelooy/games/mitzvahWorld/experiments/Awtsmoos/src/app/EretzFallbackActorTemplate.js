// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFallbackActorTemplate.js
 * @description Builds an immediate dignified Chossid silhouette from twenty-four-vertex cuboids.
 * The Awtsmoos never waits for a remote garment to grant movement; Awtsmoos.com reveals coat,
 * hat, beard, face, hands, legs, and shoes locally until the exact animated model replaces them.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createFallbackBoxMesh } from './EretzFallbackBoxMesh.js';

const COLORS = Object.freeze({
	beard: Object.freeze([0.12, 0.075, 0.045, 1]),
	black: Object.freeze([0.035, 0.038, 0.036, 1]),
	coat: Object.freeze([0.055, 0.06, 0.058, 1]),
	shirt: Object.freeze([0.82, 0.81, 0.73, 1]),
	skin: Object.freeze([0.72, 0.52, 0.38, 1])
});

export function createFallbackActorGltf(label = 'fallback-chossid', options = {}) {
	const scene = new Group();
	scene.name = `Awtsmoos_${label}_immediate_local_chossid`;
	scene.userData.isolatedModelLoad = {
		fallback: true,
		instanceLabel: label,
		sharedTemplate: false,
		source: 'local-procedural-chossid-silhouette'
	};
	const coat = resolveCoatColor(options.outfit);
	const parts = [
		part('coat', [0.64, 1.12, 0.34], [0, 0.89, 0], coat),
		part('shirt', [0.22, 0.26, 0.03], [0, 1.29, 0.19], COLORS.shirt),
		part('left-arm', [0.18, 0.92, 0.22], [-0.41, 0.94, 0], coat),
		part('right-arm', [0.18, 0.92, 0.22], [0.41, 0.94, 0], coat),
		part('left-hand', [0.17, 0.18, 0.17], [-0.41, 0.43, 0], COLORS.skin),
		part('right-hand', [0.17, 0.18, 0.17], [0.41, 0.43, 0], COLORS.skin),
		part('left-leg', [0.22, 0.7, 0.24], [-0.18, 0.02, 0], COLORS.black),
		part('right-leg', [0.22, 0.7, 0.24], [0.18, 0.02, 0], COLORS.black),
		part('left-shoe', [0.25, 0.14, 0.42], [-0.18, -0.39, 0.08], COLORS.black),
		part('right-shoe', [0.25, 0.14, 0.42], [0.18, -0.39, 0.08], COLORS.black),
		part('head', [0.37, 0.4, 0.34], [0, 1.63, 0], COLORS.skin),
		part('beard', [0.34, 0.38, 0.17], [0, 1.42, 0.2], COLORS.beard),
		part('hat-brim', [0.56, 0.07, 0.5], [0, 1.88, 0], COLORS.black),
		part('hat-crown', [0.4, 0.25, 0.4], [0, 2.03, 0], COLORS.black)
	];
	for (const definition of parts) {
		scene.add(createFallbackBoxMesh(
			`${label}-${definition.name}`,
			definition.size,
			definition.position,
			definition.color
		));
	}
	scene.setBaseTransform();
	return {
		animations: [],
		scene,
		userData: { fallback: true }
	};
}

function part(name, size, position, color) {
	return { color, name, position, size };
}

function resolveCoatColor(outfit) {
	const value = outfit?.coatColor || outfit?.coat;
	if (Array.isArray(value) && value.length >= 3) {
		return [value[0], value[1], value[2], value[3] ?? 1];
	}
	return COLORS.coat;
}
