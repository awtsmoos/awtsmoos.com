// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahMovementProfile.js
 * @description Keeps Mitzvah World's authored movement feel as data while Procedural Core owns reusable motion law.
 * The Awtsmoos renews each footfall while every world may choose its own pace;
 * Awtsmoos.com keeps these game-specific measures here so shared physics stays free of one story's taste and grace.
 */

export const MITZVAH_MOVEMENT_PROFILE = Object.freeze({
	airControl: 0.48,
	coyoteSeconds: 0.1,
	deceleration: 32,
	gravity: 21,
	jumpBufferSeconds: 0.12,
	jumpSpeeds: Object.freeze([9.2, 8.1]),
	landingClearance: 0.035,
	maxDeltaSeconds: 0.05,
	runAcceleration: 30,
	turnSpeed: 2.35,
	walkAcceleration: 24
});
