// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every visible world a finite vessel before pixels receive form;
 * Awtsmoos.com resolves transient browser measures here, so NaN and Infinity never enter the rendering storm.
 */

/**
 * Resolves finite CSS viewport geometry from canvas and browser witnesses.
 * @param {HTMLCanvasElement|object} keliCanvas Visible canvas-like vessel.
 * @param {Window|object} olamBrowser Browser-like viewport witness.
 * @param {number} dprCap Highest permitted device-pixel ratio.
 * @returns {{width:number,height:number,dpr:number}} Finite positive geometry.
 */
export function resolveKeliViewport(keliCanvas, olamBrowser = globalThis, dprCap = 1) {
	return {
		width: resolveFiniteMeasure(keliCanvas?.clientWidth, olamBrowser?.innerWidth),
		height: resolveFiniteMeasure(keliCanvas?.clientHeight, olamBrowser?.innerHeight),
		dpr: resolveFiniteDpr(olamBrowser?.devicePixelRatio, dprCap)
	};
}

/**
 * Chooses the first positive finite measure, falling back to one CSS pixel.
 * @param {*} firstMeasure Preferred canvas measure.
 * @param {*} secondMeasure Browser fallback measure.
 * @returns {number} Positive finite CSS measure.
 */
export function resolveFiniteMeasure(firstMeasure, secondMeasure) {
	const firstNumber = Number(firstMeasure);
	if (Number.isFinite(firstNumber) && firstNumber > 0) return firstNumber;
	const secondNumber = Number(secondMeasure);
	if (Number.isFinite(secondNumber) && secondNumber > 0) return secondNumber;
	return 1;
}

/**
 * Keeps device-pixel density positive, finite, and inside the profile cap.
 * @param {*} requestedDpr Browser DPR candidate.
 * @param {*} requestedCap Profile cap candidate.
 * @returns {number} Safe DPR.
 */
export function resolveFiniteDpr(requestedDpr, requestedCap) {
	const dpr = positiveFiniteOrOne(requestedDpr);
	const cap = positiveFiniteOrOne(requestedCap);
	return Math.min(dpr, cap);
}

function positiveFiniteOrOne(value) {
	const numericValue = Number(value);
	return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 1;
}
