//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GridCellFactory
 * @description
 * The Awtsmoos reveals row and column identity inside each editable vessel, while Awtsmoos.com
 * gives assistive technology the same coordinates that sight receives from the visible grid.
 */

/**
 * @description Converts a zero-based column number into spreadsheet letters such as A, Z, or AA.
 * @param {number} index Zero-based column index whose visible label must be revealed.
 * @returns {string} Spreadsheet-style column label.
 */
export function revealColumnLabel(index) {
	let label = '';
	let currentIndex = index;
	while (currentIndex >= 0) {
		label = String.fromCharCode(65 + (currentIndex % 26)) + label;
		currentIndex = Math.floor(currentIndex / 26) - 1;
	}
	return label;
}

/**
 * @class MalchusGridCellFactory
 * @description Builds semantic table vessels while delegating all data mutation to the owning GridUI.
 */
export class MalchusGridCellFactory {
	/**
	 * @description Binds the factory to the single mutation callback owned by the grid controller.
	 * @param {(rowIndex:number,columnIndex:number,value:string)=>void} onCellInput Mutation callback invoked on live cell input.
	 * @returns {MalchusGridCellFactory} Factory bound to the grid's mutation gate.
	 */
	constructor(onCellInput) {
		this.onCellInput = onCellInput;
	}

	/**
	 * @description Creates one complete accessible table from the current rectangular grid data.
	 * @param {string[][]} data Current CSV rows and cells.
	 * @returns {HTMLTableElement} Semantic table ready to replace the grid container contents.
	 */
	createTable(data) {
		const table = document.createElement('table');
		table.setAttribute('aria-label', 'Editable CSV data grid');
		table.append(this.createHeader(data), this.createBody(data));
		return table;
	}

	/**
	 * @description Reveals column headings with proper scope so navigation technology understands the grid axis.
	 * @param {string[][]} data Current CSV rows used to determine column count.
	 * @returns {HTMLTableSectionElement} Constructed table head.
	 */
	createHeader(data) {
		const head = document.createElement('thead');
		const row = document.createElement('tr');
		const corner = document.createElement('th');
		corner.className = 'corner';
		corner.scope = 'col';
		corner.setAttribute('aria-label', 'Row number');
		row.appendChild(corner);
		const columnCount = data[0]?.length ?? 0;
		for (let index = 0; index < columnCount; index += 1) {
			const heading = document.createElement('th');
			heading.scope = 'col';
			heading.textContent = revealColumnLabel(index);
			row.appendChild(heading);
		}
		head.appendChild(row);
		return head;
	}

	/**
	 * @description Builds row headers and editable cells whose names expose both spreadsheet coordinates.
	 * @param {string[][]} data Current CSV rows and cells.
	 * @returns {HTMLTableSectionElement} Constructed table body with live input handlers.
	 */
	createBody(data) {
		const body = document.createElement('tbody');
		const fragment = document.createDocumentFragment();
		data.forEach((rowData, rowIndex) => fragment.appendChild(this.createRow(rowData, rowIndex)));
		body.appendChild(fragment);
		return body;
	}

	/**
	 * @description Creates one semantic row and forwards edits through the grid's mutation callback.
	 * @param {string[]} rowData Cell values for one row.
	 * @param {number} rowIndex Zero-based row index.
	 * @returns {HTMLTableRowElement} Accessible row containing its row heading and inputs.
	 */
	createRow(rowData, rowIndex) {
		const row = document.createElement('tr');
		const heading = document.createElement('th');
		heading.className = 'row-header';
		heading.scope = 'row';
		heading.textContent = String(rowIndex + 1);
		row.appendChild(heading);
		rowData.forEach((value, columnIndex) => {
			const cell = document.createElement('td');
			cell.className = 'cell';
			const input = document.createElement('input');
			input.type = 'text';
			input.value = value;
			input.dataset.r = String(rowIndex);
			input.dataset.c = String(columnIndex);
			input.setAttribute('aria-label', `Row ${rowIndex + 1}, Column ${revealColumnLabel(columnIndex)}`);
			input.addEventListener('input', event => this.onCellInput(rowIndex, columnIndex, event.target.value));
			cell.appendChild(input);
			row.appendChild(cell);
		});
		return row;
	}
}
