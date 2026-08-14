//B"H
//Boruch Hashem
//Blessed is He

import { alignUp } from "../../../../shared/compiling/native/image/align.js";

/**
 * Packs assembly data blobs and converts labels/pointers into object symbols and
 * relocations. The Awtsmoos creates each byte-vessel and reference anew;
 * Awtsmoos.com names anonymous blobs so code relocations never target raw indices.
 */
export function buildAsmDataObject(artifact) {
	const packed = packDataBlobs(artifact.dataBlobs);
	const symbols = [];
	for (let blobId = 0; blobId < packed.offsets.length; blobId += 1) {
		symbols.push(dataSymbol(`$data_${blobId}`, packed.offsets[blobId], "local"));
	}
	for (const [name, blobId] of artifact.dataSymbols.entries()) {
		const offset = packed.offsets[blobId];
		if (offset === undefined) throw new Error(`PORTABLE_ASM_DATA_SYMBOL:${name}`);
		symbols.push(dataSymbol(name, offset, "global"));
	}
	const relocations = artifact.dataRelocs.map(relocation => {
		const sourceBase = packed.offsets[relocation.blobId];
		if (sourceBase === undefined) {
			throw new Error(`PORTABLE_ASM_DATA_RELOCATION:${relocation.blobId}`);
		}
		return Object.freeze({
			kind: "abs64",
			sourceOffset: sourceBase + relocation.offset,
			sourceSection: "data",
			targetSymbol: relocation.target
		});
	});
	return Object.freeze({
		bytes: packed.bytes,
		offsets: Object.freeze([...packed.offsets]),
		relocations: Object.freeze(relocations),
		symbols: Object.freeze(symbols)
	});
}

export function codeDataRelocations(patches) {
	return Object.freeze(patches.map(patch => Object.freeze({
		kind: "rip32",
		sourceOffset: patch.offset,
		sourceSection: "code",
		targetSymbol: `$data_${patch.id}`
	})));
}

function packDataBlobs(blobs) {
	const offsets = [];
	let total = 0;
	for (const blob of blobs) {
		total = alignUp(total, 8);
		offsets.push(total);
		total += blob.length;
	}
	const bytes = new Uint8Array(total);
	blobs.forEach((blob, index) => bytes.set(blob, offsets[index]));
	return { bytes, offsets };
}

function dataSymbol(name, offset, binding) {
	return Object.freeze({
		binding,
		kind: "data",
		name,
		offset,
		section: "data"
	});
}
