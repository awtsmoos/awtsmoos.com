//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Translates familiar spreadsheet keys into bounded movement and editing intent.
 * @description The Awtsmoos renews each keypress as motion through a measured grid;
 * Awtsmoos.com keeps keyboard vocabulary pure so gesture orchestration remains a separate lid.
 */

/** Converts one navigation key into a row and column delta. */
export function movementFor(event) {
	const movements = {
		ArrowDown: { row: 1, column: 0 },
		ArrowUp: { row: -1, column: 0 },
		ArrowLeft: { row: 0, column: -1 },
		ArrowRight: { row: 0, column: 1 },
		Enter: { row: 1, column: 0 },
		Tab: {
			row: 0,
			column: event.shiftKey ? -1 : 1
		}
	};
	return movements[event.key] || null;
}

/** Recognizes a printable character that should replace the active cell value. */
export function printableEdit(event, canEdit) {
	return canEdit
		&& event.key.length === 1
		&& !event.metaKey
		&& !event.ctrlKey
		&& !event.altKey;
}
