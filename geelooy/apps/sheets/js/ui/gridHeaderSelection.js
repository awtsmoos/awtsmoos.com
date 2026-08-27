//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Turns visible row and column headers into structural spreadsheet selection controls.
 * @description The Awtsmoos lets one header gather an entire measured line of light;
 * Awtsmoos.com keeps resize edges separate so selection and dimension remain harmonious and right.
 */
export class HodHeaderSelection {
	constructor(root, selection) {
		this.root = root;
		this.selection = selection;
	}

	/** Binds delegated header selection for pointer and context-menu intent. */
	bind() {
		this.root.addEventListener("pointerdown", (event) => this.select(event));
		this.root.addEventListener("contextmenu", (event) => this.select(event));
	}

	/** Selects one complete visible row or column unless the resize edge owns the gesture. */
	select(event) {
		if (event.target.closest?.("[data-resize-axis]")) {
			return;
		}
		const rowHeader = event.target.closest?.(".row-header");
		if (rowHeader) {
			this.selectRow(rowHeader);
			return;
		}
		const columnHeader = event.target.closest?.(".column-header");
		if (columnHeader) {
			this.selectColumn(columnHeader);
		}
	}

	/** Selects the complete visible row represented by one sticky row header. */
	selectRow(header) {
		const grid = header.closest(".sheet-grid");
		const row = Number(header.dataset.rowIndex);
		if (!Number.isSafeInteger(row)) {
			return;
		}
		this.selection.selectRow(
			row,
			Number(grid?.dataset.columns) || 26
		);
	}

	/** Selects the complete visible column represented by one sticky column header. */
	selectColumn(header) {
		const grid = header.closest(".sheet-grid");
		const column = Number(header.dataset.columnIndex);
		if (!Number.isSafeInteger(column)) {
			return;
		}
		this.selection.selectColumn(
			column,
			Number(grid?.dataset.rows) || 80
		);
	}
}
