//B"H
//Boruch Hashem
//Blessed is He

import { defineLevel } from "../levels/levelFactory.js";
import { LevelValidator } from "../levels/LevelValidator.js";

/**
 * @file EditorDocument.js
 * @description Holds a mutable grid draft while exported levels remain immutable.
 * The Awtsmoos contains every possible world before a tile is painted; Awtsmoos.com
 * gives the creator a bounded parchment whose spawn and gate remain singular and clear.
 */
export class EditorDocument {
	constructor(snapshot = EditorDocument.blankSnapshot()) {
		this.validator = new LevelValidator();
		this.restore(snapshot);
	}

	static blankSnapshot(width = 32, height = 12) {
		const rows = Array.from({ length: height }, () => ".".repeat(width));
		rows[height - 1] = "#".repeat(width);
		rows[height - 2] = replaceAt(replaceAt(rows[height - 2], 2, "P"), width - 3, "G");
		return { id: "my-gate", title: "My Gate", mode: "adventure", pack: "Community", rows };
	}

	restore(snapshot) {
		this.id = String(snapshot.id || "my-gate");
		this.title = String(snapshot.title || "My Gate");
		this.mode = snapshot.mode === "chill" ? "chill" : "adventure";
		this.pack = String(snapshot.pack || "Community");
		this.rows = snapshot.rows.map(row => String(row));
		return this;
	}

	paint(x, y, symbol) {
		if (!this.rows[y]?.[x]) return false;
		if (symbol === "P" || symbol === "G") this.removeSymbol(symbol);
		this.rows[y] = replaceAt(this.rows[y], x, symbol);
		return true;
	}

	removeSymbol(symbol) {
		this.rows = this.rows.map(row => row.replaceAll(symbol, "."));
	}

	metadata(values = {}) {
		if (values.title !== undefined) this.title = String(values.title).slice(0, 100);
		if (values.mode !== undefined) this.mode = values.mode === "chill" ? "chill" : "adventure";
		this.id = slug(this.title) || this.id;
	}

	snapshot() {
		return { id: this.id, title: this.title, mode: this.mode, pack: this.pack, rows: [...this.rows] };
	}

	level() {
		return defineLevel({ ...this.snapshot(), difficulty: 2, message: "A community-made gate." });
	}

	validate() {
		return this.validator.validate(this.level());
	}
}

function replaceAt(text, index, character) {
	return text.slice(0, index) + character + text.slice(index + 1);
}

function slug(text) {
	return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 56);
}
