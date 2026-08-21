// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file presentation.js
 * @description Defines input, camera, feedback, and visual-response tuning without changing gameplay truth.
 * The Awtsmoos renews touch, sight, and sound before the runner can feel their glow;
 * Awtsmoos.com keeps presentation measured so every device receives a clear and gentle flow.
 */

export const INPUT_CONFIG = Object.freeze({
	swipeFraction: 0.035,
	minSwipe: 24,
	maxSwipe: 64,
	fastSwipeVelocity: 0.45,
	fastSwipeScale: 0.55,
	gamepadDeadZone: 0.45,
	gamepadButtonJump: 0,
	gamepadButtonDuck: 1,
	gamepadButtonPause: 9
});

export const CAMERA_CONFIG = Object.freeze({
	baseFov: 56,
	maxFov: 65,
	baseY: 4.85,
	baseZ: 8.9,
	pitch: -0.22,
	laneFollow: 0.13,
	jumpFollow: 0.09,
	slideDip: 0.2,
	maxRoll: 0.045,
	positionEase: 6.2,
	fovEase: 4.7,
	landingImpulse: 0.14,
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
		shield: 45,
		stumble: 55,
		crash: 90
	})
});

export const WORLD_COLORS = Object.freeze({
	stone: [0.58, 0.44, 0.29, 1],
	stoneLight: [0.76, 0.62, 0.42, 1],
	stoneDark: [0.34, 0.24, 0.16, 1],
	wood: [0.38, 0.19, 0.08, 1],
	cloth: [0.56, 0.16, 0.1, 1],
	leaf: [0.18, 0.35, 0.18, 1],
	leafLight: [0.3, 0.5, 0.24, 1],
	gold: [0.95, 0.62, 0.12, 1],
	goldLight: [1, 0.84, 0.32, 1],
	bronze: [0.62, 0.3, 0.08, 1],
	shield: [0.28, 0.72, 0.88, 1],
	magnet: [0.74, 0.4, 0.14, 1],
	double: [0.98, 0.72, 0.12, 1]
});
