// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingProfile.js
 * @description Normalizes human-scale building envelope, stories, identity, and expansion policy before geometry is planned.
 * The Awtsmoos, Atzmus beyond wall and measure, renews the dwelling before width, story, or threshold receives a finite name;
 * Awtsmoos.com lets one architectural keli hold stable dimensions while BuildingLayout reveals circulation through another flame.
 * This file owns envelope normalization only; it deliberately does not create geometry, layout walls, or sample terrain.
 */

import { createBuildingLayout } from './BuildingLayout.js';

export const HUMAN_SCALE_BUILDING_DOOR = Object.freeze({
	height: 3.1,
	width: 2.1
});

/**
 * Creates one immutable normalized building profile.
 * @param {object} values Building dimensions, placement, identity, and policy.
 * @returns {Readonly<object>} Canonical architectural profile consumed by building planners.
 * @throws {Error} When footprint expansion violates the caller's declared minimum.
 */
export function createBuildingProfile(values = {}) {
	const depth = positive(values.depth);
	const width = positive(values.width);
	const legacy = Object.freeze({
		depth: positive(values.legacyDepth, depth),
		width: positive(values.legacyWidth, width)
	});
	const wallThickness = positive(values.wallThickness, 0.68);
	const storyHeight = positive(values.storyHeight, 5.2);
	const floors = positiveInteger(values.floors, 1);
	const expansion = width * depth / (legacy.width * legacy.depth);
	const minimumExpansion = positive(values.minimumFootprintExpansion, 1);
	if (expansion < minimumExpansion) {
		throw new Error(
			`B"H | ${values.id || 'building'} footprint expansion ${expansion.toFixed(2)} is below ${minimumExpansion}`
		);
	}
	const interiorWidth = width - wallThickness * 2;
	const innerDepth = depth - wallThickness * 2;
	const hallWidth = positive(values.hallWidth, 7.2);
	const wingWidth = (interiorWidth - hallWidth - wallThickness * 2) / 2;
	const layout = createBuildingLayout({
		hallWidth,
		innerDepth,
		interiorWidth,
		storyHeight,
		values,
		wallThickness,
		wingWidth
	});
	return Object.freeze({
		...values,
		depth,
		doorHeight: positive(values.doorHeight, HUMAN_SCALE_BUILDING_DOOR.height),
		doorWidth: positive(values.doorWidth, HUMAN_SCALE_BUILDING_DOOR.width),
		family: String(values.family || 'building'),
		floorThickness: positive(values.floorThickness, 0.3),
		floors,
		footprintExpansion: expansion,
		foundationThickness: positive(values.foundationThickness, 0.7),
		id: String(values.id || 'building'),
		layout,
		legacy,
		metadataIdKey: String(values.metadataIdKey || 'buildingId'),
		roofHeight: positive(values.roofHeight, 1.15),
		storyHeight,
		wallThickness,
		width,
		x: finite(values.x, 0),
		yaw: finite(values.yaw, 0),
		z: finite(values.z, 0)
	});
}

/**
 * Returns immutable dimensional evidence for diagnostics, tests, and AI-readable receipts.
 * @param {object} profile Canonical building profile.
 * @returns {Readonly<object>} Stable footprint, door, floor, and world-size evidence.
 */
export function buildingDimensionEvidence(profile) {
	return Object.freeze({
		door: Object.freeze({
			height: profile.doorHeight,
			width: profile.doorWidth
		}),
		expandedArea: profile.width * profile.depth,
		expansion: Number(profile.footprintExpansion.toFixed(3)),
		floors: profile.floors,
		legacyArea: profile.legacy.width * profile.legacy.depth,
		parentScale: 'identity',
		worldDepth: profile.depth,
		worldWidth: profile.width
	});
}

function positiveInteger(value, fallback) {
	return Math.max(1, Math.round(finite(value, fallback)));
}

function positive(value, fallback = 1) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
