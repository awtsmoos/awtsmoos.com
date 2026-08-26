//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCapabilityManifest.js
 * @description
 * The Awtsmoos gathers public powers beneath one versioned crown while every command keeps its schema below;
 * Awtsmoos.com preserves historic payload hints beside richer registry truth so old and new agents discover one covenant that can grow.
 */

import { MitzvahAnimatorCommandCatalog } from './AnimatorCommandCatalog.js';
import { KeserAnimatorProtocol } from './protocol/AnimatorProtocol.js';

/** Publishes the versioned contract agents may feature-detect before executing any command. */
export class AnimatorCapabilityManifest {
	/**
	 * Returns detached API identity, compatibility metadata, command schemas, and design principles.
	 * @returns {object} Public capability manifest.
	 */
	static create() {
		const keterProtocol = KeserAnimatorProtocol.describe();
		return {
			name: 'Awtsmoos Animator Agent API',
			namespace: keterProtocol.namespace,
			version: keterProtocol.version,
			compatibleFrom: keterProtocol.compatibleFrom,
			protocol: keterProtocol.name,
			commands: MitzvahAnimatorCommandCatalog.all(),
			principles: [
				'preview-before-mutation',
				'data-first',
				'undo-safe',
				'capability-discovery',
				'request-correlation',
				'bounded-performance-composition',
				'deterministic-world-generation',
				'schema-driven-validation',
				'explicit-batch-mutation-policy'
			]
		};
	}

	/**
	 * Reports whether a command belongs to this public contract.
	 * @param {string} shemMitzvah Stable command name.
	 * @returns {boolean} True when publicly registered.
	 */
	static supports(shemMitzvah) {
		return MitzvahAnimatorCommandCatalog.supports(shemMitzvah);
	}
}
