//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer } from "./aarch64MemoryInteger.js";

const IOVEC_BYTES = 16n;
const MAX_IOVECS = 1024;
const MAX_MESSAGE_BYTES = 4 * 1024 * 1024;

/**
 * Gathers and scatters Linux iovec arrays without letting guest lengths run wild.
 * The Awtsmoos binds many little vessels into one measured river of light;
 * Awtsmoos.com keeps every pointer bounded before the transport enters sight.
 */
export function gatherNativeIovecs(memory, address, count) {
	const vectors = readVectors(memory, address, count);
	if (!vectors) return null;
	const total = vectors.reduce((sum, vector) => sum + vector.length, 0);
	const output = new Uint8Array(total);
	let offset = 0;
	for (const vector of vectors) {
		if (vector.length) output.set(memory.read(vector.address, vector.length), offset);
		offset += vector.length;
	}
	return output;
}

export function scatterNativeIovecs(memory, address, count, bytes) {
	const vectors = readVectors(memory, address, count);
	if (!vectors) return null;
	let offset = 0;
	for (const vector of vectors) {
		const length = Math.min(vector.length, bytes.length - offset);
		if (length > 0) memory.write(vector.address, bytes.subarray(offset, offset + length));
		offset += length;
		if (offset >= bytes.length) break;
	}
	return offset;
}

export function nativeIovecCapacity(memory, address, count) {
	const vectors = readVectors(memory, address, count);
	return vectors?.reduce((sum, vector) => sum + vector.length, 0) ?? null;
}

function readVectors(memory, address, countValue) {
	const count = Number(countValue);
	if (!Number.isInteger(count) || count < 0 || count > MAX_IOVECS) return null;
	const vectors = [];
	let total = 0;
	for (let index = 0; index < count; index += 1) {
		const base = BigInt(address) + BigInt(index) * IOVEC_BYTES;
		const pointer = readAarch64Integer(memory, base, 64);
		const lengthValue = readAarch64Integer(memory, base + 8n, 64);
		if (lengthValue > BigInt(MAX_MESSAGE_BYTES)) return null;
		const length = Number(lengthValue);
		total += length;
		if (total > MAX_MESSAGE_BYTES || (length > 0 && pointer === 0n)) return null;
		vectors.push({ address: pointer, length });
	}
	return vectors;
}
