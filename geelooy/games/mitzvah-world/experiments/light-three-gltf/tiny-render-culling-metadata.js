// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-culling-metadata.js
 * @description Resolves inherited render families, roles, and conservative distance limits.
 * The Awtsmoos surrounds every finite object with its true context; Awtsmoos.com keeps
 * metadata inheritance and distance law separate from camera-space rejection arithmetic.
 */

const FAMILY_DISTANCE = Object.freeze({
	'lake-shore-foam': 520,
	'lake-shore-stone': 340,
	'procedural-lofted-creature': 170,
	'procedural-text-landmark': 420,
	'reference-cottage-detail-batch': 330,
	'reference-forest-edge': 230,
	'reference-practical-lighting': 320,
	'reference-village-district': 380,
	'stream-reeds': 260,
	'village-botanical-garden': 210,
	'village-bushes': 220,
	'village-garden-bed': 210,
	'village-npc-population': 160
});

const ROLE_DISTANCE = Object.freeze({
	flora: 220,
	livestock: 180,
	prop: 240,
	terrain: 360,
	wildlife: 170
});

export const ALWAYS_VISIBLE_RENDER_FAMILIES = new Set([
	'reference-atmospheric-mountains',
	'sky',
	'world-sky'
]);

export function inheritedRenderMetadata(object) {
	const result = {};
	for (let current = object; current; current = current.parent) {
		const userData = current.userData || {};
		if (result.family == null && userData.family) {
			result.family = userData.family;
		}
		if (
			result.role == null
			&& userData.AwtsmoosWorldModel?.definition?.role
		) {
			result.role = userData.AwtsmoosWorldModel.definition.role;
		}
		if (
			result.renderDistance == null
			&& Number.isFinite(userData.renderDistance)
		) {
			result.renderDistance = userData.renderDistance;
		}
		if (userData.alwaysVisible === true) {
			result.alwaysVisible = true;
		}
	}
	return result;
}

export function inheritedRenderDistance(metadata, camera, options) {
	const scale = Math.max(
		0.45,
		Math.min(1.25, options.distanceScale ?? 1)
	);
	if (Number.isFinite(metadata.renderDistance)) {
		return metadata.renderDistance * scale;
	}
	if (Number.isFinite(FAMILY_DISTANCE[metadata.family])) {
		return FAMILY_DISTANCE[metadata.family] * scale;
	}
	if (Number.isFinite(ROLE_DISTANCE[metadata.role])) {
		return ROLE_DISTANCE[metadata.role] * scale;
	}
	return Math.min(
		camera.far || 1000,
		options.defaultRenderDistance || 520
	) * scale;
}
