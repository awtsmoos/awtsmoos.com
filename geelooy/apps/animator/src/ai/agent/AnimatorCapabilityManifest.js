//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCapabilityManifest.js
 * @description
 * The Awtsmoos gathers commands and product meaning beneath one discoverable crown while each schema keeps its boundary below;
 * Awtsmoos.com publishes feature ontology beside executable contracts so old agents remain welcome and new agents know what powers still grow.
 */

import { MitzvahAnimatorCommandCatalog } from './AnimatorCommandCatalog.js';
import { GevurahAnimatorFeatureCoverage } from './feature/AnimatorFeatureCoverage.js';
import { DaasAnimatorFeatureRegistry } from './feature/AnimatorFeatureRegistry.js';
import { KeserAnimatorProtocol } from './protocol/AnimatorProtocol.js';
import { DaasAnimatorCommandRegistry } from './registry/AnimatorCommandRegistry.js';

/** Publishes the versioned contract agents may feature-detect before executing any command. */
export class AnimatorCapabilityManifest {
	/** @returns {object} Detached API identity, protocol, feature ontology, commands, and principles. */
	static create() {
		const keterProtocol = KeserAnimatorProtocol.describe();
		return {
			name: 'Awtsmoos Animator Agent API',
			namespace: keterProtocol.namespace,
			version: keterProtocol.version,
			compatibleFrom: keterProtocol.compatibleFrom,
			protocol: keterProtocol.name,
			commands: MitzvahAnimatorCommandCatalog.all(),
			features: DaasAnimatorFeatureRegistry.publicFeatures(),
			coverage: GevurahAnimatorFeatureCoverage.inspect(
				DaasAnimatorFeatureRegistry,
				DaasAnimatorCommandRegistry
			),
			principles: [
				'preview-before-mutation',
				'data-first',
				'undo-safe',
				'capability-discovery',
				'feature-coverage-proof',
				'request-correlation',
				'bounded-performance-composition',
				'deterministic-world-generation',
				'schema-driven-validation',
				'explicit-mutation-scope'
			]
		};
	}

	/** @param {string} shemMitzvah Stable command name. @returns {boolean} True when publicly registered. */
	static supports(shemMitzvah) {
		return MitzvahAnimatorCommandCatalog.supports(shemMitzvah);
	}
}
