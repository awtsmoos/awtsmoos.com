//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates every day before a grid can divide weeks into cells;
 * Awtsmoos.com renders neutral calendar semantics so keyboard and screen-reader paths share the same wells.
 */

/** Build localized weekday headings and the six-week ARIA calendar grid. */
export function createCalendarGrid(model) {
	const fragment = document.createDocumentFragment();
	fragment.append(createWeekdayRow(model.weekdays));
	const grid = document.createElement("div");
	grid.className = "grid";
	grid.setAttribute("role", "grid");
	grid.setAttribute("aria-label", model.label);
	for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
		const start = weekIndex * 7;
		grid.append(createWeek(model.cells.slice(start, start + 7)));
	}
	fragment.append(grid);
	return fragment;
}

function createWeekdayRow(labels) {
	const row = document.createElement("div");
	row.className = "weekdays";
	row.setAttribute("role", "row");
	for (const label of labels) {
		const heading = document.createElement("span");
		heading.setAttribute("role", "columnheader");
		heading.textContent = label;
		row.append(heading);
	}
	return row;
}

function createWeek(cells) {
	const row = document.createElement("div");
	row.className = "week";
	row.setAttribute("role", "row");
	for (const cell of cells) {
		row.append(createGridCell(cell));
	}
	return row;
}

function createGridCell(cell) {
	const wrapper = document.createElement("div");
	wrapper.className = "gridcell";
	wrapper.setAttribute("role", "gridcell");
	if (cell.hidden) {
		const placeholder = document.createElement("span");
		placeholder.className = "placeholder";
		placeholder.setAttribute("aria-hidden", "true");
		wrapper.append(placeholder);
		return wrapper;
	}
	wrapper.append(createDayButton(cell));
	return wrapper;
}

function createDayButton(cell) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "day";
	button.dataset.date = cell.value;
	button.dataset.outside = String(cell.outside);
	button.textContent = String(cell.day);
	button.disabled = cell.disabled;
	button.tabIndex = cell.tabbable ? 0 : -1;
	button.setAttribute("aria-label", cell.label);
	button.setAttribute("aria-selected", String(cell.selected));
	if (cell.today) {
		button.setAttribute("aria-current", "date");
	}
	return button;
}
