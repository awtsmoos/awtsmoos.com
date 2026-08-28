//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GridUI
 * @description
 * The Awtsmoos holds mutable CSV data in one focused vessel while Awtsmoos.com delegates
 * semantic DOM revelation to a smaller factory, keeping rendering and mutation responsibilities clear.
 */

import { MalchusGridCellFactory, revealColumnLabel } from './GridCellFactory.js';

/**
 * @class GridUI
 * @description Coordinates CSV state mutation and whole-table rendering without owning cell-construction details.
 */
export class GridUI {
	/**
	 * @description Creates a grid coordinator and reveals the initial semantic table immediately.
	 * @param {HTMLElement} container Grid mount whose children are replaced on render.
	 * @param {string[][]} initialData Initial rectangular CSV data.
	 * @param {(data:string[][])=>void} onDataChange Callback notified after mutations.
	 * @returns {GridUI} Initialized grid controller that immediately renders its current data.
	 */
	constructor(container, initialData, onDataChange) {
		this.container = container;
		this.data = initialData;
		this.onDataChange = onDataChange;
		this.cellFactory = new MalchusGridCellFactory((rowIndex, columnIndex, value) => {
			this.updateCell(rowIndex, columnIndex, value);
		});
		this.render();
	}

	/**
	 * @description Replaces the current dataset and reveals the new table immediately.
	 * @param {string[][]} newData Replacement CSV data.
	 * @returns {void} Re-renders synchronously and does not emit a change callback by itself.
	 */
	setData(newData) {
		this.data = newData;
		this.render();
	}

	/**
	 * @description Mutates one cell and reports the same live dataset to the persistence owner.
	 * @param {number} rowIndex Zero-based row index.
	 * @param {number} columnIndex Zero-based column index.
	 * @param {string} value New cell value.
	 * @returns {void} Notifies the configured mutation callback after updating state.
	 */
	updateCell(rowIndex, columnIndex, value) {
		this.data[rowIndex][columnIndex] = value;
		this.onDataChange(this.data);
	}

	/**
	 * @description Adds one row matching the current column width, then rerenders and reports mutation.
	 * @returns {void} Appends a row and notifies the configured mutation callback.
	 */
	addRow() {
		const columnCount = this.data[0]?.length ?? 0;
		this.data.push(new Array(columnCount).fill(''));
		this.render();
		this.onDataChange(this.data);
	}

	/**
	 * @description Adds one empty column to every row, then rerenders and reports mutation.
	 * @returns {void} Appends a cell to every row and notifies the configured mutation callback.
	 */
	addCol() {
		this.data.forEach(row => row.push(''));
		this.render();
		this.onDataChange(this.data);
	}

	/**
	 * @description Replaces the grid mount with one fresh semantic table built from current state.
	 * @returns {void} Replaces all existing grid DOM children in one synchronous operation.
	 */
	render() {
		this.container.replaceChildren(this.cellFactory.createTable(this.data));
	}

	/**
	 * @description Preserves the historical public column-label helper while delegating the algorithm.
	 * @param {number} index Zero-based column index.
	 * @returns {string} Spreadsheet-style column label.
	 */
	getColumnLabel(index) {
		return revealColumnLabel(index);
	}
}
