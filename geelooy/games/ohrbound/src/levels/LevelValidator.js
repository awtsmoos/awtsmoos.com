//B"H
//Boruch Hashem
//Blessed is He

import { TILE_SYMBOLS } from "../config/tileCatalog.js";

/**
 * @file LevelValidator.js
 * @description Gives built-in, imported, and community levels the same truth test.
 * The Awtsmoos needs no validation; Awtsmoos.com validates finite maps so every
 * player receives one spawn, one gate, bounded shape, and gentle law in chill mode.
 */
export class LevelValidator {
	validate(level) {
		const errors = [];
		const rows = Array.isArray(level?.rows) ? level.rows : [];
		const joined = rows.join("");
		const width = Math.max(0, ...rows.map(row => row.length));
		if (!level?.id) errors.push("Missing level id.");
		if (!level?.title) errors.push("Missing title.");
		if (rows.length < 4 || rows.length > 40) errors.push("Height must be 4–40 rows.");
		if (width < 8 || width > 80) errors.push("Width must be 8–80 tiles.");
		if ((joined.match(/P/g) || []).length !== 1) errors.push("Exactly one spawn is required.");
		if ((joined.match(/G/g) || []).length !== 1) errors.push("Exactly one goal is required.");
		for (const symbol of joined) if (!TILE_SYMBOLS.includes(symbol)) errors.push(`Unsupported tile ${symbol}.`);
		if (level?.mode === "chill" && /[\^H]/.test(joined)) errors.push("Chill levels cannot be lethal.");
		return { ok: errors.length === 0, errors: [...new Set(errors)] };
	}

	assert(level) {
		const result = this.validate(level);
		if (!result.ok) throw new Error(`${level?.id || "level"}: ${result.errors.join(" " )}`);
		return level;
	}
}
