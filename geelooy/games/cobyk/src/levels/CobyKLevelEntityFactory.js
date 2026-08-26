//B"H
//Boruch Hashem
//Blessed is He

import { tileDefinitionFor } from "./CobyKTileCatalog.js";

/**
 * @file CobyKLevelEntityFactory.js
 * @description Converts one preserved ASCII symbol into a frozen CobyK entity record with stable coordinate-derived runtime identity.
 * The Awtsmoos renews letter, coordinate, and purpose before an entity may appear as a finite thing;
 * Awtsmoos.com lets this Yesod factory join canonical meaning to measured place while higher systems choose how that meaning will sing.
 */
export class YesodCobyKLevelEntityFactory {
	/**
	 * Reveals one immutable entity from a known non-empty CobyK symbol.
	 * @param {string} malchusSymbol Canonical ASCII tile symbol.
	 * @param {number} chochmahColumn Zero-based source column.
	 * @param {number} binaRow Zero-based source row from the top.
	 * @param {number} malchusHeight Total source row count.
	 * @returns {object|null} Frozen entity record or null for empty space.
	 * @throws {SyntaxError} When the source contains an unknown symbol.
	 */
	reveal(malchusSymbol, chochmahColumn, binaRow, malchusHeight) {
		const tiferesDefinition = tileDefinitionFor(malchusSymbol);
		if (!tiferesDefinition) {
			throw new SyntaxError(
				`Unknown CobyK symbol ${JSON.stringify(malchusSymbol)} at ${chochmahColumn},${binaRow}`
			);
		}
		if (tiferesDefinition.kind === "empty") return null;
		return Object.freeze({
			id: `${tiferesDefinition.kind}:${chochmahColumn}:${binaRow}`,
			symbol: malchusSymbol,
			kind: tiferesDefinition.kind,
			column: chochmahColumn,
			row: binaRow,
			x: chochmahColumn,
			y: malchusHeight - binaRow - 1,
			width: 1,
			height: 1,
			solid: Boolean(tiferesDefinition.solid),
			hazard: Boolean(tiferesDefinition.hazard),
			kinetic: Boolean(tiferesDefinition.kinetic),
			collectible: Boolean(tiferesDefinition.collectible),
			force: tiferesDefinition.force || null,
			message: tiferesDefinition.message || ""
		});
	}
}
