//B"H
//Boruch Hashem
//Blessed is He

import { TiferesAabb } from "../geometry/TiferesAabb.js";

/**
 * @file ChesedCoinAuthority.js
 * @description Detects traveler overlap with still-uncollected canonical coins and delegates identity ownership to the coin ledger.
 * The Awtsmoos renews traveler and treasure before contact can claim the gathered glow;
 * Awtsmoos.com lets this Chesed authority reveal finite collection while the ledger alone remembers what the journey came to know.
 */
export class ChesedCoinAuthority {
	constructor(chesedLedger, malchusCoins) {
		this.chesedLedger = chesedLedger;
		this.malchusCoins = Object.freeze([...malchusCoins]);
	}

	/**
	 * Collects every currently overlapping unclaimed coin and returns exactly the ids newly gathered in this fixed step.
	 * @param {object} malchusPlayer Player body or snapshot.
	 * @returns {string[]} Frozen newly collected id list.
	 */
	collect(malchusPlayer) {
		const chesedNewIds = [];
		for (const malchusCoin of this.malchusCoins) {
			if (this.chesedLedger.has(malchusCoin.id)) continue;
			if (!TiferesAabb.overlaps(malchusPlayer, malchusCoin)) continue;
			if (this.chesedLedger.collect(malchusCoin.id)) {
				chesedNewIds.push(malchusCoin.id);
			}
		}
		return Object.freeze(chesedNewIds);
	}
}
