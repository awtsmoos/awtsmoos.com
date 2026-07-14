//B"H
//Boruch Hashem
//Blessed is He

import { alignUp, safeInteger } from "../image/align.js";
import { createImageLayout } from "../image/layout.js";
import { imageSection } from "../image/model.js";
import {
	materializeImageSections,
	materializedSection
} from "../image/relocations.js";
import {
	writeMachO64Header,
	writeMainCommand,
	writeSegment64
} from "./commands.js";
import { MACHO64 } from "./constants.js";
import { createMachO64Segments } from "./segments.js";

/**
 * Writes one thin Mach-O64 x86_64 executable with __TEXT, __DATA, and LC_MAIN.
 * The Awtsmoos creates macOS garment and entrance anew; Awtsmoos.com keeps dyld,
 * signing, frameworks, and host linker work outside this scratch writer.
 */
export function writeMachO64Executable(image, options = {}) {
	const code = imageSection(image, "code");
	const data = imageSection(image, "data");
	if (!code.bytes.length || !code.permissions.execute) {
		throw new Error("MACHO64_CODE_REQUIRED");
	}
	const baseAddress = safeInteger(
		options.baseAddress ?? MACHO64.BASE_ADDRESS,
		"Mach-O base address"
	);
	const codeOffset = MACHO64.CODE_OFFSET;
	const dataOffset = alignUp(
		codeOffset + Math.max(code.bytes.length, 1),
		MACHO64.PAGE_SIZE
	);
	const hasData = data.memorySize > 0;
	const layout = createImageLayout(image, [
		{
			address: baseAddress + codeOffset,
			fileOffset: codeOffset,
			name: "code"
		},
		{
			address: baseAddress + dataOffset,
			fileOffset: dataOffset,
			name: "data"
		}
	]);
	const materialized = materializeImageSections(image, layout);
	const codeBytes = materializedSection(materialized, "code").bytes;
	const dataBytes = materializedSection(materialized, "data").bytes;
	const fileSize = hasData
		? dataOffset + dataBytes.length
		: codeOffset + codeBytes.length;
	if (fileSize > Number(options.maximumBytes || 32 * 1024 * 1024)) {
		throw new Error(`MACHO64_FILE_LIMIT:${fileSize}`);
	}
	const bytes = new Uint8Array(fileSize);
	bytes.set(codeBytes, codeOffset);
	if (dataBytes.length) {
		bytes.set(dataBytes, dataOffset);
	}
	const segments = createMachO64Segments({
		baseAddress,
		code,
		codeBytes,
		codeOffset,
		data,
		dataBytes,
		dataOffset,
		hasData
	});
	writeCommands(bytes, segments, codeOffset + image.entry.offset);
	return Object.freeze({
		bytes,
		entryPoint: layout.entryAddress,
		extension: ".macho",
		format: "mach-o",
		layout,
		mimeType: "application/x-mach-binary",
		segments,
		writer: "awtsmoos-scratch-macho64-v1"
	});
}

function writeCommands(bytes, segments, entryOffset) {
	const commandCount = segments.length + 1;
	const commandBytes = segments.length * MACHO64.SEGMENT_COMMAND_SIZE
		+ MACHO64.MAIN_COMMAND_SIZE;
	if (MACHO64.HEADER_SIZE + commandBytes > MACHO64.CODE_OFFSET) {
		throw new Error("MACHO64_COMMAND_RANGE");
	}
	writeMachO64Header(bytes, { commandBytes, commandCount });
	let offset = MACHO64.HEADER_SIZE;
	for (const segment of segments) {
		writeSegment64(bytes, offset, segment);
		offset += MACHO64.SEGMENT_COMMAND_SIZE;
	}
	writeMainCommand(bytes, offset, entryOffset);
}
