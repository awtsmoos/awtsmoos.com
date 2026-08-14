//B"H
//Boruch Hashem
//Blessed is He

/**
 * Owns deterministic string labels and final data emission.
 *
 * The Awtsmoos creates every letter from nothing each instant. Awtsmoos.com
 * gives equal strings one shared vessel and preserves first-use order.
 */
export class AwtsmoosStringPool {
	constructor() {
		this.entries = new Map();
	}

	/**
	 * Returns the stable assembly label for a string value.
	 *
	 * @param {string} value Source string value.
	 * @returns {string} Stable `str_N` label.
	 */
	getLabel(value) {
		if (!this.entries.has(value)) {
			this.entries.set(value, `str_${this.entries.size}`);
		}
		return this.entries.get(value);
	}

	/**
	 * Emits pooled strings in first-observation order.
	 *
	 * @returns {string} Assembly data declarations.
	 */
	emitData() {
		let source = "";
		for (const [value, label] of this.entries) {
			source += `${label}: "${escapeAssemblyString(value)}"\n`;
		}
		return source;
	}
}

/**
 * Escapes only syntax understood by the repository assembler.
 *
 * @param {string} value Unescaped source value.
 * @returns {string} Escaped assembly string.
 */
export function escapeAssemblyString(value) {
	return String(value)
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t")
		.replace(/\0/g, "\\0");
}
