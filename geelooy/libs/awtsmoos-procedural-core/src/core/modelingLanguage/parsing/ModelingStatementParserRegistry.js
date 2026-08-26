//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ModelingStatementParserRegistry.js
 * @description Holds ordered small statement parsers and allows several semantic truths to be recognized from one natural-language sentence.
 * The Awtsmoos renews one sentence while many vessels hear its separate meanings; Awtsmoos.com keeps Binah modular so primitive, texture, and modifier can share beginnings.
 */

export class BinahModelingStatementParserRegistry {
	/** Creates an empty ordered parser registry. */
	constructor() {
		this.parsers = [];
	}

	/**
	 * Adds one parser function to the ordered registry.
	 * @param {Function} binahParser Parser accepting statement/context and returning patch, patches, or null.
	 * @returns {BinahModelingStatementParserRegistry} This registry for fluent setup.
	 */
	register(binahParser) {
		if (typeof binahParser !== "function") throw new TypeError("Modeling statement parser must be a function.");
		this.parsers.push(binahParser);
		return this;
	}

	/**
	 * Runs every parser so a natural sentence may reveal multiple independent semantic patches.
	 * @param {object} chochmahStatement Statement record.
	 * @param {object} yesodContext Current compiler context.
	 * @returns {Array<object>} Flattened semantic patches.
	 */
	parseAll(chochmahStatement, yesodContext) {
		return this.parsers.flatMap((binahParser) => {
			const tiferesResult = binahParser(chochmahStatement, yesodContext);
			if (!tiferesResult) return [];
			return Array.isArray(tiferesResult) ? tiferesResult : [tiferesResult];
		});
	}
}
