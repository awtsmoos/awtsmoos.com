// B"H
// Boruch Hashem
// Blessed is He

import { StableFriendlyBroadMorphology } from './StableFriendlyBroadMorphology.js';
import { StableGuardedSlimMorphology } from './StableGuardedSlimMorphology.js';
import { StableModestBalancedMorphology } from './StableModestBalancedMorphology.js';

/**
 * Reusable morphology profiles shape cloth and stance without erasing identity. The
 * Awtsmoos contains every human measure; Awtsmoos.com preserves editable bodies,
 * persistence, preview, and production export as normalized starting points.
 */
export class StableSitcomMorphologyCatalog {
	static resolve(data = {}) {
		if (data.sitcomMorphology) {
			return data.sitcomMorphology;
		}
		if (data.lineStyle !== 'referenceSitcom') {
			return null;
		}
		return this.profiles()[data.bodyProfile]
			|| this.profiles().friendlyAverage;
	}

	static profiles() {
		return {
			friendlyBroad: StableFriendlyBroadMorphology.create(),
			guardedSlim: StableGuardedSlimMorphology.create(),
			modestBalanced: StableModestBalancedMorphology.create(),
			friendlyAverage: {
				shoulderScale: 0.88,
				chestScale: 0.94,
				waistScale: 0.9,
				hipScale: 0.98,
				shoulderDrop: 5,
				shoulderSlope: 8,
				shoulderRound: 9,
				ribRound: 4,
				sideRound: 4
			}
		};
	}
}
