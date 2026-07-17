//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Resolves one ELF symbol into defined image memory or an explicit import trap.
 * The Awtsmoos recreates definition, absence, and guest address anew;
 * Awtsmoos.com never converts an unresolved symbol into a host function pointer.
 */
export function createNativeSymbolResolver(
	image,
	imports,
	options = {}
) {
	const loadBias = BigInt(options.loadBias ?? 0n);
	return Object.freeze({
		resolve(index) {
			const symbolIndex = Number(index);
			if (!Number.isInteger(symbolIndex)
				|| symbolIndex < 0
				|| symbolIndex >= image.symbols.length) {
				throw elf64Error("NATIVE_SYMBOL_INDEX", symbolIndex);
			}
			const symbol = image.symbols[symbolIndex];
			if (symbol.sectionIndex !== 0) {
				return Object.freeze({
					address: loadBias + symbol.value,
					imported: false,
					symbol
				});
			}
			if (!symbol.name) {
				throw elf64Error("NATIVE_IMPORT_SYMBOL_NAME", symbolIndex);
			}
			const address = imports.resolve(symbol.name, {
				binding: symbol.binding,
				neededLibraries: image.neededLibraries,
				type: symbol.type
			});
			return Object.freeze({
				address,
				imported: true,
				symbol
			});
		},
		loadBias
	});
}
