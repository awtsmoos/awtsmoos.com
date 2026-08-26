// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingRoofPlan.js
 * @description Chooses backward-compatible flat roofs or renderer-neutral watertight pitched roof solids from one building profile.
 * The Awtsmoos renews shelter before flatness, ridge, or hip receives a name; Awtsmoos.com lets old dwellings keep their garment
 * while new architecture reveals gable, hip, and shed law through one focused vessel rather than a competing house engine.
 */

import { buildingBox } from './BuildingMath.js';
import { createBuildingRoofSolid } from './BuildingRoofSolids.js';

const PITCHED_TYPES = new Set(['gable', 'hip', 'shed']);

/**
 * Creates one renderer-neutral roof definition while preserving the legacy flat roof by default.
 * @param {object} profile Normalized building profile.
 * @param {object} material Opaque roof material descriptor.
 * @param {number} baseY Top-of-wall roof datum.
 * @returns {object} Flat box or watertight manual solid definition.
 */
export function createBuildingRoof(profile, material, baseY) {
	const type = normalizeRoofType(profile.roofType);
	if (type === 'flat') return legacyFlatRoof(profile, material, baseY);
	const overhang = positive(profile.roofOverhang, 0.8);
	const rise = positive(profile.roofRise, Math.max(1, profile.width * 0.18));
	const thickness = positive(profile.roofThickness, 0.32);
	const width = profile.width + overhang * 2;
	const depth = profile.depth + overhang * 2;
	const mesh = createBuildingRoofSolid(type, width, depth, baseY, rise, thickness);
	const metadataIdKey = profile.metadataIdKey || 'buildingId';
	return {
		...material,
		faces: mesh.faces,
		id: `${profile.id}-roof-${type}`,
		position: { x: profile.x, y: 0, z: profile.z },
		rotation: { y: profile.yaw },
		shape: 'manual',
		solid: true,
		userData: {
			family: profile.family || 'building',
			[metadataIdKey]: profile.id,
			role: 'weather-roof',
			roof: Object.freeze({ overhang, rise, thickness, type })
		},
		vertices: mesh.vertices,
		walkable: false
	};
}

/** Returns immutable roof policy evidence without allocating geometry. */
export function buildingRoofEvidence(profile) {
	const type = normalizeRoofType(profile.roofType);
	return Object.freeze({
		overhang: positive(profile.roofOverhang, 0.8),
		rise: type === 'flat'
			? profile.roofHeight
			: positive(profile.roofRise, Math.max(1, profile.width * 0.18)),
		thickness: type === 'flat'
			? profile.roofHeight
			: positive(profile.roofThickness, 0.32),
		type
	});
}

function legacyFlatRoof(profile, material, baseY) {
	return buildingBox(
		profile,
		material,
		'roof',
		0,
		baseY + profile.roofHeight / 2,
		0,
		{
			x: profile.width + 1.6,
			y: profile.roofHeight,
			z: profile.depth + 1.6
		},
		{ role: 'weather-roof' }
	);
}

function normalizeRoofType(value) {
	const type = String(value || 'flat').toLowerCase();
	return PITCHED_TYPES.has(type) ? type : 'flat';
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
