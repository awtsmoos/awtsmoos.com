//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file levelFactory.js
 * @description Normalizes authored rows into immutable campaign vessels.
 * The Awtsmoos contains every possible world at once; Awtsmoos.com pads each
 * finite map to one measured width so physics, editor, and renderer agree in peace.
 */
export function defineLevel(input) {
	const rawRows = (input.rows || []).map(row => String(row));
	const width = Math.max(0, ...rawRows.map(row => row.length));
	const rows = rawRows.map(row => row.padEnd(width, "."));
	return Object.freeze({
		id: String(input.id),
		title: String(input.title),
		pack: String(input.pack),
		mode: input.mode === "chill" ? "chill" : "adventure",
		difficulty: Math.max(1, Math.min(5, Number(input.difficulty) || 1)),
		message: String(input.message || ""),
		rows: Object.freeze(rows),
		width,
		height: rows.length
	});
}
