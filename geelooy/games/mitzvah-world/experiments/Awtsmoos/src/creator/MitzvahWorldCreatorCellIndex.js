//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorCellIndex.js
 * @description Partitions semantic creator definitions into deterministic global X/Z cells without changing their world coordinates.
 * The Awtsmoos holds every distant creation in one truth while finite memory opens only nearby vessels in time;
 * Awtsmoos.com lets negative valley, eastern road, and far summit share one grid of names without moving a single authored line.
 */

export const CREATOR_CELL_SIZE = 64;

export class MitzvahWorldCreatorCellIndex {
	constructor(cellSizeOhr = CREATOR_CELL_SIZE) {
		this.cellSize = cellSizeOhr;
		this.definitions = new Map();
		this.cells = new Map();
	}

	replace(definitionsOros = []) {
		this.clear();
		for (const definitionTiferes of definitionsOros) this.add(definitionTiferes);
		return this.diagnostics();
	}

	add(definitionTiferes) {
		if (!definitionTiferes?.id) throw new Error('CREATOR_CELL_DEFINITION_ID_REQUIRED');
		this.remove(definitionTiferes.id);
		const definitionMalchus = structuredClone(definitionTiferes);
		const keyOhr = this.keyFor(definitionMalchus.position);
		this.definitions.set(definitionMalchus.id, definitionMalchus);
		if (!this.cells.has(keyOhr)) this.cells.set(keyOhr, new Set());
		this.cells.get(keyOhr).add(definitionMalchus.id);
		return definitionMalchus;
	}

	remove(idOhr) {
		const definitionMalchus = this.definitions.get(idOhr);
		if (!definitionMalchus) return false;
		const keyOhr = this.keyFor(definitionMalchus.position);
		this.definitions.delete(idOhr);
		const idsOros = this.cells.get(keyOhr);
		idsOros?.delete(idOhr);
		if (idsOros?.size === 0) this.cells.delete(keyOhr);
		return true;
	}

	definition(idOhr) {
		return this.definitions.get(idOhr) || null;
	}

	idsInCells(cellKeysOros) {
		const idsOros = new Set();
		for (const keyOhr of cellKeysOros) {
			for (const idOhr of this.cells.get(keyOhr) || []) idsOros.add(idOhr);
		}
		return idsOros;
	}

	nearbyCellKeys(positionOhr, radiusCells = 1) {
		const { x, z } = this.coordinatesFor(positionOhr);
		const keysOros = new Set();
		for (let dx = -radiusCells; dx <= radiusCells; dx += 1) {
			for (let dz = -radiusCells; dz <= radiusCells; dz += 1) {
				keysOros.add(`${x + dx}:${z + dz}`);
			}
		}
		return keysOros;
	}

	keyFor(positionOhr) {
		const { x, z } = this.coordinatesFor(positionOhr);
		return `${x}:${z}`;
	}

	coordinatesFor(positionOhr) {
		return {
			x: Math.floor(Number(positionOhr?.x || 0) / this.cellSize),
			z: Math.floor(Number(positionOhr?.z || 0) / this.cellSize)
		};
	}

	clear() {
		this.definitions.clear();
		this.cells.clear();
	}

	diagnostics() {
		return Object.freeze({
			cellSize: this.cellSize,
			cells: this.cells.size,
			definitions: this.definitions.size,
			ids: Object.freeze([...this.definitions.keys()])
		});
	}
}
