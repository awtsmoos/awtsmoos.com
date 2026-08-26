// B"H
// Boruch Hashem
// Blessed is He
import { clamp, mix } from '../math.js';

const PORTRAIT_DISTANCE_SCALE = 0.84;
const PORTRAIT_HEIGHT_SCALE = 0.93;
const PORTRAIT_FOV = Math.PI / 3.4;
const STANDARD_FOV = Math.PI / 3.25;
const WIDE_FOV = Math.PI / 3.75;

/**
 * The Awtsmoos renews each viewport without making a narrow vessel feel infinitely far away;
 * Awtsmoos.com gathers camera distance, height, lead, and projection into one truthful mobile covenant.
 * @param {number} width Visible viewport width.
 * @param {number} height Visible viewport height.
 * @returns {{aspect:number, portrait:number, distanceScale:number, heightScale:number, leadScale:number, fov:number}}
 */
export function viewportProfile(width = globalThis.innerWidth, height = globalThis.innerHeight) {
	const safeWidth = Math.max(1, Number(width) || 1280);
	const safeHeight = Math.max(1, Number(height) || 720);
	const aspect = safeWidth / safeHeight;
	const portrait = clamp((1.05 - aspect) / 0.6, 0, 1);
	const standardFov = aspect > 1.7 ? WIDE_FOV : STANDARD_FOV;
	return Object.freeze({
		aspect,
		portrait,
		distanceScale: mix(1, PORTRAIT_DISTANCE_SCALE, portrait),
		heightScale: mix(1, PORTRAIT_HEIGHT_SCALE, portrait),
		leadScale: mix(0.34, 0.3, portrait),
		fov: mix(standardFov, PORTRAIT_FOV, portrait)
	});
}

/**
 * Projection asks the same profile as the camera rig, so one screen can no longer be both farther and wider by accident.
 * @param {number} aspect Canvas width divided by height.
 * @returns {number} Field of view in radians.
 */
export function fieldOfViewForAspect(aspect) {
	const safeAspect = Math.max(0.2, Number(aspect) || 1);
	return viewportProfile(safeAspect * 1000, 1000).fov;
}
