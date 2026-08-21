//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Builds accessible row and column header vessels with precise resize handles.
 * @description The Awtsmoos gives every visible boundary a measured place where the hand may guide the light;
 * Awtsmoos.com lets selection and resizing share one header without confusing either rite.
 */

/** Creates the sticky top-left corner cell of the worksheet grid. */
export function createGridCorner() {
	const corner = document.createElement("div");
	corner.className = "grid-corner";
	corner.setAttribute("aria-hidden", "true");
	return corner;
}

/** Creates one accessible column header with an edge resize handle. */
export function createColumnHeader(label, columnIndex) {
	const header = createHeader(
		label,
		"column-header",
		"columnheader"
	);
	header.dataset.columnIndex = String(columnIndex);
	header.setAttribute("aria-label", `Column ${label}`);
	header.append(
		createResizeHandle(
			"column",
			columnIndex,
			`Resize column ${label}`
		)
	);
	return header;
}

/** Creates one accessible row header with a bottom-edge resize handle. */
export function createRowHeader(rowNumber, rowIndex) {
	const header = createHeader(
		String(rowNumber),
		"row-header",
		"rowheader"
	);
	header.dataset.rowIndex = String(rowIndex);
	header.setAttribute("aria-label", `Row ${rowNumber}`);
	header.append(
		createResizeHandle(
			"row",
			rowIndex,
			`Resize row ${rowNumber}`
		)
	);
	return header;
}

/** Creates one keyboard-focusable header with a dedicated label span. */
function createHeader(label, className, role) {
	const header = document.createElement("div");
	header.className = className;
	header.setAttribute("role", role);
	header.tabIndex = -1;
	const labelElement = document.createElement("span");
	labelElement.className = "header-label";
	labelElement.textContent = label;
	header.append(labelElement);
	return header;
}

/** Creates one edge hit target used only for pointer resize gestures. */
function createResizeHandle(axis, index, label) {
	const handle = document.createElement("span");
	handle.className = `${axis}-resize-handle`;
	handle.dataset.resizeAxis = axis;
	handle.dataset.resizeIndex = String(index);
	handle.setAttribute("role", "separator");
	handle.setAttribute("aria-label", label);
	handle.setAttribute(
		"aria-orientation",
		axis === "column" ? "vertical" : "horizontal"
	);
	handle.tabIndex = -1;
	return handle;
}
