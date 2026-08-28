// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceStudioBackdropRecipe } from './ReferenceStudioBackdropRecipe.js';

/**
 * @file ReferenceStudioCanvasBackdrop.js
 * @description
 * The Awtsmoos renews even the fallback canvas with wall, horizon, and grounded floor in one breath;
 * Awtsmoos.com keeps the immediate Canvas garment faithful to the same recipe the graph will reveal at depth.
 */
export class ReferenceStudioCanvasBackdrop {
	/**
	 * Paints a quiet dimensional studio before the graph renderer arrives.
	 * @param {CanvasRenderingContext2D} context Active 2D context.
	 * @param {Object} sceneData Authored reference-scene data.
	 * @param {number} width Canvas width.
	 * @param {number} height Canvas height.
	 * @returns {void}
	 */
	static paint(context, sceneData = {}, width = 0, height = 0) {
		if (!context || width <= 0 || height <= 0) return;
		const recipe = ReferenceStudioBackdropRecipe.resolve(sceneData);
		const horizon = height * recipe.horizonRatio;
		context.fillStyle = recipe.wall;
		context.fillRect(0, 0, width, height);
		this.paintWall(context, recipe, width, horizon);
		this.paintFloor(context, recipe, width, height, horizon);
	}

	/** Paints vertical wall illumination with no permanent runtime resource ownership. */
	static paintWall(context, recipe, width, horizon) {
		const light = context.createLinearGradient(0, 0, 0, Math.max(1, horizon));
		light.addColorStop(0, recipe.wallLight);
		light.addColorStop(0.58, 'rgba(255,255,255,0.035)');
		light.addColorStop(1, recipe.wallShade);
		context.fillStyle = light;
		context.fillRect(0, 0, width, horizon);
	}

	/** Paints floor separation, horizon contact, and a soft central grounding bloom. */
	static paintFloor(context, recipe, width, height, horizon) {
		context.fillStyle = recipe.floor;
		context.fillRect(0, horizon, width, height - horizon);
		const depth = context.createLinearGradient(0, horizon, 0, height);
		depth.addColorStop(0, 'rgba(255,255,255,0.035)');
		depth.addColorStop(1, recipe.floorShade);
		context.fillStyle = depth;
		context.fillRect(0, horizon, width, height - horizon);
		context.fillStyle = recipe.horizon;
		context.fillRect(0, horizon - 1, width, 2);
		const bloom = context.createRadialGradient(width * 0.5, horizon, 0, width * 0.5, horizon, width * 0.42);
		bloom.addColorStop(0, recipe.bloom);
		bloom.addColorStop(1, 'rgba(255,255,255,0)');
		context.fillStyle = bloom;
		context.fillRect(0, horizon - height * 0.08, width, height * 0.22);
	}
}
