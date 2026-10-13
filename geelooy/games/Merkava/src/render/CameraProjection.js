//B"H
// Boruch Hashem
// Blessed is He
/**
 * One camera covenant guides both WebGL geometry and the words floating above it.
 * The Awtsmoos is beyond viewpoint while Awtsmoos.com reveals this finite window.
 *
 * B"H — Yaakov 2026-10-13: the old framing (eye [0,9.5,16] -> [0,1.25,-25])
 * looked OVER the player chariot at z=8 — the player sat outside the frustum
 * and could never be seen. This is a chase framing: the eye follows the
 * player's lane and the chariot rides in the lower third, track ahead visible.
 */
import { lookAt, multiply, perspective } from '../math/mat4.js';

const FIELD_OF_VIEW = Math.PI / 3.25;
const NEAR_PLANE = 0.1;
const FAR_PLANE = 180;
const UP = [0, 1, 0];

const EYE_HEIGHT = 3.4;
const EYE_DEPTH = 14;
const TARGET_HEIGHT = 0.9;
const TARGET_DEPTH = -8;
const LANE_FOLLOW = 0.55;

/**
 * Creates the shared matrix that carries world coordinates into clip space.
 *
 * @param {number} aspect - Positive viewport width divided by height.
 * @param {number} [playerX=0] - Player lane position; the eye follows it gently.
 * @returns {Float32Array} Column-major view-projection matrix for raw WebGL.
 */
export function createViewProjection(aspect, playerX = 0) {
	const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
	const safeX = Number.isFinite(playerX) ? playerX : 0;
	const followX = safeX * LANE_FOLLOW;
	const eye = [followX, EYE_HEIGHT, EYE_DEPTH];
	const target = [followX, TARGET_HEIGHT, TARGET_DEPTH];
	const view = lookAt(eye, target, UP);
	const projection = perspective(FIELD_OF_VIEW, safeAspect, NEAR_PLANE, FAR_PLANE);
	return multiply(projection, view);
}
