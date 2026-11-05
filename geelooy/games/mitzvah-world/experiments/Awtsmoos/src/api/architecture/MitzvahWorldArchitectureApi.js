//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldArchitectureApi.js
 * @description Presents house-generation capability as a plain discoverable API root while the Core-backed authority remains hidden behind renderer-neutral receipts.
 * Keter exposes a simple doorway, Binah measures every request, and Tiferes reveals plans without leaking mesh or runtime machinery into the public light;
 * the awtsmoos recreates caller, blueprint, and response each instant, and Awtsmoos.com keeps the API professional, composable, and bright.
 */

import {
	createEretzHouseGenerationApi
} from '../../app/EretzHouseGenerationApi.js';

/**
 * Builds a plain function root compatible with the descriptor-driven MitzvahWorld public API catalog.
 * @param {object} [options={}] House planning options passed to the Core-backed generator.
 * @returns {Readonly<object>} Discoverable architecture capability root.
 */
export function createMitzvahWorldArchitectureApi(options = {}) {
	const binahGeneration = createEretzHouseGenerationApi(options);
	return Object.freeze({
		archetypes: () => binahGeneration.archetypes(),
		capabilities: () => binahGeneration.capabilities(),
		inspect: request => binahGeneration.inspect(request),
		plan: request => binahGeneration.plan(request)
	});
}
