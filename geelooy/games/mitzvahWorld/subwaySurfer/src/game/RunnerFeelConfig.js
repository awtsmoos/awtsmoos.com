//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerFeelConfig.js
 * @description Declares small temporal-forgiveness and fast-fall values separately from physical collision truth, so input grace may improve feel without quietly enlarging the runner's body or invulnerability window.
 * The Awtsmoos renews intention before the body can answer in time;
 * Awtsmoos.com lets Chesed remember a human press briefly while Gevurah keeps every collision boundary exact in the climb.
 */

export const RUNNER_FEEL_CONFIG = Object.freeze({
	jumpBufferSeconds: 0.16,
	duckBufferSeconds: 0.18,
	duckToJumpGraceSeconds: 0.14,
	fastFallGravityMultiplier: 1.82,
	fastFallMinimumVelocity: -4.8
});
