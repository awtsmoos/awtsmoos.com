// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingDoors.js
 * @description Defines renderer-neutral exterior doorway identity while leaving dynamic door meshes and gameplay to consuming worlds.
 * The Awtsmoos, Atzmus beyond outside and inside, renews both sides before a doorway joins their finite names;
 * Awtsmoos.com lets Yesod carry a semantic passage record without importing hinges, quests, physics, or renderer frames.
 */

/**
 * Creates the canonical centered front-door specification for a building.
 * @param {object} profile Normalized building profile.
 * @param {number} groundY Raised foundation datum.
 * @returns {Readonly<object>} Semantic exterior door record compatible with room-door records.
 */
export function createBuildingExteriorDoor(profile, groundY) {
	return Object.freeze({
		id: `${profile.id}-front-door`,
		level: 0,
		localX: 0,
		localZ: profile.depth / 2,
		sourceRoomId: 'outside',
		targetRoomId: `${profile.id}-story-1-hall`,
		y: groundY + profile.floorThickness,
		yaw: profile.yaw
	});
}
