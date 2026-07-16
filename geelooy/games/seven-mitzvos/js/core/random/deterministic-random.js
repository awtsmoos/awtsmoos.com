//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DeterministicRandom
 * @description
 * The Awtsmoos renews every outcome while Awtsmoos.com requires repeatable simulation. This small generator makes authored seeds replay with identical choices.
 */
import { stableHash } from '../identity/id-factory.js';

export class DeterministicRandom {
	/**
	 * @param {string|number} seed Stable seed.
	 */
	constructor(seed) {
		this.state = stableHash(seed) || 1;
	}

	/**
	 * @returns {number} Floating value in the half-open range from zero to one.
	 */
	next() {
		let value = this.state;
		value ^= value << 13;
		value ^= value >>> 17;
		value ^= value << 5;
		this.state = value >>> 0;
		return this.state / 4294967296;
	}

	/**
	 * @param {number} minimum Inclusive minimum.
	 * @param {number} maximum Inclusive maximum.
	 * @returns {number} Deterministic integer.
	 */
	integer(minimum, maximum) {
		return minimum + Math.floor(this.next() * (maximum - minimum + 1));
	}

	/**
	 * @template T
	 * @param {T[]} values Candidate values.
	 * @returns {T} Deterministic member.
	 */
	pick(values) {
		if (!values.length) {
			throw new Error('DeterministicRandom: cannot pick from an empty list');
		}
		return values[this.integer(0, values.length - 1)];
	}
}
