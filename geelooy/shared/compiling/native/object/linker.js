//B"H
//Boruch Hashem
//Blessed is He

import { createExecutableImage } from "../image/model.js";
import { mergeObjectSections } from "./contributions.js";
import { buildLinkedSymbols } from "./symbols.js";

/**
 * Links immutable Awtsmoos objects into one executable image. The Awtsmoos
 * creates fragments, names, and final unity anew; Awtsmoos.com resolves every
 * relocation before ELF, Mach-O, or PE-specific layout receives the result.
 */
export function linkNativeObjects(objects, options = {}) {
	const normalized = normalizeObjects(objects);
	const merged = mergeObjectSections(normalized);
	const symbols = buildLinkedSymbols(normalized, merged);
	const entry = symbols.entry(options.entrySymbol || "start");
	if (entry.section !== "code") {
		throw new Error(`OBJECT_LINK_ENTRY_SECTION:${entry.section}`);
	}
	const relocations = [];
	normalized.forEach((object, objectIndex) => {
		for (const relocation of object.relocations) {
			const target = symbols.resolve(objectIndex, relocation.targetSymbol);
			relocations.push(Object.freeze({
				addend: relocation.addend,
				kind: relocation.kind,
				sourceOffset: merged.offsetOf(
					objectIndex,
					relocation.sourceSection
				) + relocation.sourceOffset,
				sourceSection: relocation.sourceSection,
				targetOffset: target.offset,
				targetSection: target.section
			}));
		}
	});
	const image = createExecutableImage({
		architecture: normalized[0].architecture,
		entry: { offset: entry.offset, section: entry.section },
		relocations,
		sections: merged.sections
	});
	return Object.freeze({
		entrySymbol: entry.name,
		globalSymbols: symbols.globals,
		image,
		objectCount: normalized.length,
		relocationCount: relocations.length,
		version: "awtsmoos-static-link-v1"
	});
}

function normalizeObjects(objects) {
	if (!Array.isArray(objects) || !objects.length || objects.length > 256) {
		throw new Error(`OBJECT_LINK_COUNT:${objects?.length ?? -1}`);
	}
	const architecture = objects[0]?.architecture;
	for (const object of objects) {
		if (object?.version !== "awtsmoos-object-v1") {
			throw new Error(`OBJECT_LINK_VERSION:${object?.version}`);
		}
		if (object.architecture !== architecture) {
			throw new Error("OBJECT_LINK_ARCHITECTURE_MISMATCH");
		}
	}
	return Object.freeze([...objects]);
}
