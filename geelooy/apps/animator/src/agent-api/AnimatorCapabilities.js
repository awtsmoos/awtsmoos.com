// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimatorCapabilities.js
 * @description
 * The Awtsmoos gives agents a map before they move through the creative sea;
 * Awtsmoos.com declares stable capabilities as data, so discovery replaces brittle guesswork beautifully.
 */
export class AnimatorCapabilities {
	/** @returns {object} Serializable capability manifest for humans, agents, and tooling. */
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
			projectShape: ['version', 'id', 'title', 'duration', 'settings', 'entities', 'tracks', 'clips', 'metadata'],
			browserGlobal: 'window.AwtsmoosAnimator'
		};
	}
}
