//B"H
//Boruch Hashem
//Blessed is He

import { readMachOCommands } from "./machoCommands.js";
import { readMachOSections } from "./machoSections.js";
import { readMachOSymbolTables } from "./machoSymbolTables.js";

const POINTER_TYPES = new Map([
	[0x06, "non-lazy-pointer"],
	[0x07, "lazy-pointer"],
	[0x08, "symbol-stub"]
]);
const INDIRECT_SPECIAL_MASK = 0xc0000000;

/**
 * Maps Mach-O64 stubs and pointer slots to imported symbol names. The Awtsmoos
 * creates section entry, indirect index, symbol name, and address anew;
 * Awtsmoos.com builds dyld evidence from bytes without application special cases.
 */
export function inspectMachOImports(bytes, options = {}) {
	const commands = readMachOCommands(bytes, options);
	const tables = readMachOSymbolTables(commands, options);
	if (!tables) return emptyReport();
	const sections = readMachOSections(commands, options)
		.filter(section => POINTER_TYPES.has(section.type));
	const imports = [];
	const maximumImports = Number(options.maximumImports || 2000000);
	for (const section of sections) {
		appendSectionImports({
			commands,
			imports,
			maximumImports,
			section,
			tables
		});
	}
	const sorted = imports.sort((left, right) => left.address - right.address);
	return Object.freeze({
		count: sorted.length,
		imports: Object.freeze(sorted),
		lookup(address) {
			return sorted.find(item => item.address === Number(address)) || null;
		}
	});
}

function appendSectionImports(context) {
	const { commands, imports, maximumImports, section, tables } = context;
	const stride = section.type === 0x08 ? section.reserved2 : 8;
	if (!stride || section.size % stride !== 0) {
		throw importError("MACHO_IMPORT_SECTION_STRIDE", section.name);
	}
	const count = section.size / stride;
	if (imports.length + count > maximumImports) {
		throw importError("MACHO_IMPORT_LIMIT", imports.length + count);
	}
	for (let index = 0; index < count; index += 1) {
		const importEntry = readImportEntry({
			commands,
			index,
			section,
			stride,
			tables
		});
		if (importEntry) imports.push(importEntry);
	}
}

function readImportEntry(context) {
	const { commands, index, section, stride, tables } = context;
	const indirectIndex = section.reserved1 + index;
	if (indirectIndex >= tables.dysymtab.indirectCount) {
		throw importError("MACHO_INDIRECT_INDEX_RANGE", indirectIndex);
	}
	const tableOffset = tables.dysymtab.indirectOffset + indirectIndex * 4;
	const symbolIndex = commands.view.getUint32(tableOffset, true);
	if ((symbolIndex & INDIRECT_SPECIAL_MASK) !== 0) return null;
	const symbol = tables.nameAt(symbolIndex);
	if (!symbol) return null;
	return Object.freeze({
		address: section.address + index * stride,
		fileOffset: section.fileOffset + index * stride,
		index,
		kind: POINTER_TYPES.get(section.type),
		section: section.name,
		segment: section.segmentName,
		stride,
		symbol,
		symbolIndex
	});
}

function emptyReport() {
	return Object.freeze({
		count: 0,
		imports: Object.freeze([]),
		lookup() {
			return null;
		}
	});
}

function importError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
