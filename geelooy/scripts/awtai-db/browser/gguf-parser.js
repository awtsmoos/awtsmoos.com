//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtaiBrowserGgufParser
 * @description
 * The Awtsmoos renews every GGUF byte before metadata and tensor can claim a place;
 * Awtsmoos.com reveals manifest-ready structure with measured offsets, aligned in grace.
 */
import { readGgufString, readGgufValue } from './gguf-values.js';
import { tensorByteLength, tensorLayer, tensorRole } from './ggml.js';

const DEFAULT_ALIGNMENT = 32;
const decoder = new TextDecoder();

/** Parses a complete GGUF byte vessel into metadata and tensor descriptors. */
export function parseGguf(bytes) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const cursor = { offset: 0 };
	assertMagic(bytes, cursor);
	const version = readUint32(view, cursor);
	const tensorCount = readUint64Number(view, cursor);
	const metadataCount = readUint64Number(view, cursor);
	const metadataResult = readMetadata(view, bytes, cursor, metadataCount);
	const tensors = readTensors(view, bytes, cursor, tensorCount);
	const tensorDataBase = align(cursor.offset, metadataResult.alignment);
	return {
		version,
		tensorCount,
		metadataCount,
		alignment: metadataResult.alignment,
		tensorDataBase,
		metadata: metadataResult.metadata,
		tensors,
		bytes
	};
}

/** Validates and consumes the four-byte GGUF magic. */
function assertMagic(bytes, cursor) {
	const magic = decoder.decode(bytes.subarray(0, 4));
	if (magic !== 'GGUF') {
		throw new Error(`B'H expected GGUF magic, got ${magic}`);
	}
	cursor.offset = 4;
}

/** Reads all GGUF metadata and honors an explicit alignment override. */
function readMetadata(view, bytes, cursor, count) {
	const metadata = {};
	let alignment = DEFAULT_ALIGNMENT;
	for (let index = 0; index < count; index += 1) {
		const key = readGgufString(view, bytes, cursor);
		const type = readUint32(view, cursor);
		const value = readGgufValue(view, bytes, cursor, type);
		metadata[key] = value;
		if (key === 'general.alignment') {
			alignment = Number(value) || DEFAULT_ALIGNMENT;
		}
	}
	return { metadata, alignment };
}

/** Reads every tensor descriptor before the aligned data region begins. */
function readTensors(view, bytes, cursor, count) {
	const tensors = [];
	for (let id = 0; id < count; id += 1) {
		tensors.push(readTensor(view, bytes, cursor, id));
	}
	return tensors;
}

/** Reads one tensor descriptor and derives its execution metadata. */
function readTensor(view, bytes, cursor, id) {
	const name = readGgufString(view, bytes, cursor);
	const dimensionCount = readUint32(view, cursor);
	const dims = [];
	for (let dimension = 0; dimension < dimensionCount; dimension += 1) {
		dims.push(readUint64Number(view, cursor));
	}
	const type = readUint32(view, cursor);
	const ggufOffset = readUint64Number(view, cursor);
	const tensor = {
		id,
		name,
		dims,
		type,
		ggufOffset,
		layer: tensorLayer(name),
		role: tensorRole(name)
	};
	tensor.byteLength = tensorByteLength(tensor);
	return tensor;
}

/** Reads one little-endian unsigned 32-bit integer. */
function readUint32(view, cursor) {
	const value = view.getUint32(cursor.offset, true);
	cursor.offset += 4;
	return value;
}

/** Reads one little-endian unsigned 64-bit integer as a Number. */
function readUint64Number(view, cursor) {
	const value = Number(view.getBigUint64(cursor.offset, true));
	cursor.offset += 8;
	return value;
}

/** Aligns a byte offset upward to the GGUF tensor-data boundary. */
function align(value, alignment) {
	return Math.ceil(value / alignment) * alignment;
}
