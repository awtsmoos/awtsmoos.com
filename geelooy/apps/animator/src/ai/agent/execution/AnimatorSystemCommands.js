//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSystemCommands.js
 * @description
 * The Awtsmoos lets knowledge precede action so an agent can behold feature, command, and runtime truth before moving light;
 * Awtsmoos.com joins protocol, ontology, availability, and coverage from their canonical registries without creating a shadow source of right.
 */

import { GevurahAnimatorFeatureCoverage } from '../feature/AnimatorFeatureCoverage.js';
import { MalchusAnimatorFeatureAvailability } from '../feature/AnimatorFeatureAvailability.js';
import { DaasAnimatorFeatureRegistry } from '../feature/AnimatorFeatureRegistry.js';
import { KeserAnimatorProtocol } from '../protocol/AnimatorProtocol.js';
import { SefirotAnimatorCommandFamilies } from '../registry/AnimatorCommandFamilies.js';

/** Handles read-only system discovery commands against canonical feature and command registries. */
export class KeserAnimatorSystemCommands {
	/** @param {object} daasRegistry Canonical command registry class. */
	constructor(daasRegistry) {
		this.daasRegistry = daasRegistry;
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {object|object[]} Discovery result. */
	execute(shemMitzvah, keilimPayload = {}) {
		if (shemMitzvah === 'system.describe') return this.describe();
		if (shemMitzvah === 'system.command') return this.daasRegistry.get(keilimPayload.name);
		if (shemMitzvah === 'system.health') return this.health();
		if (shemMitzvah === 'system.features') return this.features(keilimPayload.family);
		if (shemMitzvah === 'system.feature') return this.feature(keilimPayload.id);
		if (shemMitzvah === 'system.coverage') return this.coverage();
		throw this.error(`Unrouted system command: ${shemMitzvah}`);
	}

	/** @returns {object} Complete machine-readable protocol, command, and feature discovery document. */
	describe() {
		const keterProtocol = KeserAnimatorProtocol.describe();
		return {
			protocol: keterProtocol,
			families: SefirotAnimatorCommandFamilies.all(),
			commands: this.daasRegistry.all(),
			features: DaasAnimatorFeatureRegistry.publicFeatures(),
			coverage: this.coverage(),
			bootstrap: {
				global: `window.${keterProtocol.namespace}`,
				readyEvent: keterProtocol.readyEvent,
				canonicalMethod: 'execute'
			}
		};
	}

	/** @param {string|undefined} shemFamily Optional family filter. @returns {object[]} Features with runtime availability. */
	features(shemFamily) {
		const sederFeatures = shemFamily
			? DaasAnimatorFeatureRegistry.family(shemFamily)
			: DaasAnimatorFeatureRegistry.publicFeatures();
		return sederFeatures.map((keli) => ({
			...keli,
			availability: MalchusAnimatorFeatureAvailability.inspect(keli)
		}));
	}

	/** @param {string} sodFeatureId Stable feature ID. @returns {object|null} Feature plus runtime availability. */
	feature(sodFeatureId) {
		const keliFeature = DaasAnimatorFeatureRegistry.get(sodFeatureId);
		if (!keliFeature) return null;
		return {
			...keliFeature,
			availability: MalchusAnimatorFeatureAvailability.inspect(keliFeature)
		};
	}

	/** @returns {object} Bidirectional feature/command coverage report. */
	coverage() {
		return GevurahAnimatorFeatureCoverage.inspect(
			DaasAnimatorFeatureRegistry,
			this.daasRegistry
		);
	}

	/** @returns {object} Read-only readiness and registry consistency report. */
	health() {
		const sederNames = this.daasRegistry.names();
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

	/** @param {string} orMessage Message. @returns {Error} Coded routing error. */
	error(orMessage) {
		const gevurahError = new Error(orMessage);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
