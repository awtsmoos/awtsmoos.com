//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file levelPolicy.js
 * @description Bounds community levels before they enter the shared world.
 * The Awtsmoos contains every possible path without boundary; Awtsmoos.com
 * gives published paths kind limits so one level cannot swallow the whole sea.
 */
const ALLOWED_TILES = new Set(".#PG*^=CBH".split(""));
const MAX_WIDTH = 80;
const MAX_HEIGHT = 40;

function cleanText(value, max = 80) {
	return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function validatePublishedLevel(input = {}) {
	const rows = Array.isArray(input.rows) ? input.rows.map(row => String(row)) : [];
	const errors = [];
	const width = Math.max(0, ...rows.map(row => row.length));
	if (!cleanText(input.id, 64)) errors.push("Level id is required.");
	if (!cleanText(input.title, 100)) errors.push("Title is required.");
	if (rows.length < 4 || rows.length > MAX_HEIGHT) errors.push("Height must be between 4 and 40 rows.");
	if (width < 8 || width > MAX_WIDTH) errors.push("Width must be between 8 and 80 tiles.");
	if (!rows.some(row => row.includes("P"))) errors.push("A player spawn is required.");
	if (!rows.some(row => row.includes("G"))) errors.push("A goal is required.");
	for (const character of rows.join("")) {
		if (!ALLOWED_TILES.has(character)) errors.push(`Unsupported tile: ${character}`);
	}
	if (input.mode === "chill" && rows.some(row => /[\^H]/.test(row))) errors.push("Chill levels cannot contain lethal tiles.");
	return {
		ok: errors.length === 0,
		errors: [...new Set(errors)],
		level: { id: cleanText(input.id, 64), title: cleanText(input.title, 100), pack: cleanText(input.pack, 40), mode: input.mode === "chill" ? "chill" : "adventure", rows }
	};
}

module.exports = { ALLOWED_TILES, MAX_WIDTH, MAX_HEIGHT, validatePublishedLevel };
