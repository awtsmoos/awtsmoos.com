//B"H
//Boruch Hashem
//Blessed is He

import { alignUp, safeInteger } from "../image/align.js";
import { cloneBytes } from "../image/bytes.js";

const RELOCATION_WIDTHS = Object.freeze({ abs64: 8, rip32: 4 });

/**
 * Normalizes native-object sections, symbols, and symbol relocations. The
 * Awtsmoos creates each bounded definition anew; Awtsmoos.com isolates validation
 * from the public constructor so both covenant and implementation remain small.
 */
export function normalizeObjectParts(options = {}) {
	const sections = normalizeSections(options.sections || []);
	const sectionMap = new Map(sections.map(section => [section.name, section]));
	const symbols = normalizeSymbols(options.symbols || [], sectionMap);
	const symbolNames = new Set(symbols.map(symbol => symbol.name));
	const relocations = Object.freeze((options.relocations || []).map(relocation => {
		return normalizeRelocation(relocation, sectionMap, symbolNames);
	}));
	return Object.freeze({ relocations, sections, symbols });
}

function normalizeSections(input) {
	if (!Array.isArray(input) || input.length < 1 || input.length > 16) {
		throw new Error(`OBJECT_SECTION_COUNT:${input?.length ?? -1}`);
	}
	const names = new Set();
	return Object.freeze(input.map((section, index) => {
		const name = String(section.name || `section_${index}`);
		if (!/^[A-Za-z_.][A-Za-z0-9_.-]*$/.test(name) || names.has(name)) {
			throw new Error(`OBJECT_SECTION_NAME:${name}`);
		}
		names.add(name);
		const bytes = cloneBytes(section.bytes);
		const memorySize = safeInteger(
			section.memorySize ?? bytes.length,
			`${name} memory`
		);
		if (memorySize < bytes.length) {
			throw new Error(`OBJECT_SECTION_MEMORY:${name}`);
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
	}));
}

function normalizeSymbols(input, sectionMap) {
	const names = new Set();
	return Object.freeze(input.map(symbol => {
		const name = String(symbol.name || "");
		if (!/^[A-Za-z_.$][A-Za-z0-9_.$-]*$/.test(name) || names.has(name)) {
			throw new Error(`OBJECT_SYMBOL_NAME:${name}`);
		}
		names.add(name);
		const section = sectionMap.get(String(symbol.section || ""));
		if (!section) throw new Error(`OBJECT_SYMBOL_SECTION:${name}`);
		const offset = safeInteger(symbol.offset ?? 0, `${name} offset`);
		if (offset > section.memorySize) {
			throw new Error(`OBJECT_SYMBOL_RANGE:${name}`);
		}
		return Object.freeze({
			binding: symbol.binding === "local" ? "local" : "global",
			kind: String(symbol.kind || "value"),
			name,
			offset,
			section: section.name
		});
	}));
}

function normalizeRelocation(relocation, sectionMap, symbolNames) {
	const kind = String(relocation.kind || "");
	const width = RELOCATION_WIDTHS[kind];
	if (!width) throw new Error(`OBJECT_RELOCATION_KIND:${kind}`);
	const source = sectionMap.get(String(relocation.sourceSection || ""));
	if (!source) throw new Error("OBJECT_RELOCATION_SECTION");
	const sourceOffset = safeInteger(relocation.sourceOffset, "relocation source");
	if (sourceOffset + width > source.bytes.length) {
		throw new Error(`OBJECT_RELOCATION_RANGE:${kind}`);
	}
	const targetSymbol = String(relocation.targetSymbol || "");
	if (!targetSymbol) throw new Error("OBJECT_RELOCATION_TARGET");
	const addend = Number(relocation.addend || 0);
	if (!Number.isSafeInteger(addend)) throw new Error("OBJECT_RELOCATION_ADDEND");
	return Object.freeze({
		addend,
		external: !symbolNames.has(targetSymbol),
		kind,
		sourceOffset,
		sourceSection: source.name,
		targetSymbol
	});
}
