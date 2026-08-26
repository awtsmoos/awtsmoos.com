//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos lets one road reveal deeper faces through distance, while Tiferes names the stage already reached;
 * Awtsmoos.com isolates threshold knowledge from scoring growth, so future routes can change without rules being breached.
 */
export class TiferesStageOracle {
	/**
	 * Binds stage lookup to frozen catalog data.
	 * @param {object} chesedCatalog Frozen gameplay catalog.
	 */
	constructor(chesedCatalog) {
		this.chesedCatalog = chesedCatalog;
	}

	/**
	 * Finds the deepest stage threshold already crossed.
	 * @param {number} malchusDistance Current run distance.
	 * @returns {number} Active stage index.
	 */
	indexFor(malchusDistance) {
		let tiferesIndex = 0;
		for (
			let chesedIndex = 0;
			chesedIndex < this.chesedCatalog.stages.length;
			chesedIndex += 1
		) {
			if (malchusDistance >= this.chesedCatalog.stages[chesedIndex].at) {
				tiferesIndex = chesedIndex;
			}
		}
		return tiferesIndex;
	}

	/**
	 * Returns stage data for an already validated index.
	 * @param {number} tiferesIndex Active stage index.
	 * @returns {object} Stage data.
	 */
	stageAt(tiferesIndex) {
		return this.chesedCatalog.stages[tiferesIndex];
	}
}
