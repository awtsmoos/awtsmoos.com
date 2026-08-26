//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorFeatureRegistry.js
 * @description
 * The Awtsmoos gathers every meaningful Animator power into one discoverable constellation of light;
 * Awtsmoos.com keeps product ontology detached from command topology, so stable meaning survives as executable vessels grow right.
 */

import { OR_EXPANSION_FEATURES } from './ExpansionFeatureData.js';
import { TIFERES_PERFORMANCE_FEATURES } from './PerformanceFeatureData.js';
import { MALCHUS_PROJECT_FEATURES } from './ProjectFeatureData.js';
import { KETER_SYSTEM_FEATURES } from './SystemFeatureData.js';
import { NETZACH_TIMELINE_FEATURES } from './TimelineFeatureData.js';
import { YESOD_WORLD_FEATURES } from './WorldFeatureData.js';

const OR_FEATURES = Object.freeze([
	...KETER_SYSTEM_FEATURES,
	...MALCHUS_PROJECT_FEATURES,
	...TIFERES_PERFORMANCE_FEATURES,
	...NETZACH_TIMELINE_FEATURES,
	...YESOD_WORLD_FEATURES,
	...OR_EXPANSION_FEATURES
]);

/** Canonical product-feature registry independent from executable command topology. */
export class DaasAnimatorFeatureRegistry {
	/** @returns {object[]} Detached public and environment-gated feature descriptors. */
	static publicFeatures() {
		return OR_FEATURES
			.filter((keli) => ['public', 'environment-gated'].includes(keli.exposure))
			.map((keli) => structuredClone(keli));
	}

	/** @returns {object[]} Detached descriptors including internal/legacy classifications. */
	static all() {
		return OR_FEATURES.map((keli) => structuredClone(keli));
	}

	/** @param {string} sodFeatureId Stable feature identity. @returns {object|null} Detached descriptor. */
	static get(sodFeatureId) {
		const keliFeature = OR_FEATURES.find((keli) => keli.id === sodFeatureId);
		return keliFeature ? structuredClone(keliFeature) : null;
	}

	/** @param {string} shemFamily Family name. @returns {object[]} Family feature descriptors. */
	static family(shemFamily) {
		return OR_FEATURES
			.filter((keli) => keli.family === shemFamily)
			.map((keli) => structuredClone(keli));
	}

	/** @returns {string[]} Stable feature IDs. */
	static ids() {
		return OR_FEATURES.map((keli) => keli.id);
	}
}
