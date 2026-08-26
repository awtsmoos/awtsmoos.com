// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingRoomWalls.js
 * @description Orchestrates topology-planned room partitions into wall spans, door openings, and transverse dividers without owning low-level aperture geometry.
 * The Awtsmoos, Atzmus beyond division and passage, renews chamber and corridor within one dwelling; Awtsmoos.com lets Tiferes order the measured parts,
 * so this file speaks the architectural sequence clearly while the finite arithmetic of spans and headers rests in its own smaller Gevurah vessel.
 */
import { buildingBox } from './BuildingMath.js';
import {
	appendBuildingLongitudinalSegment,
	createBuildingRoomDoorHeader
} from './BuildingRoomWallParts.js';

/**
 * Creates one longitudinal partition wall broken around every planned room doorway.
 * @param {object} keterProfile Normalized building profile.
 * @param {object} chochmahMaterial Opaque wall material descriptor.
 * @param {object} binahPartition Floor-plan longitudinal partition record.
 * @returns {Array<object>} Wall spans and structural door headers.
 */
export function createBuildingLongitudinalWall(
	keterProfile,
	chochmahMaterial,
	binahPartition
) {
	const gevurahDefinitions = [];
	const tiferesHalfDepth = keterProfile.layout.innerDepth / 2;
	const netzachOpeningWidth = keterProfile.doorWidth + 0.18;
	let hodCursor = -tiferesHalfDepth;
	binahPartition.bayCenters.forEach((yesodCenter, malchusIndex) => {
		const keterOpeningStart = yesodCenter - netzachOpeningWidth / 2;
		appendBuildingLongitudinalSegment(
			gevurahDefinitions,
			keterProfile,
			chochmahMaterial,
			binahPartition,
			hodCursor,
			keterOpeningStart,
			malchusIndex
		);
		gevurahDefinitions.push(createBuildingRoomDoorHeader(
			keterProfile,
			chochmahMaterial,
			binahPartition,
			yesodCenter,
			malchusIndex
		));
		hodCursor = yesodCenter + netzachOpeningWidth / 2;
	});
	appendBuildingLongitudinalSegment(
		gevurahDefinitions,
		keterProfile,
		chochmahMaterial,
		binahPartition,
		hodCursor,
		tiferesHalfDepth,
		9
	);
	return gevurahDefinitions;
}

/** Creates one full-height transverse divider between neighboring room bays. */
export function createBuildingTransverseWall(keterProfile, chochmahMaterial, binahPartition) {
	return buildingBox(
		keterProfile,
		chochmahMaterial,
		binahPartition.id,
		binahPartition.localX,
		binahPartition.floorY + keterProfile.storyHeight / 2,
		binahPartition.localZ,
		{
			x: keterProfile.layout.wingWidth,
			y: keterProfile.storyHeight,
			z: keterProfile.wallThickness
		},
		{ role: 'transverse-room-wall' }
	);
}
