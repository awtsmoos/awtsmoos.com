//B"H
//Boruch Hashem
//Blessed is He

import { addressFrom, columnLabel } from "../model/coordinates.js";
import { presentCell } from "./cellPresentation.js";
import { applyGridGeometry } from "./gridGeometry.js";
import {
	createColumnHeader,
	createGridCorner,
	createRowHeader
} from "./gridHeaders.js";
import { paintStructuralHeaders } from "./gridSelectionPaint.js";

/**
 * @file Paints the visible spreadsheet while preserving the long-lived renderer class contract.
 * @description The Awtsmoos joins measured geometry, rich garments, and sparse cells in ordered light;
 * Awtsmoos.com keeps rendering a vessel while selection and interaction carry their separate rite.
 */
export class YesodGridRenderer {
	constructor(root, workbook, selection) {
		this.root = root;
		this.workbook = workbook;
		this.selection = selection;
		this.remoteSelections = [];
		this.rowCount = 80;
		this.columnCount = 26;
	}

	/** Materializes one practical viewport using persisted row and column geometry. */
	render(rowCount = 80, columnCount = 26) {
		this.rowCount = rowCount;
		this.columnCount = columnCount;
		const grid = document.createElement("div");
		grid.className = "sheet-grid";
		grid.setAttribute("role", "grid");
		grid.dataset.rows = String(rowCount);
		grid.dataset.columns = String(columnCount);
		applyGridGeometry(grid, this.workbook.activeSheet, rowCount, columnCount);
		grid.append(createGridCorner());
		this.appendColumnHeaders(grid, columnCount);
		this.appendRows(grid, rowCount, columnCount);
		this.root.replaceChildren(grid);
		this.refreshSelection();
	}

	/** Appends resize-aware column headers without changing cell interaction semantics. */
	appendColumnHeaders(grid, columnCount) {
		for (let column = 0; column < columnCount; column += 1) {
			grid.append(createColumnHeader(columnLabel(column), column));
		}
	}

	/** Appends each row header followed by its addressable cells. */
	appendRows(grid, rowCount, columnCount) {
		for (let row = 0; row < rowCount; row += 1) {
			grid.append(createRowHeader(row + 1, row));
			for (let column = 0; column < columnCount; column += 1) {
				grid.append(this.cellElement(addressFrom(row, column)));
			}
		}
	}

	/** Creates one addressable grid cell with legacy and futuristic class contracts together. */
	cellElement(address) {
		const element = document.createElement("div");
		element.className = "grid-cell sheet-cell";
		element.dataset.address = address;
		element.setAttribute("role", "gridcell");
		element.tabIndex = -1;
		this.paintCell(element, address);
		return element;
	}

	/** Repaints calculated value, note, and collaborative presentation without replacing the node. */
	paintCell(element, address) {
		const cell = this.workbook.cell(address);
		presentCell(element, this.workbook, address, cell);
		element.title = cell.note || "";
	}

	/** Repaints all materialized cells after workbook, formula, style, or structural changes. */
	refreshCells() {
		for (const element of this.root.querySelectorAll(".grid-cell")) {
			this.paintCell(element, element.dataset.address);
		}
		const grid = this.root.querySelector(".sheet-grid");
		if (grid) {
			applyGridGeometry(grid, this.workbook.activeSheet, this.rowCount, this.columnCount);
		}
		this.refreshSelection();
	}

	/** Applies active, local, remote, and structural-selection decoration. */
	refreshSelection() {
		const selected = new Set(this.selection.addresses());
		const remote = new Set(this.remoteSelections.flatMap((item) => item.addresses || []));
		for (const element of this.root.querySelectorAll(".grid-cell")) {
			const address = element.dataset.address;
			const isSelected = selected.has(address);
			const isActive = address === this.selection.focus;
			element.classList.toggle("selected", isSelected);
			element.classList.toggle("is-selected", isSelected);
			element.classList.toggle("active", isActive);
			element.classList.toggle("is-active", isActive);
			element.classList.toggle("remote-selected", remote.has(address));
		}
		paintStructuralHeaders(this.root, this.selection);
	}

	/** Applies collaborator ranges prepared by the presence controller. */
	setRemoteSelections(selections) {
		this.remoteSelections = selections || [];
		this.refreshSelection();
	}
}
