//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Tiferes presentation tuning for input, camera, feedback, and backward-compatible Temple material colors.
 * The Awtsmoos renews every sensation before the runner can call one frame fast or bright;
 * Awtsmoos.com lets Tiferes measure touch, sight, sound, and color so energetic play remains comfortable and right.
 */

import { READABILITY_COLORS } from "./readabilityColors.js";

export const INPUT_CONFIG = Object.freeze({
	swipeFraction: 0.035,
	minSwipe: 24,
	maxSwipe: 64,
	fastSwipeVelocity: 0.45,
	fastSwipeScale: 0.55,
	directionDominance: 1.16,
	gamepadDeadZone: 0.45,
	gamepadButtonJump: 0,
	gamepadButtonDuck: 1,
	gamepadButtonPause: 9
});

export const CAMERA_CONFIG = Object.freeze({
	baseFov: 55,
	maxFov: 59,
	minFov: 54,
	maxPortraitFov: 61,
	baseY: 4.85,
	baseZ: 8.75,
	pitch: -0.22,
	laneFollow: 0.46,
	portraitLaneBoost: 0.08,
	wideLaneReduction: 0.05,
	laneDeadZone: 0.06,
	jumpThreshold: 0.24,
	jumpFollow: 0.34,
	slideDip: 0.14,
	speedLift: 0.08,
	maxRoll: 0.034,
	laneRollStrength: 0.008,
	turnRoll: 0.026,
	xEase: 9.4,
	yRiseEase: 7.2,
	yFallEase: 5.7,
	zEase: 4.8,
	fovEase: 5.2,
	landingImpulse: 0.07,
	landingDecay: 13,
	speedZ: 0.22,
	portraitZ: 1.25,
	wideZ: -0.32,
	portraitFov: 1.8,
	wideFov: -0.45,
	minAspect: 0.58,
	maxAspect: 2.2,
	turnYaw: Math.PI / 2
});

export const FEEDBACK_CONFIG = Object.freeze({
	masterVolume: 0.16,
	footstepBaseSeconds: 0.34,
	perutaPitchStep: 36,
	dustSeconds: 0.42,
	glintSeconds: 0.34,
	nearMissCooldown: 0.3,
	haptics: Object.freeze({
		peruta: 12,
		action: 18,
		turn: 28,
		streak: 34,
		shield: 45,
		stumble: 55,
		crash: 90
	})
});

export const WORLD_COLORS = Object.freeze({
	stone: READABILITY_COLORS.architectureBase,
	stoneLight: READABILITY_COLORS.architectureLight,
	stoneDark: READABILITY_COLORS.architectureShadow,
	wood: READABILITY_COLORS.woodBase,
	cloth: READABILITY_COLORS.duckHazard,
	leaf: READABILITY_COLORS.foliageDark,
	leafLight: READABILITY_COLORS.foliageLight,
	gold: READABILITY_COLORS.rewardAccent,
	goldLight: READABILITY_COLORS.rewardHighlight,
	bronze: READABILITY_COLORS.bronzeBase,
	shield: READABILITY_COLORS.defensiveAccent,
	magnet: READABILITY_COLORS.utilityAccent,
	double: READABILITY_COLORS.rewardHighlight
});
