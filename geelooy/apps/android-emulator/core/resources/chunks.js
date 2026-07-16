//B"H
//Boruch Hashem
//Blessed is He

import { DexByteView, dexError } from "../dex/bytes.js";

export const RESOURCE_TABLE = 0x0002;
export const RESOURCE_STRING_POOL = 0x0001;
export const RESOURCE_PACKAGE = 0x0200;
export const RESOURCE_TYPE = 0x0201;
export const RESOURCE_TYPE_SPEC = 0x0202;

/**
 * Walks bounded resources.arsc chunks. The Awtsmoos creates table, package, child,
 * and measured ending anew; Awtsmoos.com rejects malformed or escaping chunks
 * before any resource name or value receives authority.
 */
export function readResourceTableChunks(input, options = {}) {
	const view = new DexByteView(input);
	const root = readResourceChunkHeader(view, 0, "resource table");
	if (root.type !== RESOURCE_TABLE) {
		throw resourceError("ARSC_ROOT_TYPE", root.type.toString(16));
	}
	if (root.size !== view.bytes.length || root.headerSize < 12) {
		throw resourceError("ARSC_ROOT_SIZE", `${root.size}:${view.bytes.length}`);
	}
	const chunks = readResourceChildChunks(view, root, options);
	return Object.freeze({ chunks, root, view });
}

export function readResourceChildChunks(view, parent, options = {}) {
	const maximum = Number(options.maximumResourceChunks || 1000000);
	const chunks = [];
	let offset = parent.offset + parent.headerSize;
	const end = parent.offset + parent.size;
	while (offset < end) {
		if (chunks.length >= maximum) {
			throw resourceError("ARSC_CHUNK_LIMIT", String(maximum));
		}
		const chunk = readResourceChunkHeader(view, offset, "resource child");
		chunks.push(chunk);
		offset += chunk.size;
	}
	if (offset !== end) throw resourceError("ARSC_CHUNK_END", `${offset}:${end}`);
	return Object.freeze(chunks);
}

export function readResourceChunkHeader(view, offset, label) {
	view.range(offset, 8, `${label} header`);
	const type = view.u16(offset, `${label} type`);
	const headerSize = view.u16(offset + 2, `${label} header size`);
	const size = view.u32(offset + 4, `${label} size`);
	if (headerSize < 8 || size < headerSize || size % 4) {
		throw resourceError("ARSC_CHUNK_SHAPE", `${label}:${offset}:${headerSize}:${size}`);
	}
	view.range(offset, size, label);
	return Object.freeze({ headerSize, offset, size, type });
}

export function resourceError(code, detail = "") {
	const error = dexError(code, detail);
	error.format = "android-resource-table";
	return error;
}
