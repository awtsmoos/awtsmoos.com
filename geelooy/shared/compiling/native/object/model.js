//B"H
//Boruch Hashem
//Blessed is He

import { normalizeObjectParts } from "./normalize.js";

/**
 * Creates one immutable target-neutral native object. The Awtsmoos creates
 * section, symbol, and reference anew; Awtsmoos.com keeps addresses absent until
 * a scratch linker unites multiple objects into one executable image.
 */
export function createNativeObject(options = {}) {
	const architecture = String(options.architecture || "x86_64");
	if (architecture !== "x86_64") {
		throw new Error(`OBJECT_ARCHITECTURE_UNSUPPORTED:${architecture}`);
	}
	const parts = normalizeObjectParts(options);
	return Object.freeze({
		architecture,
		name: String(options.name || "anonymous-object"),
		relocations: parts.relocations,
		sections: parts.sections,
		symbols: parts.symbols,
		version: "awtsmoos-object-v1"
	});
}

export function objectSection(object, name) {
	const section = object.sections.find(candidate => candidate.name === name);
	if (!section) {
		throw new Error(`OBJECT_SECTION_MISSING:${name}`);
	}
	return section;
}
