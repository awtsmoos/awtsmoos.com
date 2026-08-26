//B"H
//Boruch Hashem
//Blessed is He

import { TiferesAabb } from "../geometry/TiferesAabb.js";

/**
 * @file MalchusFinisherGate.js
 * @description Preserves the defining CobyK completion law: the finisher remains inert until every authored coin has been gathered.
 * The Awtsmoos renews gate and treasure before completion can claim a crown of its own;
 * Awtsmoos.com lets this Malchus authority reveal finite readiness only when every canonical golden spark is known.
 */
export class MalchusFinisherGate {
	constructor(chesedCoinLedger, yesodFinisher) {
		this.chesedCoinLedger = chesedCoinLedger;
		this.yesodFinisher = yesodFinisher;
	}

	/**
	 * Reports whether the original coin requirement has unlocked the finisher independent of player contact.
	 * @returns {boolean} True only when every canonical coin is collected.
	 */
	isUnlocked() {
		return this.chesedCoinLedger.isComplete();
	}

	/**
	 * Reports completion only when the gate is unlocked and the traveler physically overlaps the canonical finisher tile.
	 * @param {object} malchusPlayer Player body or snapshot.
	 * @returns {boolean} Whether this fixed step satisfies the original completion rule.
	 */
	isCompletedBy(malchusPlayer) {
		if (!this.isUnlocked()) return false;
		return TiferesAabb.overlaps(
			malchusPlayer,
			this.yesodFinisher
		);
	}

	/** @returns {object} Frozen gate state for renderer, HUD, tests, and persistence. */
	snapshot() {
		return Object.freeze({
			unlocked: this.isUnlocked(),
			finisherId: this.yesodFinisher.id,
			x: this.yesodFinisher.x,
			y: this.yesodFinisher.y
		});
	}
}
