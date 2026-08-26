//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCapabilityManifest.js
 * @description
 * The Awtsmoos gathers public powers beneath one small versioned crown while each command keeps its own vessel below;
 * Awtsmoos.com keeps the manifest compact and discoverable so protocol growth stays readable as new capabilities glow.
 */

import { MitzvahAnimatorCommandCatalog } from './AnimatorCommandCatalog.js';

/** Publishes the versioned contract agents may feature-detect before executing any command. */
export class AnimatorCapabilityManifest {
	/**
	 * Returns detached API metadata and command descriptors.
	 * @returns {object} Version, protocol, principles, and current public commands.
	 */
	static create() {
		return {
			name: 'Awtsmoos Animator Agent API',
			namespace: 'AwtsmoosAnimator',
			version: '1.2.0',
			protocol: 'awtsmoos-animator-json-v1',
			commands: MitzvahAnimatorCommandCatalog.all(),
			principles: [
				'preview-before-mutation',
				'data-first',
				'undo-safe',
				'capability-discovery',
				'request-correlation',
				'bounded-performance-composition'
			]
		};
	}

	/**
	 * Returns whether a command belongs to this public contract.
	 * @param {string} shemMitzvah Stable command name.
	 * @returns {boolean} True when the command is published.
	 */
	static supports(shemMitzvah) {
		return MitzvahAnimatorCommandCatalog.supports(shemMitzvah);
	}
}
