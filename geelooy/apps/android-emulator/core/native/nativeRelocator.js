//B"H
//Boruch Hashem
//Blessed is He

import {
	AARCH64_RELOCATION,
	AARCH64_RELOCATION_NAME
} from "./elf64RelocationConstants.js";
import {
	readElf64Relocations,
	relocationHistogram
} from "./elf64Relocations.js";
import { createNativeImportAddressSpace } from "./nativeImportAddressSpace.js";
import { createNativeSymbolResolver } from "./nativeSymbolResolver.js";

/**
 * Applies supported AArch64 relocations inside sparse guest memory. The
 * Awtsmoos recreates load bias, symbol value, addend, and repaired pointer anew;
 * Awtsmoos.com records every unsupported kind instead of silently linking it.
 */
export function relocateNativeImage(image, memory, options = {}) {
	const loadBias = BigInt(options.loadBias ?? 0n);
	const imports = options.imports || createNativeImportAddressSpace();
	const resolver = createNativeSymbolResolver(image, imports, { loadBias });
	const relocations = readElf64Relocations(image);
	const unsupported = [];
	let applied = 0;
	let skipped = 0;
	for (const relocation of relocations) {
		const result = relocationValue(relocation, resolver, loadBias);
		if (!result.supported) {
			unsupported.push(unsupportedRelocation(relocation));
			continue;
		}
		if (!result.write) {
			skipped += 1;
			continue;
		}
		memory.loaderWriteU64(
			loadBias + relocation.offset,
			BigInt.asUintN(64, result.value)
		);
		applied += 1;
	}
	return Object.freeze({
		applied,
		importedSymbols: imports.snapshot(),
		loadBias: loadBias.toString(),
		relocationCount: relocations.length,
		skipped,
		typeHistogram: relocationHistogram(relocations),
		unsupported: Object.freeze(unsupported)
	});
}

export function relocationValue(relocation, resolver, loadBias = 0n) {
	if (relocation.type === AARCH64_RELOCATION.none) {
		return Object.freeze({
			supported: true,
			value: 0n,
			write: false
		});
	}
	if (relocation.type === AARCH64_RELOCATION.relative) {
		return writableValue(BigInt(loadBias) + relocation.addend);
	}
	if ([
		AARCH64_RELOCATION.abs64,
		AARCH64_RELOCATION.globDat,
		AARCH64_RELOCATION.jumpSlot
	].includes(relocation.type)) {
		const resolved = resolver.resolve(relocation.symbolIndex);
		const addend = relocation.type === AARCH64_RELOCATION.jumpSlot
			? 0n
			: relocation.addend;
		return Object.freeze({
			imported: resolved.imported,
			supported: true,
			value: resolved.address + addend,
			write: true
		});
	}
	return Object.freeze({
		supported: false,
		value: 0n,
		write: false
	});
}

function writableValue(value) {
	return Object.freeze({
		supported: true,
		value,
		write: true
	});
}

function unsupportedRelocation(relocation) {
	return Object.freeze({
		name: AARCH64_RELOCATION_NAME[relocation.type] || "unknown",
		offset: relocation.offset.toString(),
		type: relocation.type
	});
}
