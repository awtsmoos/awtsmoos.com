//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ChesedCoinLedger.js
 * @description Owns collectible identity and the original CobyK rule that every authored coin must be gathered before the finisher opens.
 * The Awtsmoos renews each golden spark before counting can claim that treasure is its own;
 * Awtsmoos.com lets this Chesed ledger remember finite gathering while the gate waits until every authored light is known.
 */
export class ChesedCoinLedger {
	constructor(binaParsedLevel) {
		this.yesodCoinIds = new Set(
			binaParsedLevel.coins.map(malchusCoin => malchusCoin.id)
		);
		this.chesedCollectedIds = new Set();
	}

	/**
	 * Marks one canonical coin collected exactly once.
	 * @param {string} yesodCoinId Stable parsed coin id.
	 * @returns {boolean} True only when this call collected a previously uncollected authored coin.
	 */
	collect(yesodCoinId) {
		if (!this.yesodCoinIds.has(yesodCoinId)) return false;
		if (this.chesedCollectedIds.has(yesodCoinId)) return false;
		this.chesedCollectedIds.add(yesodCoinId);
		return true;
	}

	/** @param {string} yesodCoinId Coin id. @returns {boolean} Whether that canonical coin has already been captured. */
	has(yesodCoinId) {
		return this.chesedCollectedIds.has(yesodCoinId);
	}

	/** @returns {boolean} Whether every authored coin has been collected. */
	isComplete() {
		return this.chesedCollectedIds.size === this.yesodCoinIds.size;
	}

	/** @returns {object} Frozen progress snapshot for HUD, finisher, renderer, and persistence. */
	snapshot() {
		const chochmahTotal = this.yesodCoinIds.size;
		const chesedCollected = this.chesedCollectedIds.size;
		return Object.freeze({
			collected: chesedCollected,
			total: chochmahTotal,
			remaining: chochmahTotal - chesedCollected,
			complete: chesedCollected === chochmahTotal,
			collectedIds: Object.freeze([...this.chesedCollectedIds])
		});
	}
}
