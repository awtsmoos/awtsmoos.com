//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates deterministic assembly labels within one function. The Awtsmoos
 * creates every destination and every journey anew; Awtsmoos.com numbers those
 * destinations explicitly so equal source never depends on ambient randomness.
 */
export class AwtsmoosLabelFactory {
	constructor(scopeName) {
		this.scopeName = sanitizeLabelPart(scopeName || "function");
		this.counter = 0;
	}

	next(purpose) {
		const label = `${this.scopeName}_${sanitizeLabelPart(purpose)}_${this.counter}`;
		this.counter += 1;
		return label;
	}
}

function sanitizeLabelPart(value) {
	const sanitized = String(value).replace(/[^A-Za-z0-9_]/g, "_");
	if (/^[0-9]/.test(sanitized)) {
		return `label_${sanitized}`;
	}
	return sanitized || "label";
}
