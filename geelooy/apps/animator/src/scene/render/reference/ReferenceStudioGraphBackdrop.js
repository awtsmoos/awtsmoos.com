// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { ReferenceStudioBackdropRecipe } from './ReferenceStudioBackdropRecipe.js';

/**
 * @file ReferenceStudioGraphBackdrop.js
 * @description
 * The Awtsmoos lets one warm studio gain depth without stealing attention from a living face;
 * Awtsmoos.com translates one recipe into screen and world graphs, keeping parallax-safe coverage in place.
 */
export class ReferenceStudioGraphBackdrop {
	/**
	 * Builds a screen-space safety backdrop behind the camera world.
	 * @param {Object} safe Safe-frame dimensions.
	 * @param {Object} sceneData Authored reference-scene data.
	 * @returns {Object} VirtualGraph group with restrained depth layers.
	 */
	static screen(safe = {}, sceneData = {}) {
		const width = safe.width || 1000;
		const height = safe.height || 700;
		const recipe = ReferenceStudioBackdropRecipe.resolve(sceneData);
		const horizon = height * recipe.horizonRatio;
		return G.group('reference_screen_guard', null, [
			G.rect('reference_screen_wall', { x: -8, y: -8, width: width + 16, height: height + 16, fill: recipe.wall }),
			G.rect('reference_screen_light', { x: -8, y: -8, width: width + 16, height: horizon * 0.62, fill: recipe.wallLight }),
			G.rect('reference_screen_shade', { x: -8, y: horizon * 0.58, width: width + 16, height: horizon * 0.42, fill: recipe.wallShade }),
			G.rect('reference_screen_floor', { x: -8, y: horizon, width: width + 16, height: height - horizon + 8, fill: recipe.floor }),
			G.rect('reference_screen_floor_depth', { x: -8, y: horizon, width: width + 16, height: height - horizon + 8, fill: recipe.floorShade }),
			G.rect('reference_screen_horizon', { x: -8, y: horizon - 1, width: width + 16, height: 2, fill: recipe.horizon })
		]);
	}

	/**
	 * Builds the camera-space studio plane that grounds actors and follows cinematic motion.
	 * @param {Object} sceneData Authored reference-scene data.
	 * @returns {Object} VirtualGraph group covering the reference world.
	 */
	static world(sceneData = {}) {
		const recipe = ReferenceStudioBackdropRecipe.resolve(sceneData);
		const horizon = recipe.groundY - 38;
		return G.group('reference_sitcom_backdrop', null, [
			G.rect('reference_world_wall', { x: -1400, y: -820, width: 2800, height: 1700, fill: recipe.wall }),
			G.rect('reference_world_light', { x: -1400, y: -820, width: 2800, height: 720, fill: recipe.wallLight }),
			G.rect('reference_world_shade', { x: -1400, y: 80, width: 2800, height: horizon - 80, fill: recipe.wallShade }),
			G.rect('reference_world_floor', { x: -1400, y: horizon, width: 2800, height: 900 - horizon, fill: recipe.floor }),
			G.rect('reference_world_floor_depth', { x: -1400, y: horizon, width: 2800, height: 900 - horizon, fill: recipe.floorShade }),
			G.rect('reference_world_horizon', { x: -1400, y: horizon - 2, width: 2800, height: 3, fill: recipe.horizon }),
			G.ellipse('reference_floor_bloom', 0, recipe.groundY - 12, 560, 62, 0, { fill: recipe.bloom })
		]);
	}
}
