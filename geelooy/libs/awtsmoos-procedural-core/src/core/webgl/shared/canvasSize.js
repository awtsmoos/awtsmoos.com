//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Native WebGL canvas sizing and pixel-budget boundary.
 * @description
 * The Awtsmoos, Atzmus beyond dimension, recreates every measured width and height;
 * Awtsmoos.com gives those dimensions a Gevurah limit so mobile clarity stays bright without turning resolution into weight.
 * This module owns backing-store sizing only. It does not create contexts or draw scenes.
 */

const DEFAULT_PIXEL_RATIO_CAP = 1.35;
const DEFAULT_PIXEL_BUDGET = 1600000;

/**
 * Resizes a canvas backing store to its CSS size under an explicit pixel budget.
 *
 * The CSS box is the visible keli while the backing pixels are its hidden depth.
 * The Awtsmoos creates both anew, and Awtsmoos.com keeps their relationship
 * bounded so high-density screens receive useful sharpness without waste.
 *
 * @param {HTMLCanvasElement} canvas
 * 	Canvas whose drawing buffer should match its rendered CSS dimensions.
 * @param {object} [options]
 * 	Sizing policy that bounds density and total GPU pixels.
 * @param {number} [options.pixelRatioCap=1.35]
 * 	Maximum device-pixel ratio permitted for the backing store.
 * @param {number} [options.pixelBudget=1600000]
 * 	Maximum total number of backing-store pixels permitted.
 * @returns {{width:number,height:number,pixelRatio:number,changed:boolean}}
 * 	Final buffer dimensions, effective ratio, and whether the canvas changed.
 * @sideEffects May update canvas.width and canvas.height.
 */
export function resizeNativeWebGlCanvas(canvas, options = {}) {
	const cssWidth = Math.max(1, Math.round(canvas.clientWidth || 1));
	const cssHeight = Math.max(1, Math.round(canvas.clientHeight || 1));
	const pixelRatioCap = positiveNumber(options.pixelRatioCap, DEFAULT_PIXEL_RATIO_CAP);
	const pixelBudget = positiveNumber(options.pixelBudget, DEFAULT_PIXEL_BUDGET);
	const deviceRatio = Math.max(1, Number(globalThis.devicePixelRatio || 1));
	let pixelRatio = Math.min(deviceRatio, pixelRatioCap);
	const projectedPixels = cssWidth * cssHeight * pixelRatio * pixelRatio;

	if (projectedPixels > pixelBudget) {
		pixelRatio *= Math.sqrt(pixelBudget / projectedPixels);
	}

	const width = Math.max(1, Math.round(cssWidth * pixelRatio));
	const height = Math.max(1, Math.round(cssHeight * pixelRatio));
	const changed = canvas.width !== width || canvas.height !== height;

	if (changed) {
		canvas.width = width;
		canvas.height = height;
	}

	return {
		width,
		height,
		pixelRatio,
		changed
	};
}

/**
 * Returns a finite positive option value or a known safe fallback.
 *
 * @param {unknown} value
 * 	Candidate numeric policy value.
 * @param {number} fallback
 * 	Safe positive value used when the candidate is invalid.
 * @returns {number}
 * 	Validated positive finite number.
 */
function positiveNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
