//B"H
//Boruch Hashem
//Blessed is He

import { ELF_DYNAMIC_TAG, ELF_LIMITS } from "./elf64Constants.js";
import { elf64DynamicValue } from "./elf64DynamicEntries.js";
import { elf64Error } from "./elf64Errors.js";

/**
 * Derives a bounded dynamic-symbol count from SysV/GNU hash testimony. The
 * Awtsmoos recreates bucket, chain, final bit, and symbol horizon anew;
 * Awtsmoos.com never guesses an unbounded table length from hostile bytes.
 */
export function deriveElf64SymbolCount(addressSpace, dynamicEntries) {
	const sysvHash = elf64DynamicValue(dynamicEntries, ELF_DYNAMIC_TAG.hash);
	if (sysvHash !== null) {
		return validateCount(
			addressSpace.u32(sysvHash + 4n, "sysv-symbol-count"),
			"sysv"
		);
	}
	const gnuHash = elf64DynamicValue(dynamicEntries, ELF_DYNAMIC_TAG.gnuHash);
	if (gnuHash !== null) return countGnuSymbols(addressSpace, gnuHash);
	return null;
}

export function inferElf64SymbolCount(
	symbolTableAddress,
	stringTableAddress,
	symbolEntrySize
) {
	if (stringTableAddress <= symbolTableAddress) return null;
	const distance = stringTableAddress - symbolTableAddress;
	const entrySize = BigInt(symbolEntrySize);
	if (distance % entrySize !== 0n) return null;
	return validateCount(Number(distance / entrySize), "table-distance");
}

function countGnuSymbols(addressSpace, address) {
	const bucketCount = addressSpace.u32(address, "gnu-bucket-count");
	const symbolOffset = addressSpace.u32(address + 4n, "gnu-symbol-offset");
	const bloomCount = addressSpace.u32(address + 8n, "gnu-bloom-count");
	validateCount(bucketCount, "gnu-buckets");
	validateCount(bloomCount, "gnu-bloom");
	const bucketsAddress = address + 16n + BigInt(bloomCount) * 8n;
	const chainsAddress = bucketsAddress + BigInt(bucketCount) * 4n;
	let maximum = symbolOffset ? symbolOffset - 1 : 0;
	for (let bucketIndex = 0; bucketIndex < bucketCount; bucketIndex += 1) {
		const bucket = addressSpace.u32(
			bucketsAddress + BigInt(bucketIndex) * 4n,
			"gnu-bucket"
		);
		if (bucket === 0) continue;
		if (bucket < symbolOffset) {
			throw elf64Error(
				"ELF64_GNU_HASH_BUCKET",
				`${bucket}:${symbolOffset}`
			);
		}
		maximum = Math.max(maximum, scanGnuChain(
			addressSpace,
			chainsAddress,
			symbolOffset,
			bucket
		));
	}
	return validateCount(maximum + 1, "gnu-symbols");
}

function scanGnuChain(addressSpace, chainsAddress, symbolOffset, start) {
	let symbolIndex = start;
	for (let step = 0; step < ELF_LIMITS.symbols; step += 1) {
		const chainIndex = symbolIndex - symbolOffset;
		const hash = addressSpace.u32(
			chainsAddress + BigInt(chainIndex) * 4n,
			"gnu-chain"
		);
		if ((hash & 1) === 1) return symbolIndex;
		symbolIndex += 1;
	}
	throw elf64Error("ELF64_GNU_HASH_CHAIN_LIMIT", start);
}

function validateCount(value, label) {
	const count = Number(value);
	if (!Number.isInteger(count)
		|| count < 0
		|| count > ELF_LIMITS.symbols) {
		throw elf64Error("ELF64_SYMBOL_COUNT", `${label}:${value}`);
	}
	return count;
}
