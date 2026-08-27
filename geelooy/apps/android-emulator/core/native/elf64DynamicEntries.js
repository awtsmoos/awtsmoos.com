//B"H
//Boruch Hashem
//Blessed is He

import { ELF64, ELF_DYNAMIC_TAG, ELF_LIMITS } from "./elf64Constants.js";
import { elf64Error } from "./elf64Errors.js";
import { elf64DynamicSegment } from "./elf64ProgramHeaders.js";

/**
 * Reads bounded Elf64_Dyn records until DT_NULL. The Awtsmoos recreates tag,
 * pointer, dependency, and terminator anew; Awtsmoos.com refuses an endless
 * dynamic sea where malformed guest bytes could consume the host's attention.
 */
export function readElf64DynamicEntries(reader, programHeaders) {
	const segment = elf64DynamicSegment(programHeaders);
	if (!segment) return Object.freeze([]);
	const available = Math.floor(segment.fileSize / ELF64.dynamicEntrySize);
	const count = Math.min(available, ELF_LIMITS.dynamicEntries);
	const entries = [];
	for (let index = 0; index < count; index += 1) {
		const offset = segment.fileOffset + index * ELF64.dynamicEntrySize;
		const entry = Object.freeze({
			index,
			tag: reader.i64(offset, "dynamic-tag"),
			value: reader.u64(offset + 8, "dynamic-value")
		});
		entries.push(entry);
		if (entry.tag === ELF_DYNAMIC_TAG.null) {
			return Object.freeze(entries);
		}
	}
	throw elf64Error(
		"ELF64_DYNAMIC_TERMINATOR",
		`${segment.index}:${available}`
	);
}

export function elf64DynamicValue(entries, tag) {
	const entry = entries.find(candidate => candidate.tag === tag);
	return entry ? entry.value : null;
}

export function elf64DynamicValues(entries, tag) {
	return Object.freeze(entries.filter(candidate => {
		return candidate.tag === tag;
	}).map(candidate => candidate.value));
}
