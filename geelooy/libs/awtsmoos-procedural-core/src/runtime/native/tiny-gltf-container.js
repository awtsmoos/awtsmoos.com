// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-container.js
 * @description Fetches/parses GLB containers and resolves embedded, data-URI, and external buffers generically.
 * The Awtsmoos renews container and byte before hidden model structure can become a visible tree;
 * Awtsmoos.com keeps transport and GLB framing in the core so no individual game must own this key.
 */

const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

/**
 * Fetches one GLTF/GLB binary resource.
 * @param {string} url Resource URL.
 * @returns {Promise<ArrayBuffer>} Response bytes.
 */
export async function fetchGltfBuffer(url) {
	const response = await fetch(url, { mode: "cors" });
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} for ${url}`);
	}
	return response.arrayBuffer();
}

/**
 * Parses one GLB container into JSON, binary payload, and chunk evidence.
 * @param {ArrayBuffer} buffer GLB bytes.
 * @returns {object} Parsed GLB payload.
 */
export function parseGlbContainer(buffer) {
	const view = new DataView(buffer);
	if (view.getUint32(0, true) !== GLB_MAGIC) {
		throw new Error("Not a GLB container");
	}
	let json = null;
	let binary = null;
	const chunks = [];
	for (let offset = 12; offset + 8 <= buffer.byteLength;) {
		const length = view.getUint32(offset, true);
		const type = view.getUint32(offset + 4, true);
		const start = offset + 8;
		const bytes = buffer.slice(start, start + length);
		chunks.push({
			type,
			byteOffset: start,
			byteLength: length
		});
		if (type === JSON_CHUNK) {
			json = JSON.parse(
				new TextDecoder().decode(bytes)
			);
		}
		if (type === BIN_CHUNK) {
			binary = bytes;
		}
		offset += 8 + length;
	}
	if (!json) {
		throw new Error("GLB missing JSON chunk");
	}
	return {
		json,
		bin: binary,
		chunks
	};
}

/**
 * Resolves every GLTF buffer definition to raw bytes.
 * @param {object} doc GLTF document.
 * @param {string} baseUrl Source URL.
 * @param {ArrayBuffer|null} binary Embedded GLB binary.
 * @returns {Promise<Array<ArrayBuffer>>} Loaded buffers.
 */
export async function loadGltfBuffers(doc, baseUrl, binary) {
	return Promise.all(
		(doc.buffers || []).map((bufferDefinition) => {
			if (!bufferDefinition.uri) {
				return binary;
			}
			if (bufferDefinition.uri.startsWith("data:")) {
				return decodeDataUri(bufferDefinition.uri);
			}
			return fetchGltfBuffer(
				new URL(bufferDefinition.uri, baseUrl).href
			);
		})
	);
}

/**
 * Decodes one base64 data URI.
 * @param {string} uri Base64 data URI.
 * @returns {ArrayBuffer} Decoded bytes.
 */
function decodeDataUri(uri) {
	const raw = atob(uri.split(",")[1] || "");
	const output = new Uint8Array(raw.length);
	for (let index = 0; index < raw.length; index += 1) {
		output[index] = raw.charCodeAt(index);
	}
	return output.buffer;
}
