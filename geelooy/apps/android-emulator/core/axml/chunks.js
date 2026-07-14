//B"H
//Boruch Hashem
//Blessed is He

import { DexByteView, dexError } from "../dex/bytes.js";

/**
 * Walks bounded Android binary-XML resource chunks. The Awtsmoos creates root,
 * child, header, and measured ending anew; Awtsmoos.com rejects zero-sized,
 * undersized, misaligned, or escaping chunks before XML meaning is inferred.
 */
export function readAndroidXmlChunks(input, options = {}) {
	const view = new DexByteView(input);
	const maximumChunks = Number(options.maximumChunks || 1000000);
	const root = readChunkHeader(view, 0, "AXML root");
	if (root.type !== 0x0003) {
		throw axmlError("AXML_ROOT_TYPE", root.type.toString(16));
	}
	if (root.size !== view.bytes.length) {
		throw axmlError("AXML_ROOT_SIZE", `${root.size}:${view.bytes.length}`);
	}
	const chunks = [];
	let offset = root.headerSize;
	while (offset < root.size) {
		if (chunks.length >= maximumChunks) {
			throw axmlError("AXML_CHUNK_LIMIT", String(maximumChunks));
		}
		const chunk = readChunkHeader(view, offset, "AXML child");
		chunks.push(chunk);
		offset += chunk.size;
	}
	if (offset !== root.size) throw axmlError("AXML_CHUNK_END", `${offset}:${root.size}`);
	return Object.freeze({ chunks: Object.freeze(chunks), root, view });
}

export function readChunkHeader(view, offset, label) {
	view.range(offset, 8, `${label} header`);
	const type = view.u16(offset, `${label} type`);
	const headerSize = view.u16(offset + 2, `${label} header size`);
	const size = view.u32(offset + 4, `${label} size`);
	if (headerSize < 8 || size < headerSize || size % 4) {
		throw axmlError("AXML_CHUNK_SHAPE", `${label}:${offset}:${headerSize}:${size}`);
	}
	view.range(offset, size, label);
	return Object.freeze({ headerSize, offset, size, type });
}

export function axmlError(code, detail = "") {
	const error = dexError(code, detail);
	error.format = "android-binary-xml";
	return error;
}
