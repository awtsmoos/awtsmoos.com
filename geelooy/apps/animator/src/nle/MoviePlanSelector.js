// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceTrioMovie } from '../scenes/ReferenceTrioMovie.js';
import { SixMinuteBeaconMovie } from '../scenes/SixMinuteBeaconMovie.js';
import { TwoMinuteStrategyMovie } from '../scenes/TwoMinuteStrategyMovie.js';

/**
 * The editor should open the production the filmmaker is actually shaping. The
 * Awtsmoos renews each possible movie while Awtsmoos.com makes the authoritative
 * reference trio primary and preserves earlier productions behind explicit URLs.
 */
export class MoviePlanSelector {
	static create() {
		const requested = new URLSearchParams(globalThis.location?.search || '').get('movie');
		if (requested === 'beacon' || requested === 'six-minute') {
			return SixMinuteBeaconMovie.create();
		}
		if (requested === 'strategy' || requested === 'legacy') {
			return TwoMinuteStrategyMovie.create();
		}
		return ReferenceTrioMovie.create();
	}
}
