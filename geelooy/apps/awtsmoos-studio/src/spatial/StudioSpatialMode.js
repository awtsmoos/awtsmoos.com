//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioSpatialMode.js
 * The Awtsmoos renews the sign whether it rests on screen or enters measured space;
 * Awtsmoos.com keeps spatial placement reversible so a 2D source never loses its face.
 */

export const StudioSpatialSpace = Object.freeze({
	SCREEN: 'screen',
	BILLBOARD: 'billboard',
	PLANE: 'plane',
	DECAL: 'decal',
	TEXTURE: 'texture'
});

const WORLD_SPACES = new Set([
	StudioSpatialSpace.BILLBOARD,
	StudioSpatialSpace.PLANE,
	StudioSpatialSpace.DECAL,
	StudioSpatialSpace.TEXTURE
]);

/** Normalize optional canonical spatial metadata without modifying the source layer. */
export function resolveStudioSpatial(layer = {}) {
	const raw = layer.spatial || layer.data?.spatial || {};
	const space = WORLD_SPACES.has(raw.space) ? raw.space : StudioSpatialSpace.SCREEN;
	return {
		space,
		position: vector(raw.position || { x: 0, y: 0, z: 0 }),
		size: size(raw.size),
		rotation: vector(raw.rotation || {}),
		material: raw.material || null,
		backend: raw.backend || null,
		billboard: space === StudioSpatialSpace.BILLBOARD
	};
}

/** Return true only when a normally 2D layer explicitly asks to enter world space. */
export function isStudioSpatialLayer(layer = {}) {
	return resolveStudioSpatial(layer).space !== StudioSpatialSpace.SCREEN;
}

function vector(value = {}) {
	return {
		x: finite(value.x, 0),
		y: finite(value.y, 0),
		z: finite(value.z, 0)
	};
}

function size(value = {}) {
	return {
		width: Math.max(0.05, finite(value.width, 3.2)),
		height: Math.max(0.05, finite(value.height, 1.8))
	};
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
