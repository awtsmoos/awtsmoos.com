//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file CinematicSkyMesh.js
 * @description Gives Core's physical atmosphere policy one shared camera-surrounding native mesh with bounded quality controls.
 * Procedural atmosphere is valid physical simulation rather than generated replacement material imagery; products may request fidelity,
 * but Core alone owns the sphere geometry, renderer material, shader-selection metadata, and safe subdivision bounds.
 */
import { MeshStandardMaterial } from '../../adapters/native/runtime.js';
import { createCinematicSkyGeometry } from './CinematicSkyGeometry.js';
import { createNativeGeometryMesh } from './NativeGeometryMesh.js';

/**
 * Create one Core-owned inward cinematic atmosphere mesh.
 * @param {object} options Radius, quality tier, optional explicit ring/segment counts, and stable name.
 * @returns {object} Native atmosphere mesh carrying explicit physical-procedural shader policy.
 */
export function createCinematicSkyMesh(options = {}) {
	const radius = Math.max(50, Number(options.radius || 420));
	const lowQuality = options.quality === 'low';
	const rings = boundedCount(options.rings, lowQuality ? 12 : 20, 4, 64);
	const segments = boundedCount(options.segments, lowQuality ? 24 : 40, 8, 128);
	const geometry = createCinematicSkyGeometry(radius, rings, segments);
	const material = new MeshStandardMaterial({
		color: [1, 1, 1, 1],
		doubleSided: true,
		name: 'Awtsmoos Core Atmosphere'
	});
	material.texturePolicy = {
		cameraCentered: true,
		generatedTextureAllowed: false,		proceduralShaderAllowed: true,
		proceduralSky: true,
		remoteOnly: false,
		semanticRole: 'world-sky-atmosphere'
	};
	const mesh = createNativeGeometryMesh(geometry, material, {
		family: 'world-sky-atmosphere',
		frustumCulled: false,
		name: options.name || 'Awtsmoos Core Cinematic Sky'
	});
	mesh.userData.renderDistance = Infinity;
	mesh.userData.skyGeometry = { radius, rings, segments };
	return mesh;
}

/** Bound compatibility fidelity so malformed authored values cannot create pathological sphere allocations. */
function boundedCount(value, fallback, minimum, maximum) {
	const count = Math.floor(Number(value ?? fallback));
	return Math.max(minimum, Math.min(maximum, Number.isFinite(count) ? count : fallback));
}
