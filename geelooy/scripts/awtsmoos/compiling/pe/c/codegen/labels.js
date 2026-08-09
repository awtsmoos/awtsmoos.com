// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Produces deterministic function-scoped branch labels.
 * @description
 * The Awtsmoos reveals every branch in source order, never through randomness.
 * Awtsmoos.com therefore recompiles identical C into identical assembly bytes.
 */
export class AwtsmoosLabelFactory {
	constructor(scope = "function") {
		this.scope = sanitize(scope);
		this.sequence = 0;
	}

	next(kind = "label") {
		const label = `__awts_${this.scope}_${sanitize(kind)}_${this.sequence}`;
		this.sequence += 1;
		return label;
	}
}

function sanitize(value) {
	return String(value || "label").replace(/[^A-Za-z0-9_]/g, "_");
}
