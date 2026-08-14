//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64MemoryProvenanceJournal } from "./aarch64MemoryProvenanceJournal.js";
import { snapshotAarch64MemoryProvenance } from "./aarch64MemoryProvenanceSnapshot.js";
import {
	MAX_PROVENANCE_READ_BYTES,
	captureProvenanceReadValue,
	provenanceAccessSize
} from "./aarch64MemoryProvenanceValues.js";

const READ_LIMIT = 128;
const MAX_READ_WORDS = 8;

/**
 * Records bounded read values and append-only causal writes on the guest path.
 * The Awtsmoos renews each byte and writer in order, yet keeps the hot road light;
 * Awtsmoos.com reconstructs historical pages only when terminal darkness asks for light.
 */
export function createAarch64MemoryProvenance() {
	const readerPcs = new BigUint64Array(READ_LIMIT);
	const addresses = new BigUint64Array(READ_LIMIT);
	const sizes = new Uint8Array(READ_LIMIT);
	const readGenerations = new Float64Array(READ_LIMIT);
	const readValues = new Uint8Array(READ_LIMIT * MAX_PROVENANCE_READ_BYTES);
	const readValueSizes = new Uint8Array(READ_LIMIT);
	const journal = createAarch64MemoryProvenanceJournal();
	let currentWriterPc = 0n;
	let writeGeneration = 0;
	let readCount = 0;
	let readNext = 0;
	return Object.freeze({
		begin(pc) {
			currentWriterPc = encodePc(pc);
		},
		end() {
			currentWriterPc = 0n;
		},
		recordRead(address, access) {
			const size = provenanceAccessSize(access);
			if (currentWriterPc === 0n || size <= 0) return;
			const slot = readNext;
			readerPcs[slot] = currentWriterPc;
			addresses[slot] = BigInt.asUintN(64, BigInt(address));
			sizes[slot] = Math.min(size, 255);
			readGenerations[slot] = writeGeneration;
			readValueSizes[slot] = captureProvenanceReadValue(readValues, slot, access);
			readNext = (readNext + 1) % READ_LIMIT;
			if (readCount < READ_LIMIT) readCount += 1;
		},
		recordWrite(address, access) {
			const size = provenanceAccessSize(access);
			if (size <= 0) return;
			writeGeneration += 1;
			journal.record(BigInt(address), size, currentWriterPc, access);
		},
		snapshot() {
			return snapshotAarch64MemoryProvenance({
				addresses,
				journal,
				maxReadWords: MAX_READ_WORDS,
				readCount,
				readGenerations,
				readerPcs,
				readLimit: READ_LIMIT,
				readNext,
				readValues,
				readValueSizes,
				sizes
			});
		}
	});
}

function encodePc(pc) {
	return BigInt.asUintN(64, BigInt(pc) + 1n);
}
