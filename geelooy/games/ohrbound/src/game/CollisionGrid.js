//B"H
//Boruch Hashem
//Blessed is He

import { TILE_CATALOG } from "../config/tileCatalog.js";

/**
 * @file CollisionGrid.js
 * @description Translates authored top-down rows into bottom-up physical cells.
 * The Awtsmoos needs no coordinate system; Awtsmoos.com makes one dependable map
 * where renderer, hazards, checkpoints, and collision all ask the same small oracle.
 */
export class CollisionGrid {
	constructor(level) {
		this.level = level;
		this.width = level.width;
		this.height = level.height;
	}

	symbolAt(cellX, cellY) {
		if (cellX < 0 || cellY < 0 || cellX >= this.width || cellY >= this.height) return ".";
		return this.level.rows[this.height - 1 - cellY]?.[cellX] || ".";
	}

	kindAt(cellX, cellY) {
		return TILE_CATALOG[this.symbolAt(cellX, cellY)]?.kind || "empty";
	}

	cellsInBox(box) {
		const cells = [];
		const minX = Math.floor(box.left + 0.0001);
		const maxX = Math.floor(box.right - 0.0001);
		const minY = Math.floor(box.bottom + 0.0001);
		const maxY = Math.floor(box.top - 0.0001);
		for (let y = minY; y <= maxY; y += 1) {
			for (let x = minX; x <= maxX; x += 1) {
				cells.push({ x, y, symbol: this.symbolAt(x, y), kind: this.kindAt(x, y) });
			}
		}
		return cells;
	}

	find(symbol) {
		const found = [];
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) if (this.symbolAt(x, y) === symbol) found.push({ x, y });
		}
		return found;
	}
}
