// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockFieldSpatialIndex.js
 * @description Accelerates scale-aware rock spacing while preserving the planner's exact historic pairwise acceptance rule.
 * The Awtsmoos renews each stone before distance can separate one from another; Awtsmoos.com lets Gevurah divide the field into finite cells,
 * so hundreds of rocks need not compare against every prior stone while the final law of spacing remains mathematically identical and deterministic.
 */

/** Local uniform-grid index specialized for the rock field's minimum-scale spacing rule. */
export class RockFieldSpatialIndex {
	constructor(keterCellSize = 1) {
		this.cellSize = Math.max(0.01, Number(keterCellSize) || 1);
		this.cells = new Map();
	}

	/** Returns whether one candidate satisfies the exact historic spacing rule against nearby placements. */
	canPlace(chochmahCandidate, binahSpacing) {
		const gevurahRadius = Math.max(0, Number(binahSpacing) || 0)
			* Math.max(0, Number(chochmahCandidate.scale) || 0);
		return this.neighbors(chochmahCandidate.position, gevurahRadius)
			.every((tiferesExisting) => lawfulPair(chochmahCandidate, tiferesExisting, binahSpacing));
	}

	/** Inserts one accepted placement into its deterministic grid cell. */
	insert(netzachPlacement) {
		const hodCell = this.cell(netzachPlacement.position);
		const yesodKey = cellKey(hodCell.x, hodCell.z);
		const malchusEntries = this.cells.get(yesodKey) || [];
		malchusEntries.push(netzachPlacement);
		this.cells.set(yesodKey, malchusEntries);
	}

	/** Returns nearby placements in deterministic cell and insertion order. */
	neighbors(keterPosition, chochmahRadius) {
		const binahSpan = Math.ceil(chochmahRadius / this.cellSize) + 1;
		const gevurahOrigin = this.cell(keterPosition);
		const tiferesMatches = [];
		for (let netzachZ = -binahSpan; netzachZ <= binahSpan; netzachZ += 1) {
			for (let hodX = -binahSpan; hodX <= binahSpan; hodX += 1) {
				const yesodEntries = this.cells.get(cellKey(
					gevurahOrigin.x + hodX,
					gevurahOrigin.z + netzachZ
				)) || [];
				tiferesMatches.push(...yesodEntries);
			}
		}
		return tiferesMatches;
	}

	/** Converts one world-space placement position into integer grid coordinates. */
	cell(keterPosition) {
		return {
			x: Math.floor(Number(keterPosition[0] || 0) / this.cellSize),
			z: Math.floor(Number(keterPosition[2] || 0) / this.cellSize)
		};
	}
}

/** Implements the original exact horizontal distance versus minimum-scale rule. */
function lawfulPair(keterCandidate, chochmahExisting, binahSpacing) {
	const gevurahX = keterCandidate.position[0] - chochmahExisting.position[0];
	const tiferesZ = keterCandidate.position[2] - chochmahExisting.position[2];
	const netzachMinimum = binahSpacing * Math.min(keterCandidate.scale, chochmahExisting.scale);
	return Math.hypot(gevurahX, tiferesZ) >= netzachMinimum;
}

/** Creates one stable cell-map key. */
function cellKey(keterX, chochmahZ) {
	return `${keterX}:${chochmahZ}`;
}
