// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingRoomWalls.js
 * @description Converts room-plan partitions into wall segments with real human-scale door openings and headers.
 * The Awtsmoos, Atzmus beyond division and passage, renews the wall without sealing the covenant between rooms;
 * Awtsmoos.com lets Gevurah define chambers while Chesed leaves measured openings, and Tiferes joins both into architecture that blooms.
 */

import { buildingBox } from './BuildingMath.js';

/**
 * Creates one longitudinal partition wall broken around each planned doorway.
 * @param {object} profile Normalized building profile.
 * @param {object} material Opaque wall material descriptor.
 * @param {object} partition Floor-plan longitudinal partition record.
 * @returns {Array<object>} Wall segments and door headers.
 */
export function createBuildingLongitudinalWall(profile, material, partition) {
	const definitions = [];
	const halfDepth = profile.layout.innerDepth / 2;
	const openingWidth = profile.doorWidth + 0.18;
	let cursor = -halfDepth;
	partition.bayCenters.forEach((center, index) => {
		const openingStart = center - openingWidth / 2;
		appendLongSegment(
			definitions,
			profile,
			material,
			partition,
			cursor,
			openingStart,
			index
		);
		definitions.push(createHeader(
			profile,
			material,
			partition,
			center,
			index
		));
		cursor = center + openingWidth / 2;
	});
	appendLongSegment(
		definitions,
		profile,
		material,
		partition,
		cursor,
		halfDepth,
		9
	);
	return definitions;
}

/** Creates one transverse room-divider wall. */
export function createBuildingTransverseWall(profile, material, partition) {
	return buildingBox(
		profile,
		material,
		partition.id,
		partition.localX,
		partition.floorY + profile.storyHeight / 2,
		partition.localZ,
		{
			x: profile.layout.wingWidth,
			y: profile.storyHeight,
			z: profile.wallThickness
		},
		{ role: 'transverse-room-wall' }
	);
}

function appendLongSegment(
	target,
	profile,
	material,
	partition,
	start,
	end,
	index
) {
	const length = end - start;
	if (length <= 0.08) return;
	target.push(buildingBox(
		profile,
		material,
		`${partition.id}-segment-${index}`,
		partition.localX,
		partition.floorY + profile.storyHeight / 2,
		(start + end) / 2,
		{
			x: length,
			y: profile.storyHeight,
			z: profile.wallThickness
		},
		{
			role: 'longitudinal-room-wall',
			yaw: Math.PI / 2
		}
	));
}

function createHeader(profile, material, partition, center, index) {
	const height = profile.storyHeight - profile.doorHeight;
	return buildingBox(
		profile,
		material,
		`${partition.id}-header-${index}`,
		partition.localX,
		partition.floorY + profile.doorHeight + height / 2,
		center,
		{
			x: profile.doorWidth + 0.18,
			y: height,
			z: profile.wallThickness
		},
		{
			role: 'room-door-header',
			yaw: Math.PI / 2
		}
	);
}
