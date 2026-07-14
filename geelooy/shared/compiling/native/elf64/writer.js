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
import { ELF64 } from "./constants.js";
import { writeElf64Header } from "./header.js";

/**
 * Writes one static ELF64 x86_64 executable with separate RX and RW mappings.
 * The Awtsmoos creates Linux garment and target address anew; Awtsmoos.com owns
 * layout, relocation, and headers without a production linker dependency.
 */
export function writeElf64Executable(image, options = {}) {
	const code = imageSection(image, "code");
	const data = imageSection(image, "data");
	if (!code.bytes.length || !code.permissions.execute) {
		throw new Error("ELF64_CODE_REQUIRED");
	}
	const baseAddress = safeInteger(
		options.baseAddress ?? ELF64.BASE_ADDRESS,
		"ELF base address"
	);
	const codeOffset = ELF64.CODE_OFFSET;
	const dataOffset = alignUp(
		codeOffset + Math.max(code.bytes.length, 1),
		ELF64.PAGE_SIZE
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
		throw new Error(`ELF64_FILE_LIMIT:${fileSize}`);
	}
	const bytes = new Uint8Array(fileSize);
	bytes.set(codeBytes, codeOffset);
	if (dataBytes.length) {
		bytes.set(dataBytes, dataOffset);
	}
	const segments = createSegments({
		baseAddress,
		code,
		codeBytes,
		codeOffset,
		data,
		dataBytes,
		dataOffset,
		hasData
	});
	writeElf64Header(bytes, {
		entryAddress: layout.entryAddress,
		segments
	});
	return Object.freeze({
		bytes,
		entryPoint: layout.entryAddress,
		extension: ".elf",
		format: "elf",
		layout,
		mimeType: "application/x-elf",
		segments: Object.freeze(segments),
		writer: "awtsmoos-scratch-elf64-v1"
	});
}

function createSegments(context) {
	const textFileSize = context.codeOffset + context.codeBytes.length;
	const textMemorySize = alignUp(
		context.codeOffset + context.code.memorySize,
		ELF64.PAGE_SIZE
	);
	const segments = [{
		address: context.baseAddress,
		alignment: ELF64.PAGE_SIZE,
		fileOffset: 0,
		fileSize: textFileSize,
		flags: ELF64.PF_R | ELF64.PF_X,
		memorySize: textMemorySize
	}];
	if (context.hasData) {
		segments.push({
			address: context.baseAddress + context.dataOffset,
			alignment: ELF64.PAGE_SIZE,
			fileOffset: context.dataOffset,
			fileSize: context.dataBytes.length,
			flags: ELF64.PF_R | ELF64.PF_W,
			memorySize: context.data.memorySize
		});
	}
	return segments;
}
