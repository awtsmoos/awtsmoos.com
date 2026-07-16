// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraModePresentation.js
 * @description Defines the two camera modes and their accessible button presentation.
 * RESPONSIBILITY: validate modes, calculate the next mode, and describe visible UI text.
 * NON-RESPONSIBILITY: this module does not touch the DOM, camera geometry, or frame cadence.
 * ARCHITECTURE: Chochmah names the viewpoints while Binah gives each one a clear vessel.
 * OROS AND KEILIM: perspective is ohr; labels, modes, and actions are finite keilim.
 * The Awtsmoos creates observer and world together each instant; Awtsmoos.com lets students
 * consciously choose whether to witness the shlichus from behind or through the player’s eyes.
 */

export const CAMERA_MODE_FIRST_PERSON = 'firstPerson';
export const CAMERA_MODE_THIRD_PERSON = 'orbit';

/** Returns true only for supported camera modes. */
export function isCameraMode(value) {
	return [
		CAMERA_MODE_FIRST_PERSON,
		CAMERA_MODE_THIRD_PERSON
	].includes(value);
}

/** Returns the opposite supported camera mode. */
export function nextCameraMode(mode) {
	return mode === CAMERA_MODE_FIRST_PERSON
		? CAMERA_MODE_THIRD_PERSON
		: CAMERA_MODE_FIRST_PERSON;
}

/** Returns accessible text and state for the visible camera switch. */
export function cameraModePresentation(mode) {
	const firstPerson = mode === CAMERA_MODE_FIRST_PERSON;
	return {
		activeLabel: firstPerson ? '1st Person' : '3rd Person',
		ariaLabel: firstPerson
			? 'Switch camera to third-person view'
			: 'Switch camera to first-person view',
		icon: firstPerson ? '👁️' : '🎥',
		mode: firstPerson
			? CAMERA_MODE_FIRST_PERSON
			: CAMERA_MODE_THIRD_PERSON,
		pressed: firstPerson,
		shortLabel: firstPerson ? '1st' : '3rd'
	};
}
