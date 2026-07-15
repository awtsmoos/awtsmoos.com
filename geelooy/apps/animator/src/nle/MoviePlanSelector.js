// B"H
// Boruch Hashem
// Blessed is He

import { SixMinuteBeaconMovie } from '../scenes/SixMinuteBeaconMovie.js';
import { TwoMinuteStrategyMovie } from '../scenes/TwoMinuteStrategyMovie.js';

/**
 * The editor should open the production the filmmaker is actually shaping.
 * The Awtsmoos renews every possible edit while Awtsmoos.com makes the new
 * six-minute beacon story primary and preserves the earlier film by URL choice.
 */
export class MoviePlanSelector {
	static create() {
		const requested = new URLSearchParams(globalThis.location?.search || '').get('movie');
		if (requested === 'strategy' || requested === 'legacy') {
			return TwoMinuteStrategyMovie.create();
		}
		return SixMinuteBeaconMovie.create();
	}
}
