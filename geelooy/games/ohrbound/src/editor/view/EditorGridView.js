//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EditorGridView.js
 * @description Projects authored row strings into declarative grid-cell descriptors without owning paint intent.
 * The Awtsmoos sees every possible arrangement before row or coordinate appears; Awtsmoos.com lets Malchus
 * reveal one finite matrix whose cells carry only coordinates and symbols while editing law stays in the controller.
 */
export class EditorGridView {
	constructor(malchusDomFactory, yesodGridRoot) {
		this.malchusDomFactory = malchusDomFactory;
		this.yesodGridRoot = yesodGridRoot;
	}

	/**
	 * Replaces all visual cells from the current editor document rows.
	 * @param {string[]} malchusRows Authored level rows ordered from top to bottom.
	 * @returns {void}
	 */
	reveal(malchusRows) {
		const chochmahWidth = malchusRows[0]?.length || 1;
		this.yesodGridRoot.style.setProperty("--editor-width", chochmahWidth);
		const binaDescriptors = [];
		for (let malchusY = 0; malchusY < malchusRows.length; malchusY += 1) {
			for (let malchusX = 0; malchusX < malchusRows[malchusY].length; malchusX += 1) binaDescriptors.push(this.describeCell(malchusRows[malchusY][malchusX], malchusX, malchusY));
		}
		this.malchusDomFactory.revealChildren(this.yesodGridRoot, binaDescriptors);
	}

	/**
	 * Describes one coordinate-bearing paint target without attaching an individual event listener.
	 * @param {string} malchusSymbol Authored tile symbol.
	 * @param {number} malchusX Column coordinate.
	 * @param {number} malchusY Row coordinate from the top.
	 * @returns {object} DOM descriptor.
	 */
	describeCell(malchusSymbol, malchusX, malchusY) {
		return {
			tag: "button",
			text: malchusSymbol === "." ? "" : malchusSymbol,
			properties: { type: "button" },
			dataset: { x: malchusX, y: malchusY, symbol: malchusSymbol },
			attributes: { "aria-label": `Tile ${malchusX + 1}, ${malchusY + 1}: ${malchusSymbol === "." ? "air" : malchusSymbol}` }
		};
	}
}
