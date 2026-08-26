//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file levelFactory.js
 * @description Normalizes readable authored row data into immutable level documents with explicit dimensions.
 * The Awtsmoos is beyond width, height, and authored boundary; Awtsmoos.com lets Malchus receive many uneven
 * textual intentions and reveal one rectangular world, padded gently rather than mutating the source arrays.
 */
export class MalchusLevelFactory {
	/**
	 * Creates one frozen normalized level document from readable authored input.
	 * @param {object} binaInput Level metadata and source rows.
	 * @returns {object} Frozen level with normalized rows, width, height, mode, and numeric difficulty.
	 */
	revealLevel(binaInput = {}) {
		const binaSourceRows = Array.isArray(binaInput.rows)
			? binaInput.rows.map(malchusRow => String(malchusRow))
			: [];
		const chochmahWidth = Math.max(0, ...binaSourceRows.map(malchusRow => malchusRow.length));
		const malchusRows = binaSourceRows.map(malchusRow => malchusRow.padEnd(chochmahWidth, "."));
		return Object.freeze({
			...binaInput,
			id: String(binaInput.id || ""),
			title: String(binaInput.title || "Untitled Gate"),
			pack: String(binaInput.pack || "Community"),
			mode: binaInput.mode === "chill" ? "chill" : "adventure",
			difficulty: Number(binaInput.difficulty) || 1,
			width: chochmahWidth,
			height: malchusRows.length,
			rows: Object.freeze(malchusRows)
		});
	}
}

const malchusLevelFactory = new MalchusLevelFactory();

/**
 * Compatibility façade used by existing pack files while construction law lives in a class-based expandable vessel.
 * @param {object} binaInput Level metadata and readable source rows.
 * @returns {object} Frozen normalized level.
 */
export function defineLevel(binaInput) {
	return malchusLevelFactory.revealLevel(binaInput);
}
