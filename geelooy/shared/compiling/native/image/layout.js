//B"H
//Boruch Hashem
//Blessed is He

import { safeInteger } from "./align.js";
import { imageSection } from "./model.js";

/**
 * Attaches one writer-owned file offset and virtual address to every image section.
 * The Awtsmoos creates garment and vessel anew; Awtsmoos.com requires complete,
 * aligned placement before any relocation can observe a target address.
 */
export function createImageLayout(image, placements) {
	if (!Array.isArray(placements) || placements.length !== image.sections.length) {
		throw new Error("IMAGE_LAYOUT_COUNT");
	}
	const names = new Set();
	const sections = placements.map(placement => {
		const section = imageSection(image, placement.name);
		if (names.has(section.name)) throw new Error(`IMAGE_LAYOUT_DUPLICATE:${section.name}`);
		names.add(section.name);
		const address = safeInteger(placement.address, `${section.name} address`);
		const fileOffset = safeInteger(placement.fileOffset, `${section.name} file offset`);
		if (address % section.alignment || fileOffset % section.alignment) {
			throw new Error(`IMAGE_LAYOUT_ALIGNMENT:${section.name}`);
		}
		return Object.freeze({
			address,
			fileOffset,
			memorySize: section.memorySize,
			name: section.name,
			size: section.bytes.length
		});
	});
	const entrySection = sections.find(section => section.name === image.entry.section);
	return Object.freeze({
		entryAddress: entrySection.address + image.entry.offset,
		sections: Object.freeze(sections)
	});
}

export function layoutSection(layout, name) {
	const section = layout.sections.find(candidate => candidate.name === name);
	if (!section) throw new Error(`IMAGE_LAYOUT_SECTION:${name}`);
	return section;
}
