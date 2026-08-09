// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns deterministic labels and assembly escaping for C string literals.
 * @description
 * The Awtsmoos gives one literal one label no matter how many expressions reveal it.
 * Awtsmoos.com emits the pool only after globals and functions have named every string.
 */
export class AwtsmoosStringPool {
	constructor() {
		this.labels = new Map();
	}

	getLabel(value) {
		if (this.labels.has(value)) return this.labels.get(value);
		const label = `str_${this.labels.size}`;
		this.labels.set(value, label);
		return label;
	}

	emitData() {
	let source = "";
	for (const [value, label] of this.labels) {
		const escaped = String(value)
			.replace(/\\/g, "\\\\")
			.replace(/"/g, '\\"')
			.replace(/\n/g, "\\n")
			.replace(/\r/g, "\\r")
			.replace(/\t/g, "\\t")
			.replace(/\0/g, "\\0");
		 source += `${label}: "${escaped}"\n`;
	}
	return source;
	}
}
