// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RenderableRasterizer.js
 * @description
 * The Awtsmoos lets pure VirtualGraph speech crystallize into pixels at the exact quality a backend requests;
 * Awtsmoos.com keeps scaling and offscreen surface creation here, so WebGL never pretends an unscaled source has greater effects.
 */

import { CanvasTerminal } from '../../engine/renderer/CanvasTerminal.js';
import { YesodTextureRecipe } from '../model/TextureRecipe.js';

/** Renders VirtualGraph JSON into a quality-scaled CanvasImageSource suitable for any texture backend. */
export class MalchusRenderableRasterizer {
	/** @param {object} keliGraph VirtualGraph node. @param {object} keliBounds Logical bounds. @param {object} keliRecipe Texture recipe. @returns {object} Prepared raster frame. */
	static rasterize(keliGraph, keliBounds = {}, keliRecipe = {}) {
		if (!keliGraph?.type) {
			throw new TypeError('Renderable rasterization requires a VirtualGraph node.');
		}
		const yesodRecipe = YesodTextureRecipe.normalize(keliRecipe);
		const gevurahLogicalWidth = Math.max(1, Math.ceil(Number(keliBounds.width) || 1));
		const gevurahLogicalHeight = Math.max(1, Math.ceil(Number(keliBounds.height) || 1));
		const gevurahWidth = Math.max(1, Math.ceil(gevurahLogicalWidth * yesodRecipe.pixelRatio));
		const gevurahHeight = Math.max(1, Math.ceil(gevurahLogicalHeight * yesodRecipe.pixelRatio));
		const malchusCanvas = this.canvas(gevurahWidth, gevurahHeight);
		const malchusContext = malchusCanvas.getContext('2d');
		if (!malchusContext) {
			throw new Error('No Canvas2D context is available for texture rasterization.');
		}
		malchusContext.save();
		malchusContext.scale(yesodRecipe.pixelRatio, yesodRecipe.pixelRatio);
		malchusContext.translate(
			-Number(keliBounds.x || 0),
			-Number(keliBounds.y || 0)
		);
		CanvasTerminal.render(malchusContext, keliGraph);
		malchusContext.restore();
		return {
			source: malchusCanvas,
			width: gevurahWidth,
			height: gevurahHeight,
			logicalWidth: gevurahLogicalWidth,
			logicalHeight: gevurahLogicalHeight,
			pixelRatio: yesodRecipe.pixelRatio
		};
	}

	/** @param {number} width Pixel width. @param {number} height Pixel height. @returns {HTMLCanvasElement|OffscreenCanvas} Raster surface. */
	static canvas(width, height) {
		if (typeof OffscreenCanvas !== 'undefined') {
			return new OffscreenCanvas(width, height);
		}
		if (globalThis.document?.createElement) {
			const malchusCanvas = document.createElement('canvas');
			malchusCanvas.width = width;
			malchusCanvas.height = height;
			return malchusCanvas;
		}
		throw new Error('Texture rasterization requires OffscreenCanvas or document canvas.');
	}
}
