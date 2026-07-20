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
	const width = 7.6 + safeVariant % 3 * 0.55;
	const depth = 5.9 + safeVariant % 2 * 0.5;
	const stories = 2;
	const storyHeight = detail === 'far' ? 2.65 : 2.75;
	const wallHeight = stories * storyHeight;
	const roofRise = 2.15 + safeVariant % 3 * 0.18;
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
