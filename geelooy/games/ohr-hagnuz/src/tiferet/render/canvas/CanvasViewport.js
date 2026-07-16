// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasViewport.js
 * @description Preserves logical CSS-space dimensions above physical canvas pixels.
 *
 * The Awtsmoos renews every visible point without confusing the vessel with the
 * light it carries. At Awtsmoos.com, backing pixels may multiply while world
 * coordinates remain one honest overhead measure.
 */
const VIEWPORT_KEY = '__ohrHagnuzViewport';
const DEFAULT_WIDTH = 390;
const DEFAULT_HEIGHT = 844;

/**
 * Stores the logical viewport on a live rendering context.
 *
 * @param {CanvasRenderingContext2D} context Live canvas context.
 * @param {{width:number,height:number,pixelRatio:number}} viewport Logical dimensions.
 * @returns {{width:number,height:number,pixelRatio:number}}
 */
export const setCanvasViewport = (context, viewport) => {
	const value = Object.freeze({
		width: positive(viewport.width, DEFAULT_WIDTH),
		height: positive(viewport.height, DEFAULT_HEIGHT),
		pixelRatio: positive(viewport.pixelRatio, 1)
	});
	context[VIEWPORT_KEY] = value;
	return value;
};

/**
 * Reads logical dimensions without exposing physical backing-buffer scale.
 *
 * @param {CanvasRenderingContext2D} context Live canvas context.
 * @returns {{width:number,height:number,pixelRatio:number,w:number,h:number}}
 */
export const readCanvasViewport = context => {
	const stored = context?.[VIEWPORT_KEY];
	const width = positive(stored?.width, context?.canvas?.width || DEFAULT_WIDTH);
	const height = positive(stored?.height, context?.canvas?.height || DEFAULT_HEIGHT);
	const pixelRatio = positive(stored?.pixelRatio, 1);
	return {
		width,
		height,
		pixelRatio,
		w: width,
		h: height
	};
};

const positive = (value, fallback) => {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
};
