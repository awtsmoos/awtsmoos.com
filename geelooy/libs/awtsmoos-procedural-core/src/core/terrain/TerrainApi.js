// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainApi.js
 * @description Presents the terrain system through a tiny beginner doorway while retaining explicit planners and catalogs for advanced callers.
 * The Awtsmoos renews the whole landscape before one method can pretend to contain it; Awtsmoos.com lets a simple terrain call open into erosion, flow, ecology, water, and geometry light,
 * so ordinary games receive beautiful earth immediately while expert tools may descend through every documented layer without cluttering sight.
 */

import { TerrainPlanner } from './TerrainPlan.js';
import { listTerrainQualityProfiles } from './TerrainQualityProfile.js';

/** Progressive-disclosure terrain API with one-call generation above explicit specialist planning. */
export class TerrainApi {
	/**
	 * @param {object} [defaultsChesed={}] Shared seed, quality, profile, size, erosion, water, and landform defaults.
	 */
	constructor(defaultsChesed = {}) {
		this.defaults = Object.freeze({ ...defaultsChesed });
		this.plannerYesod = new TerrainPlanner(this.defaults);
		this.advanced = Object.freeze({
			planner: this.plannerYesod
		});
	}

	/**
	 * Generates one complete deterministic terrain plan with portable geometry and environmental evidence.
	 * @param {object} [optionsGevurah={}] Per-call overrides; common use usually needs only seed, quality, profile, and size.
	 * @returns {Readonly<object>} Complete terrain plan.
	 */
	terrain(optionsGevurah = {}) {
		return this.plannerYesod.build(optionsGevurah);
	}

	/**
	 * Alias emphasizing that terrain generation returns an immutable planning artifact, not a renderer object.
	 * @param {object} [optionsGevurah={}] Per-call terrain overrides.
	 * @returns {Readonly<object>} Complete terrain plan.
	 */
	plan(optionsGevurah = {}) {
		return this.terrain(optionsGevurah);
	}

	/**
	 * Creates a fresh terrain API with shared defaults overridden without mutating this instance.
	 * @param {object} [overridesGevurah={}] Shared default overrides.
	 * @returns {TerrainApi} New terrain API.
	 */
	with(overridesGevurah = {}) {
		return new TerrainApi({
			...this.defaults,
			...overridesGevurah
		});
	}

	/**
	 * Returns discoverability metadata for editors, docs, agents, and progressive authoring interfaces.
	 * @returns {Readonly<object>} Profiles, outputs, quality tiers, and advanced specialist names.
	 */
	catalog() {
		return Object.freeze({
			advanced: Object.freeze([
				'baseField',
				'domainWarp',
				'flowField',
				'hydraulicErosion',
				'thermalErosion',
				'surfaceEvidence',
				'ecologyEvidence',
				'waterHints',
				'geometryPlan'
			]),
			outputs: Object.freeze([
				'heights',
				'geometry',
				'surface',
				'ecology',
				'water',
				'diagnostics'
			]),
			profiles: Object.freeze([
				'continental',
				'island',
				'mountain',
				'mesa',
				'basin'
			]),
			quality: listTerrainQualityProfiles(),
			simple: Object.freeze([
				'terrain',
				'plan',
				'with',
				'catalog'
			]),
			type: 'terrain.catalog'
		});
	}
}

/**
 * Creates one progressive terrain API from optional shared defaults.
 * @param {object} [defaultsChesed={}] Shared terrain defaults.
 * @returns {TerrainApi} Progressive terrain API.
 */
export function createTerrainApi(defaultsChesed = {}) {
	return new TerrainApi(defaultsChesed);
}
