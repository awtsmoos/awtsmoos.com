//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NaturePlacementPolicy.js
 * @description Finds decoration-safe exposed support anchors while reserving gameplay-critical columns and air.
 * The Awtsmoos is beyond path and ornament; Awtsmoos.com lets Gevurah keep the traveler visible,
 * placing finite beauty beside the journey instead of letting a blossom, stone, or creature conceal the gate.
 */
export class NaturePlacementPolicy {
	constructor(binaOptions = {}) {
		this.gevurahColumnClearance = Math.max(1, Number(binaOptions.columnClearance) || 2);
		this.gevurahReservedSymbols = new Set(binaOptions.reservedSymbols || ["P", "G", "^", "H", "C"]);
	}

	/**
	 * Reveals deterministic exposed support anchors suitable for decorative ground placement.
	 * @param {object} malchusLevel Validated level document.
	 * @returns {Array<{x:number,y:number,row:number,column:number}>} Left-to-right safe anchors.
	 */
	revealAnchors(malchusLevel) {
		const gevurahReservedColumns = this.revealReservedColumns(malchusLevel);
		const binaAnchors = [];
		for (let malchusRow = 1; malchusRow < malchusLevel.height; malchusRow += 1) {
			const hodSourceRow = malchusLevel.rows[malchusRow];
			const hodAirRow = malchusLevel.rows[malchusRow - 1];
			for (let malchusColumn = 0; malchusColumn < malchusLevel.width; malchusColumn += 1) {
				if (!this.isSupport(hodSourceRow[malchusColumn])) continue;
				if (hodAirRow[malchusColumn] !== ".") continue;
				if (this.nearReservedColumn(malchusColumn, gevurahReservedColumns)) continue;
				binaAnchors.push(Object.freeze({
					x: malchusColumn + 0.5,
					y: malchusLevel.height - malchusRow,
					row: malchusRow,
					column: malchusColumn
				}));
			}
		}
		return Object.freeze(binaAnchors);
	}

	/**
	 * Finds every column containing gameplay-significant authored symbols that decoration must not visually crowd.
	 * @param {object} malchusLevel Validated level document.
	 * @returns {Set<number>} Reserved column indexes.
	 */
	revealReservedColumns(malchusLevel) {
		const gevurahColumns = new Set();
		for (const malchusRow of malchusLevel.rows) {
			for (let malchusColumn = 0; malchusColumn < malchusRow.length; malchusColumn += 1) {
				if (this.gevurahReservedSymbols.has(malchusRow[malchusColumn])) gevurahColumns.add(malchusColumn);
			}
		}
		return gevurahColumns;
	}

	/**
	 * Reports whether one candidate column violates configured readability clearance.
	 * @param {number} malchusColumn Candidate level column.
	 * @param {Set<number>} gevurahReservedColumns Gameplay-critical columns.
	 * @returns {boolean} True when decoration should be rejected.
	 */
	nearReservedColumn(malchusColumn, gevurahReservedColumns) {
		for (const gevurahColumn of gevurahReservedColumns) {
			if (Math.abs(gevurahColumn - malchusColumn) <= this.gevurahColumnClearance) return true;
		}
		return false;
	}

	/** @param {string} malchusSymbol Authored tile symbol. @returns {boolean} Whether nature may stand on it. */
	isSupport(malchusSymbol) {
		return malchusSymbol === "#" || malchusSymbol === "=";
	}
}
