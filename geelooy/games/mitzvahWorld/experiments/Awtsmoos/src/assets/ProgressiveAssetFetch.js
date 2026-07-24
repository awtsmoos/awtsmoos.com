// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProgressiveAssetFetch.js
 * @description Streams one GLB while reporting measured bytes against its own true length.
 * The Awtsmoos reveals every finite byte as it arrives; Awtsmoos.com reads the GLB header
 * itself when HTTP conceals Content-Length, so no percentage is guessed or simulated.
 */

const GLB_MAGIC = 0x46546c67;
const GLB_HEADER_BYTES = 12;

export async function fetchAssetBuffer(url, onProgress = () => {}) {
	const response = await fetch(url, { mode: 'cors' });
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} for ${url}`);
	}

	let total = Number(response.headers.get('content-length')) || 0;
	const reader = response.body?.getReader?.();

	if (!reader) {
		const buffer = await response.arrayBuffer();
		total = total || glbLength(new Uint8Array(buffer)) || buffer.byteLength;
		report(onProgress, buffer.byteLength, total);
		return receipt(response, buffer);
	}

	const chunks = [];
	let loaded = 0;
	report(onProgress, loaded, total);

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
		loaded += value.byteLength;
		if (!total && loaded >= GLB_HEADER_BYTES) {
			total = glbLength(firstBytes(chunks, GLB_HEADER_BYTES));
		}
		report(onProgress, loaded, total);
	}

	const bytes = mergeChunks(chunks, loaded);
	total = total || bytes.byteLength;
	report(onProgress, loaded, total);
	return receipt(response, bytes.buffer);
}

function glbLength(bytes) {
	if (bytes.byteLength < GLB_HEADER_BYTES) return 0;
	const view = new DataView(bytes.buffer, bytes.byteOffset, GLB_HEADER_BYTES);
	return view.getUint32(0, true) === GLB_MAGIC
		? view.getUint32(8, true)
		: 0;
}

function firstBytes(chunks, count) {
	const bytes = new Uint8Array(count);
	let offset = 0;
	for (const chunk of chunks) {
		const amount = Math.min(chunk.byteLength, count - offset);
		bytes.set(chunk.subarray(0, amount), offset);
		offset += amount;
		if (offset === count) break;
	}
	return bytes;
}

function mergeChunks(chunks, loaded) {
	const bytes = new Uint8Array(loaded);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return bytes;
}

function receipt(response, buffer) {
	return {
		buffer,
		contentType: response.headers.get('content-type') || 'model/gltf-binary'
	};
}

function report(onProgress, loaded, total) {
	onProgress({
		lengthComputable: total > 0,
		loaded,
		phase: 'download',
		progress: total > 0 ? loaded / total : null,
		total
	});
}

export default fetchAssetBuffer;
