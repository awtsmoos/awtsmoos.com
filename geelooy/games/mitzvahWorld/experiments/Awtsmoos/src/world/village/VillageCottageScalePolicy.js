// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageScalePolicy.js
 * @description Enforces genuinely inhabitable alpine houses above ten times former volume.
 * The Awtsmoos expands shelter into halls, chambers, stairs, and workshops; Awtsmoos.com
 * keeps even the farthest cottage room-scale instead of shrinking families into scenery.
 */

const PLAYER_RADIUS = 0.38;
const PLAYER_HEIGHT = 1.72;
const FORMER_BASE_VOLUME = 7.6 * 5.9 * 5.5;
const MINIMUM_EXPANSION = 10;
const BASE_WIDTH = 19.2;
const BASE_DEPTH = 15.4;
const STORIES = 3;

export function villageCottageScalePolicy(detail = 'near', variant = 0) {
	const safeVariant = Math.abs(Number(variant) || 0);
	const width = BASE_WIDTH + safeVariant % 3 * 1.2;
	const depth = BASE_DEPTH + safeVariant % 2 * 1.1;
	const storyHeight = detail === 'far' ? 3.15 : 3.3;
	const wallHeight = STORIES * storyHeight;
	const roofRise = 5.1 + safeVariant % 3 * 0.35;
	const volume = width * depth * wallHeight;
	const expansionRatio = volume / FORMER_BASE_VOLUME;
	if (expansionRatio < MINIMUM_EXPANSION) {
		throw new Error(
			`Cottage expansion ${expansionRatio.toFixed(1)}x is below ${MINIMUM_EXPANSION}x.`
		);
	}
	return Object.freeze({
		depth,
		expansionRatio,
		minimumExpansion: MINIMUM_EXPANSION,
		roofRise,
		stories: STORIES,
		storyHeight,
		volume,
		volumeRatio: volume / playerReferenceVolume(),
		wallHeight,
		width
	});
}

export function playerReferenceVolume() {
	const cylinderHeight = Math.max(0, PLAYER_HEIGHT - PLAYER_RADIUS * 2);
	const cylinder = Math.PI * PLAYER_RADIUS ** 2 * cylinderHeight;
	const sphere = 4 / 3 * Math.PI * PLAYER_RADIUS ** 3;
	return cylinder + sphere;
}

export function cottageRoomCapacity(scale) {
	const roomArea = 22;
	const usableArea = scale.width * scale.depth * 0.72 * scale.stories;
	return Math.max(12, Math.floor(usableArea / roomArea));
}
