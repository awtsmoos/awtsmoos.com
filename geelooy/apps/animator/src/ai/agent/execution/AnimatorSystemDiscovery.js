//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSystemDiscovery.js
 * @description
 * The Awtsmoos lets command law, product ontology, runtime circumstance, and coverage meet in one clear mirror;
 * Awtsmoos.com keeps discovery separate from routing so System remains small while agents see the entire creative river.
 */

import { GevurahAnimatorFeatureCoverage } from '../feature/AnimatorFeatureCoverage.js';
import { MalchusAnimatorFeatureAvailability } from '../feature/AnimatorFeatureAvailability.js';
import { DaasAnimatorFeatureRegistry } from '../feature/AnimatorFeatureRegistry.js';
import { KeserAnimatorProtocol } from '../protocol/AnimatorProtocol.js';
import { SefirotAnimatorCommandFamilies } from '../registry/AnimatorCommandFamilies.js';

/** Builds detached machine-readable discovery documents from canonical registries and live runtime context. */
export class DaasAnimatorSystemDiscovery {
	/** @param {object} daasCommands Command registry. @param {object} keterRuntime Live runtime context. */
	constructor(daasCommands, keterRuntime = {}) {
		this.daasCommands = daasCommands;
		this.keterRuntime = keterRuntime;
	}

	/** @returns {object} Complete protocol, command, feature, coverage, and bootstrap description. */
	describe() {
		const keterProtocol = KeserAnimatorProtocol.describe();
		return {
			protocol: keterProtocol,
			families: SefirotAnimatorCommandFamilies.all(),
			commands: this.daasCommands.all(),
			features: this.features(),
			coverage: this.coverage(),
			bootstrap: {
				global: `window.${keterProtocol.namespace}`,
				readyEvent: keterProtocol.readyEvent,
				canonicalMethod: 'execute'
			}
		};
	}

	/** @param {string|undefined} shemFamily Optional family filter. @returns {object[]} Runtime-aware public features. */
	features(shemFamily) {
		const sederFeatures = shemFamily
			? DaasAnimatorFeatureRegistry.family(shemFamily)
			: DaasAnimatorFeatureRegistry.publicFeatures();
		return sederFeatures.map((keliFeature) => this.withAvailability(keliFeature));
	}

	/** @param {string} sodFeatureId Stable feature ID. @returns {object|null} Runtime-aware feature. */
	feature(sodFeatureId) {
		const keliFeature = DaasAnimatorFeatureRegistry.get(sodFeatureId);
		return keliFeature ? this.withAvailability(keliFeature) : null;
	}

	/** @returns {object} Bidirectional feature/command coverage report. */
	coverage() {
		return GevurahAnimatorFeatureCoverage.inspect(
			DaasAnimatorFeatureRegistry,
			this.daasCommands
		);
	}

	/** @returns {object} Read-only API readiness and registry health report. */
	health() {
		const sederNames = this.daasCommands.names();
		return {
			ok: true,
			ready: true,
			commandCount: sederNames.length,
			featureCount: DaasAnimatorFeatureRegistry.publicFeatures().length,
			uniqueCommands: new Set(sederNames).size === sederNames.length,
			coverage: this.coverage(),
			protocol: KeserAnimatorProtocol.describe()
		};
	}

	/** @param {object} keliFeature Feature descriptor. @returns {object} Feature plus availability. */
	withAvailability(keliFeature) {
		return {
			...keliFeature,
			availability: MalchusAnimatorFeatureAvailability.inspect(
				keliFeature,
				this.keterRuntime
			)
		};
	}
}
