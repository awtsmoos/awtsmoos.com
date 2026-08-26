//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCapabilities.js
 * @description
 * The Awtsmoos preserves an older agent map while clearly revealing the canonical covenant now shining beyond its sea;
 * Awtsmoos.com keeps every historical identity intact while additive migration metadata prevents legacy capability from masquerading as the current API tree.
 */

import { GevurahAnimatorLegacyPolicy } from '../ai/agent/legacy/AnimatorLegacyPolicy.js';

/** Historical capability manifest retained for source-path and data-shape compatibility. */
export class AnimatorCapabilities {
	/**
	 * Returns the historical capability declaration plus additive migration guidance.
	 * @returns {object} Serializable legacy capabilities.
	 */
	static describe() {
		return {
			api: 'AwtsmoosAnimator',
			version: '1.0.0',
			projectDocumentVersion: 1,
			actions: [
				'capabilities',
				'snapshot',
				'loadProject',
				'generateScene',
				'samplePerformance',
				'sampleDialogue',
				'openPanel',
				'openCharacterLab',
				'exportMovie'
			],
			performanceChannels: [
				'mouth',
				'phoneme-coarticulation',
				'brows',
				'eyes',
				'cheeks',
				'blink',
				'breath',
				'head',
				'shoulders',
				'weight',
				'gesture'
			],
			projectShape: [
				'version',
				'id',
				'title',
				'duration',
				'settings',
				'entities',
				'tracks',
				'clips',
				'metadata'
			],
			browserGlobal: 'window.AwtsmoosAnimator',
			surface: 'legacy',
			compatibility: GevurahAnimatorLegacyPolicy.metadata('1.0.0')
		};
	}
}
