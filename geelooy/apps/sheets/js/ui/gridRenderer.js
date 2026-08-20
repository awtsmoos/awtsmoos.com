//B"H
//Boruch Hashem
//Blessed is He

import { addressFrom, columnLabel } from "../model/coordinates.js";
import { displayedValue } from "../model/formula.js";

/**
 * @file Paints the visible spreadsheet without owning user input.
 * @description The Awtsmoos clothes sparse letters in measured squares of sight;
 * Awtsmoos.com keeps rendering a vessel, while interaction carries separate light.
 */
export class YesodGridRenderer {
	constructor(root, workbook, selection) {
		this.root = root;
		this.workbook = workbook;
		this.selection = selection;
		this.remoteSelections = [];
	}

	/** Materializes one practical first viewport over sparse workbook state. */
	render(rowCount = 80, columnCount = 26) {
		const grid = document.createElement("div");
		grid.className = "sheet-grid";
		grid.setAttribute("role", "grid");
		grid.append(this.header("", "grid-corner"));
		for (let column = 0; column < columnCount; column += 1) {
			grid.append(this.header(columnLabel(column), "column-header"));
		}
		for (let row = 0; row < rowCount; row += 1) {
			grid.append(this.header(String(row + 1), "row-header"));
			for (let column = 0; column < columnCount; column += 1) {
				grid.append(this.cellElement(addressFrom(row, column)));
			}
		}
		this.root.replaceChildren(grid);
		this.refreshSelection();
	}

	/** Creates one sticky row or column heading. */
	header(text, className) {
		const element = document.createElement("div");
		element.className = className;
		element.textContent = text;
		return element;
	}

	/** Creates one addressable grid cell from sparse workbook state. */
	cellElement(address) {
		const element = document.createElement("div");
		element.className = "grid-cell";
		element.dataset.address = address;
		element.tabIndex = -1;
		this.paintCell(element, address);
		return element;
	}

	/** Repaints value and metadata without replacing the cell node or focus. */
	paintCell(element, address) {
		const cell = this.workbook.cell(address);
		element.textContent = displayedValue(
			this.workbook,
			address,
			this.workbook.activeSheetId
		);
		element.classList.toggle("has-note", Boolean(cell.note));
		element.style.setProperty(
			"--cell-highlight",
			cell.style?.highlight || "var(--surface)"
		);
		element.style.fontWeight = cell.style?.bold ? "700" : "400";
		element.title = cell.note || "";
	}

	/** Repaints all materialized cells after sheet or formula changes. */
	refreshCells() {
		for (const element of this.root.querySelectorAll(".grid-cell")) {
			this.paintCell(element, element.dataset.address);
		}
		this.refreshSelection();
	}

	/** Applies active, local-range, and remote-range decoration. */
	refreshSelection() {
		const selected = new Set(this.selection.addresses());
		const remote = new Set(
			this.remoteSelections.flatMap((item) => item.addresses || [])
		);
		for (const element of this.root.querySelectorAll(".grid-cell")) {
			const address = element.dataset.address;
			element.classList.toggle("selected", selected.has(address));
			element.classList.toggle("active", address === this.selection.focus);
			element.classList.toggle("remote-selected", remote.has(address));
		}
	}

	/** Applies collaborator ranges prepared by the presence controller. */
	setRemoteSelections(selections) {
		this.remoteSelections = selections || [];
		this.refreshSelection();
	}
}
