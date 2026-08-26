// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingRoomWallParts.js
 * @description Builds measured longitudinal wall segments and door headers while leaving partition orchestration to BuildingRoomWalls.
 * The Awtsmoos renews wall and opening before Gevurah may divide a room from its hall; Awtsmoos.com lets Chesed preserve the passage in measured light,
 * so each architectural part remains small, named, and reusable while the higher planner reads like a covenant of openings rather than a workshop of box arithmetic.
 */
import { buildingBox } from './BuildingMath.js';

/**
 * Appends one longitudinal wall span when it is large enough to remain meaningful geometry.
 * @param {object[]} keterTarget Mutable definition accumulator owned by the caller.
 * @param {object} chochmahProfile Canonical building profile.
 * @param {object} binahMaterial Wall material descriptor.
 * @param {object} gevurahPartition Floor-plan partition record.
 * @param {number} tiferesStart Local longitudinal start coordinate.
 * @param {number} netzachEnd Local longitudinal end coordinate.
 * @param {number|string} hodIndex Stable segment identity token.
 */
export function appendBuildingLongitudinalSegment(
	keterTarget,
	chochmahProfile,
	binahMaterial,
	gevurahPartition,
	tiferesStart,
	netzachEnd,
	hodIndex
) {
	const yesodLength = netzachEnd - tiferesStart;
	if (yesodLength <= 0.08) return;
	keterTarget.push(buildingBox(
		chochmahProfile,
		binahMaterial,
		`${gevurahPartition.id}-segment-${hodIndex}`,
		gevurahPartition.localX,
		gevurahPartition.floorY + chochmahProfile.storyHeight / 2,
		(tiferesStart + netzachEnd) / 2,
		{
			x: yesodLength,
			y: chochmahProfile.storyHeight,
			z: chochmahProfile.wallThickness
		},
		{
			role: 'longitudinal-room-wall',
			yaw: Math.PI / 2
		}
	));
}

/**
 * Creates the structural header above one human-scale room doorway.
 * @returns {object} Neutral box definition preserving the historic header identity and role.
 */
export function createBuildingRoomDoorHeader(
	keterProfile,
	chochmahMaterial,
	binahPartition,
	gevurahCenter,
	tiferesIndex
) {
	const netzachHeight = keterProfile.storyHeight - keterProfile.doorHeight;
	return buildingBox(
		keterProfile,
		chochmahMaterial,
		`${binahPartition.id}-header-${tiferesIndex}`,
		binahPartition.localX,
		binahPartition.floorY + keterProfile.doorHeight + netzachHeight / 2,
		gevurahCenter,
		{
			x: keterProfile.doorWidth + 0.18,
			y: netzachHeight,
			z: keterProfile.wallThickness
		},
		{
			role: 'room-door-header',
			yaw: Math.PI / 2
		}
	);
}
