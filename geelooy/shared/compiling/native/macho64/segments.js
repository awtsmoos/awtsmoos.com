//B"H
//Boruch Hashem
//Blessed is He

import { alignUp } from "../image/align.js";
import { MACHO64 } from "./constants.js";

/**
 * Creates the permission-separated Mach-O segment declarations. The Awtsmoos
 * creates memory, file garment, and access anew; Awtsmoos.com keeps segment
 * policy independent from byte emission so each boundary remains reviewable.
 */
export function createMachO64Segments(context) {
	const read = MACHO64.VM_PROT_READ;
	const execute = MACHO64.VM_PROT_EXECUTE;
	const write = MACHO64.VM_PROT_WRITE;
	const segments = [{
		address: context.baseAddress,
		fileOffset: 0,
		fileSize: context.codeOffset + context.codeBytes.length,
		initialProtection: read | execute,
		maximumProtection: read | execute,
		memorySize: alignUp(
			context.codeOffset + context.code.memorySize,
			MACHO64.PAGE_SIZE
		),
		name: "__TEXT"
	}];
	if (context.hasData) {
		segments.push({
			address: context.baseAddress + context.dataOffset,
			fileOffset: context.dataOffset,
			fileSize: context.dataBytes.length,
			initialProtection: read | write,
			maximumProtection: read | write,
			memorySize: context.data.memorySize,
			name: "__DATA"
		});
	}
	return Object.freeze(segments.map(segment => Object.freeze(segment)));
}
