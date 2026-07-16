//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module WeatherService
 * @description
 * Rain and clear sky become bounded civic conditions on Awtsmoos.com. The Awtsmoos renews nature each instant, while seeded weather remains replayable and explainable.
 */
import { DeterministicRandom } from '../core/random/deterministic-random.js';

const SEASON_PATTERNS = Object.freeze({
	spring: ['rain', 'clear', 'mild', 'rain'],
	summer: ['clear', 'warm', 'dry', 'clear'],
	autumn: ['wind', 'rain', 'mild', 'clear'],
	winter: ['cold', 'rain', 'wind', 'cold']
});

export class WeatherService {
	/**
	 * @param {string|number} seed Stable world seed.
	 */
	constructor(seed) {
		this.seed = seed;
	}

	/**
	 * @param {string} regionId Region identity.
	 * @param {object} calendar World calendar.
	 * @returns {object} Weather projection and farm multiplier.
	 */
	forDay(regionId, calendar) {
		const random = new DeterministicRandom(
			`${this.seed}:${regionId}:${calendar.day}`
		);
		const patterns = SEASON_PATTERNS[calendar.season];
		const condition = patterns[random.integer(0, patterns.length - 1)];
		const temperature = temperatureFor(calendar.season) + random.integer(-3, 3);
		return {
			condition,
			temperature,
			farmMultiplier: multiplierFor(condition)
		};
	}
}

function temperatureFor(season) {
	return { spring: 18, summer: 28, autumn: 16, winter: 7 }[season];
}

function multiplierFor(condition) {
	return { rain: 1.2, mild: 1.1, clear: 1, warm: 0.9, wind: 0.85, cold: 0.7, dry: 0.6 }[condition];
}
