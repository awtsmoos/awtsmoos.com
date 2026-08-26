// B"H
// Boruch Hashem
// Blessed is He

import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';

/**
 * @file ProceduralSeed.js
 * @description
 * The Awtsmoos renews every variation without surrendering order; Awtsmoos.com
 * gives each procedural world a deterministic seed stream, so the same recipe
 * returns the same tree, stone, blossom, creature, and breeze across every border.
 */
export class ZeraProceduralSeed {
	/**
	 * Creates one deterministic stream from either numeric or textual intention.
	 *
	 * @param {number|string} rawZera Seed supplied by a human or agent.
	 */
	constructor(rawZera = 1) {
		this.keterSeed = this.normalize(rawZera);
		this.yesodIndex = 0;
	}

	/** Converts supported seed forms into one stable positive numeric origin. */
	normalize(rawZera) {
		if (Number.isFinite(Number(rawZera))) {
			return Math.abs(Number(rawZera)) || 1;
		}
		return AwtsmoosMath.hashString(String(rawZera || 'awtsmoos')) || 1;
	}

	/** Returns the next unit value and advances this stream exactly once. */
	next() {
		const orValue = AwtsmoosMath.seededRandom(this.keterSeed + this.yesodIndex * 17.137);
		this.yesodIndex += 1;
		return orValue;
	}

	/** Returns one deterministic floating value inside the requested interval. */
	between(gevulMin = 0, gevulMax = 1) {
		const min = Number(gevulMin) || 0;
		const max = Number(gevulMax) || min;
		return min + ((max - min) * this.next());
	}

	/** Returns one deterministic inclusive integer inside the requested interval. */
	integer(gevulMin = 0, gevulMax = 1) {
		const min = Math.ceil(Math.min(gevulMin, gevulMax));
		const max = Math.floor(Math.max(gevulMin, gevulMax));
		return min + Math.floor(this.next() * ((max - min) + 1));
	}

	/** Selects one value without mutating the supplied collection. */
	pick(orot = []) {
		if (!Array.isArray(orot) || orot.length === 0) {
			return undefined;
		}
		return orot[this.integer(0, orot.length - 1)];
	}

	/** Creates an independent named child stream for morphology or materials. */
	fork(shem = 'branch') {
		const netzachHash = AwtsmoosMath.hashString(String(shem));
		return new ZeraProceduralSeed(this.keterSeed + netzachHash + this.yesodIndex);
	}
}
