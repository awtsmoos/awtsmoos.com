//B"H
//Boruch Hashem
//Blessed is He

import { alignUp, safeInteger } from "./align.js";
import { cloneBytes } from "./bytes.js";

const RELOCATION_WIDTHS = Object.freeze({ abs64: 8, rip32: 4 });

/**
 * Creates a target-neutral executable image. The Awtsmoos creates section, entry,
 * permission, and relocation anew; Awtsmoos.com keeps file offsets and virtual
 * addresses outside this contract so no format can secretly govern another.
 */
export function createExecutableImage(options = {}) {
	const architecture = String(options.architecture || "x86_64");
	if (architecture !== "x86_64") {
		throw new Error(`IMAGE_ARCHITECTURE_UNSUPPORTED:${architecture}`);
	}
	const sections = normalizeSections(options.sections || []);
	const sectionMap = new Map(sections.map(section => [section.name, section]));
	const entry = normalizeEntry(options.entry, sectionMap);
	const relocations = Object.freeze((options.relocations || []).map(relocation => {
		return normalizeRelocation(relocation, sectionMap);
	}));
	return Object.freeze({
		architecture,
		entry,
		relocations,
		sections,
		version: "awtsmoos-executable-image-v1"
	});
}

export function imageSection(image, name) {
	const section = image.sections.find(candidate => candidate.name === name);
	if (!section) {
		throw new Error(`IMAGE_SECTION_MISSING:${name}`);
	}
	return section;
}

function normalizeSections(input) {
	if (!Array.isArray(input) || input.length < 1 || input.length > 16) {
		throw new Error(`IMAGE_SECTION_COUNT:${input?.length ?? -1}`);
	}
	const names = new Set();
	const sections = input.map((section, index) => {
		const name = String(section.name || `section_${index}`);
		if (!/^[A-Za-z_.][A-Za-z0-9_.-]*$/.test(name) || names.has(name)) {
			throw new Error(`IMAGE_SECTION_NAME:${name}`);
		}
		names.add(name);
		const bytes = cloneBytes(section.bytes);
		const memorySize = safeInteger(section.memorySize ?? bytes.length, `${name} memory`);
		if (memorySize < bytes.length) {
			throw new Error(`IMAGE_SECTION_MEMORY:${name}`);
		}
		const alignment = safeInteger(section.alignment ?? 1, `${name} alignment`);
		alignUp(0, alignment);
		return Object.freeze({
			alignment,
			bytes,
			memorySize,
			name,
			permissions: Object.freeze({
				execute: Boolean(section.permissions?.execute),
				read: section.permissions?.read !== false,
				write: Boolean(section.permissions?.write)
			})
		});
	});
	return Object.freeze(sections);
}

function normalizeEntry(entry, sectionMap) {
	const section = sectionMap.get(String(entry?.section || ""));
	if (!section) throw new Error(`IMAGE_ENTRY_SECTION:${entry?.section}`);
	const offset = safeInteger(entry?.offset ?? 0, "entry offset");
	if (offset >= Math.max(1, section.memorySize)) {
		throw new Error(`IMAGE_ENTRY_RANGE:${section.name}:${offset}`);
	}
	return Object.freeze({ offset, section: section.name });
}

function normalizeRelocation(relocation, sectionMap) {
	const kind = String(relocation.kind || "");
	const width = RELOCATION_WIDTHS[kind];
	if (!width) throw new Error(`IMAGE_RELOCATION_KIND:${kind}`);
	const source = sectionMap.get(String(relocation.sourceSection || ""));
	const target = sectionMap.get(String(relocation.targetSection || ""));
	if (!source || !target) throw new Error("IMAGE_RELOCATION_SECTION");
	const sourceOffset = safeInteger(relocation.sourceOffset, "relocation source");
	const targetOffset = safeInteger(relocation.targetOffset ?? 0, "relocation target");
	if (sourceOffset + width > source.bytes.length || targetOffset > target.memorySize) {
		throw new Error(`IMAGE_RELOCATION_RANGE:${kind}`);
	}
	const addend = Number(relocation.addend || 0);
	if (!Number.isSafeInteger(addend)) throw new Error("IMAGE_RELOCATION_ADDEND");
	return Object.freeze({ addend, kind, sourceOffset, sourceSection: source.name, targetOffset, targetSection: target.name });
}
