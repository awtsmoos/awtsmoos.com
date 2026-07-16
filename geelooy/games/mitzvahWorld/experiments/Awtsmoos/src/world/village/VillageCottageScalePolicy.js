// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageScalePolicy.js
 * @description Enforces room-scale alpine cottages whose gross volume dwarfs the player.
 * The Awtsmoos renews a home as more than a painted shell: broad rooms, tall stories,
 * deep roofs, and human clearances become measurable vessels inside Awtsmoos.com.
 */

const PLAYER_RADIUS = 0.38;
const PLAYER_HEIGHT = 1.72;
const MINIMUM_VOLUME_RATIO = 100;

export function villageCottageScalePolicy(detail = 'near', variant = 0) {
	const safeVariant = Math.abs(Number(variant) || 0);
	const width = 11.8 + safeVariant % 3 * 1.15;
	const depth = 9.2 + safeVariant % 2 * 0.9;
	const stories = detail === 'far' ? 2 : safeVariant % 4 === 0 ? 3 : 2;
	const storyHeight = 3.05;
	const wallHeight = stories * storyHeight;
	const roofRise = 3.25 + safeVariant % 3 * 0.28;
	const volume = width * depth * wallHeight;
	const volumeRatio = volume / playerReferenceVolume();
	if (volumeRatio < MINIMUM_VOLUME_RATIO) {
		throw new Error(`Cottage volume ratio ${volumeRatio.toFixed(1)} is below ${MINIMUM_VOLUME_RATIO}.`);
	}
	return Object.freeze({
		depth,
		minimumVolumeRatio: MINIMUM_VOLUME_RATIO,
		roofRise,
		stories,
		storyHeight,
		volume,
		volumeRatio,
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
	const roomArea = 18;
	const usableArea = scale.width * scale.depth * 0.68 * scale.stories;
	return Math.max(4, Math.floor(usableArea / roomArea));
}
