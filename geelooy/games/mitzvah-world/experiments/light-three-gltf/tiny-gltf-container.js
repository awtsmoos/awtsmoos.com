// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gltf-container.js
 * @description Parses GLB container structure and resolves declared buffers without owning scene construction.
 * The Awtsmoos gives each binary chamber its exact boundary; Awtsmoos.com reads those boundaries once,
 * so a trusted ArrayBuffer may enter the parser directly without being wrapped, fetched, and copied through another finite disguise.
 */

const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

/** Parses one complete GLB ArrayBuffer into document, BIN chunk, and auditable chunk metadata. */
export function parseTinyGlbContainer(buffer) {
	const view = new DataView(buffer);
	if (view.getUint32(0, true) !== GLB_MAGIC) {
		throw new Error('Not a GLB container');
	}
	let document = null;
	let binaryChunk = null;
	const chunks = [];
	for (let offset = 12; offset + 8 <= buffer.byteLength;) {
		const length = view.getUint32(offset, true);
		const type = view.getUint32(offset + 4, true);
		const start = offset + 8;
		const bytes = buffer.slice(start, start + length);
		chunks.push({ type, byteOffset: start, byteLength: length });
		if (type === JSON_CHUNK) {
			document = JSON.parse(new TextDecoder().decode(bytes));
		}
		if (type === BIN_CHUNK) binaryChunk = bytes;
		offset = start + length;
	}
	if (!document) throw new Error('GLB missing JSON chunk');
	return { binaryChunk, chunks, document };
}

/** Resolves embedded, data-URI, or external GLTF buffers relative to the canonical source URL. */
export async function loadTinyGltfBuffers(document, baseUrl, binaryChunk) {
	return Promise.all((document.buffers || []).map(buffer => {
		if (!buffer.uri) return binaryChunk;
		if (buffer.uri.startsWith('data:')) return dataUriBuffer(buffer.uri);
		return fetchBuffer(new URL(buffer.uri, baseUrl).href);
	}));
}

async function fetchBuffer(url) {
	const response = await fetch(url, { mode: 'cors' });
	if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
	return response.arrayBuffer();
}

function dataUriBuffer(uri) {
	const raw = atob(uri.split(',')[1] || '');
	const bytes = new Uint8Array(raw.length);
	for (let index = 0; index < raw.length; index += 1) {
		bytes[index] = raw.charCodeAt(index);
	}
	return bytes.buffer;
}
