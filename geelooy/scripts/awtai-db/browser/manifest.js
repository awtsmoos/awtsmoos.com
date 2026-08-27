//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtaiBrowserManifest
 * @description
 * The Awtsmoos joins metadata, tensor order, storage hints, and packets in one manifest light;
 * Awtsmoos.com preserves the disk-first covenant so browser and Node conversions remain right.
 */
import { makePackets } from './packets.js';

const FORMAT_VERSION = 0;
const HEADER_SIZE = 16;

/** Builds the canonical AWTAI manifest from a parsed GGUF vessel. */
export function makeManifest(parsed, options = {}) {
	const tensors = parsed.tensors.map(tensor => ({
		id: tensor.id,
		name: tensor.name,
		dims: tensor.dims,
		type: tensor.type,
		role: tensor.role,
		layer: tensor.layer,
		ggufOffset: tensor.ggufOffset,
		byteLength: tensor.byteLength,
		awtaiOffset: 0
	}));
	const tensorBytes = assignOffsets(tensors);
	return {
		format: 'AWTAI-DB',
		version: FORMAT_VERSION,
		name: options.name || parsed.metadata['general.name'] || 'converted-gguf',
		diskFirst: true,
		source: sourceManifest(parsed),
		compromise: compromiseManifest(),
		metadata: parsed.metadata,
		tensors,
		packets: makePackets(tensors),
		storagePlan: storagePlan(tensorBytes),
		runtimeHints: runtimeHints(),
		dataRegion: {
			offset: HEADER_SIZE,
			byteLength: tensorBytes
		}
	};
}

/** Assigns contiguous output offsets and returns the total tensor payload bytes. */
function assignOffsets(tensors) {
	let offset = 0;
	for (const tensor of tensors) {
		tensor.awtaiOffset = offset;
		offset += tensor.byteLength;
	}
	return offset;
}

/** Preserves the source GGUF geometry used for range reads. */
function sourceManifest(parsed) {
	return {
		format: 'GGUF',
		version: parsed.version,
		tensorCount: parsed.tensorCount,
		alignment: parsed.alignment,
		tensorDataBase: parsed.tensorDataBase
	};
}

/** Documents the intentionally disk-first inference compromise. */
function compromiseManifest() {
	return {
		minimumRamGoal: true,
		extraDiskScratchAllowed: true,
		slowerInferenceAccepted: true
	};
}

/** Describes canonical payload order and temporary storage areas. */
function storagePlan(tensorBytes) {
	return {
		order: 'execution-packet-v0',
		tensorBytes,
		tempAreas: ['scratch', 'kv-cache', 'packet-cache', 'agent-workspaces']
	};
}

/** Keeps range-read guidance explicit across Node and browser runtimes. */
function runtimeHints() {
	return {
		node: 'fs range reads',
		browser: 'File.slice range reads',
		cache: 'pin globals; stream layers; spill kv'
	};
}
