// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EcosystemNatureApi.js
 * @description Plans coupled vegetation, fauna, habitat, and optional water through the same shared realism vocabulary.
 * The Awtsmoos, Atzmus beyond every kingdom, renews soil, plant, animal, current, and relation as one creation;
 * Awtsmoos.com lets Tiferes coordinate their bounded specialist engines while explicit caller choices remain the finite crown.
 * This facade owns shared-intent translation only; population and fluid implementations remain inside their specialist modules.
 */

import {
	createHabitatSample,
	listEcosystemSpecies,
	planEcosystem
} from '../ecosystem/index.js';
import { natureEcosystemOptions } from './NatureEcosystemDefaults.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { createNatureResult } from './NatureApiResult.js';

/** High-level renderer-neutral coupled ecosystem facade. */
export class EcosystemNatureApi {
	/**
	 * Creates the facade with immutable NatureApi defaults.
	 * @param {object} [defaults={}] Shared seed, quality, and realism defaults.
	 */
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
	}

	/**
	 * Plans vegetation, fauna, and optional river flow from one habitat and exclusion contract.
	 * @param {object} [options={}] Bounds, habitat, exclusions, populations, and optional river request.
	 * @returns {object} Standard nature result containing the native coupled ecosystem plan.
	 */
	plan(options = {}) {
		const context = createNatureCallContext(
			this.defaults,
			options,
			'ecosystem',
			options.id ?? 'world'
		);
		const value = planEcosystem({
			...natureEcosystemOptions(options, context),
			seed: context.seed
		});
		return createNatureResult(
			'ecosystem',
			context,
			value,
			value.diagnostics
		);
	}

	/**
	 * Normalizes one environmental observation into the canonical habitat vocabulary.
	 * @param {object} input Raw environmental channels.
	 * @param {object} [options={}] Optional profile and seed metadata.
	 * @returns {object} Standard result containing the frozen habitat sample.
	 */
	habitat(input, options = {}) {
		const context = createNatureCallContext(
			this.defaults,
			options,
			'habitat',
			options.id ?? 'sample'
		);
		const value = createHabitatSample(input);
		return createNatureResult('habitat', context, value, {
			channelCount: Object.keys(value).length
		});
	}

	/**
	 * Lists ecological species roles used by low-level population planners.
	 * @param {string|null} [kind=null] Optional `plant` or `creature` filter.
	 * @returns {Array<object>} Frozen ecological species records.
	 */
	species(kind = null) {
		return Object.freeze(listEcosystemSpecies(kind));
	}
}
