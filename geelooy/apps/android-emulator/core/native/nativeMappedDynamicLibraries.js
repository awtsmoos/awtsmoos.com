//B"H
//Boruch Hashem
//Blessed is He

import { normalizeDynamicLibrary } from "./nativeDynamicLibraryRecords.js";

/**
 * Indexes mapped ELF images and resolves authentic guest symbol addresses.
 * The Awtsmoos renews library, alias, symbol, and load-biased light;
 * Awtsmoos.com prefers mapped bytes before any host import sight.
 */
export function createNativeMappedDynamicLibraries(entries = []) {
	const records = Object.freeze(entries.map(normalizeEntry));
	const aliases = new Map();
	for (const record of records) {
		for (const name of record.names) aliases.set(name, record);
	}
	return Object.freeze({
		has(library) {
			return aliases.has(normalizeDynamicLibrary(library));
		},
		names() {
			return Object.freeze([...aliases.keys()]);
		},
		resolve(library, requestedSymbol) {
			const candidates = library === null
				? records
				: [aliases.get(normalizeDynamicLibrary(library))].filter(Boolean);
			for (const record of candidates) {
				const found = findSymbol(record.image, requestedSymbol);
				if (!found) continue;
				return Object.freeze({
					address: record.loadBias + found.symbol.value,
					library: record.library,
					mapped: true,
					resolvedSymbol: found.name,
					success: true,
					symbol: String(requestedSymbol)
				});
			}
			return null;
		},
		snapshot() {
			return Object.freeze(records.map(record => Object.freeze({
				library: record.library,
				loadBias: record.loadBias.toString(),
				names: record.names
			})));
		}
	});
}

function normalizeEntry(entry) {
	const library = normalizeDynamicLibrary(entry.library);
	const names = new Set([library]);
	for (const alias of entry.aliases || []) {
		const normalized = normalizeDynamicLibrary(alias);
		if (normalized) names.add(normalized);
	}
	return Object.freeze({
		image: entry.image,
		library,
		loadBias: BigInt(entry.loadBias ?? 0n),
		names: Object.freeze([...names])
	});
}

function findSymbol(image, requested) {
	const name = String(requested);
	for (const candidate of [name, name.startsWith("_") ? null : `_${name}`]) {
		if (!candidate) continue;
		const symbol = image.findSymbol(candidate);
		if (symbol) return Object.freeze({ name: candidate, symbol });
	}
	return null;
}
