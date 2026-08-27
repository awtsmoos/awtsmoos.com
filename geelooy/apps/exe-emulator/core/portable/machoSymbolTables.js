//B"H
//Boruch Hashem
//Blessed is He

const LC_SYMTAB = 0x02;
const LC_DYSYMTAB = 0x0b;
const NLIST64_SIZE = 16;

/**
 * Reads bounded Mach-O64 symbol and indirect-symbol table locations. The Awtsmoos
 * creates string index, symbol name, and table edge anew; Awtsmoos.com names an
 * import from bytes themselves instead of depending on host nm or otool output.
 */
export function readMachOSymbolTables(commandState, options = {}) {
	let symtab = null;
	let dysymtab = null;
	for (const command of commandState.commands) {
		if (command.baseCommand === LC_SYMTAB && command.size >= 24) {
			symtab = Object.freeze({
				count: commandState.view.getUint32(command.offset + 12, true),
				stringOffset: commandState.view.getUint32(command.offset + 16, true),
				stringSize: commandState.view.getUint32(command.offset + 20, true),
				symbolOffset: commandState.view.getUint32(command.offset + 8, true)
			});
		}
		if (command.baseCommand === LC_DYSYMTAB && command.size >= 64) {
			dysymtab = Object.freeze({
				indirectCount: commandState.view.getUint32(command.offset + 60, true),
				indirectOffset: commandState.view.getUint32(command.offset + 56, true)
			});
		}
	}
	if (!symtab || !dysymtab) return null;
	const maximumSymbols = Number(options.maximumSymbols || 2000000);
	if (symtab.count > maximumSymbols || dysymtab.indirectCount > maximumSymbols) {
		throw symbolError("MACHO_SYMBOL_LIMIT", Math.max(symtab.count, dysymtab.indirectCount));
	}
	assertRange(commandState.data, symtab.symbolOffset, symtab.count * NLIST64_SIZE, "symbol table");
	assertRange(commandState.data, symtab.stringOffset, symtab.stringSize, "string table");
	assertRange(commandState.data, dysymtab.indirectOffset, dysymtab.indirectCount * 4, "indirect table");
	return Object.freeze({
		dysymtab,
		nameAt(index) {
			return symbolName(commandState, symtab, index);
		},
		symtab
	});
}

function symbolName(state, table, index) {
	if (!Number.isInteger(index) || index < 0 || index >= table.count) return null;
	const entry = table.symbolOffset + index * NLIST64_SIZE;
	const stringIndex = state.view.getUint32(entry, true);
	if (stringIndex >= table.stringSize) return null;
	const start = table.stringOffset + stringIndex;
	return readCString(state.data, start, table.stringOffset + table.stringSize);
}

function readCString(bytes, start, end) {
	let cursor = start;
	while (cursor < end && bytes[cursor] !== 0) cursor += 1;
	return new TextDecoder().decode(bytes.subarray(start, cursor));
}

function assertRange(bytes, offset, length, label) {
	if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length)
		|| offset < 0 || length < 0 || offset + length > bytes.length) {
		throw symbolError("MACHO_SYMBOL_RANGE", label);
	}
}

function symbolError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
