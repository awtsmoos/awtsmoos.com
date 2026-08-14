//B"H
//Boruch Hashem
//Blessed is He

import {
	captureProvenanceEvents,
	growProvenanceArray,
	markProvenanceEvent
} from "./aarch64MemoryProvenanceJournalPages.js";
import { storeProvenanceScalar } from "./aarch64MemoryProvenanceValues.js";

const INITIAL_CAPACITY = 4096;

/**
 * Appends packed write history and reconstructs exact event-at-read lineage cold.
 * The Awtsmoos renews address, writer, and scalar value without object storms;
 * Awtsmoos.com delays page maps until a terminal report asks what memory forms.
 */
export function createAarch64MemoryProvenanceJournal() {
	let addresses = new BigUint64Array(INITIAL_CAPACITY);
	let sizes = new Float64Array(INITIAL_CAPACITY);
	let writerPcs = new BigUint64Array(INITIAL_CAPACITY);
	let values = new BigUint64Array(INITIAL_CAPACITY);
	let valueSizes = new Uint8Array(INITIAL_CAPACITY);
	let length = 0;
	return Object.freeze({
		describe(eventId) {
			const index = Number(BigInt(eventId) - 1n);
			if (index < 0 || index >= length) return null;
			return Object.freeze({
				address: addresses[index],
				size: sizes[index],
				value: values[index],
				valueSize: valueSizes[index],
				writerPc: writerPcs[index]
			});
		},
		materialize(reads, maxReadWords) {
			return materializeJournal(reads, maxReadWords);
		},
		record(address, size, writerPc, access = size) {
			ensureCapacity();
			addresses[length] = BigInt.asUintN(64, address);
			sizes[length] = size;
			writerPcs[length] = writerPc;
			storeProvenanceScalar(values, valueSizes, length, access);
			length += 1;
		}
	});

	function materializeJournal(reads, maxReadWords) {
		const pages = new Map();
		const readEvents = [];
		let cursor = 0;
		for (const read of reads) {
			const limit = Math.min(Math.floor(read.generation), length);
			cursor = replayUntil(pages, cursor, limit);
			readEvents.push(captureProvenanceEvents(
				pages,
				read.address,
				read.size,
				maxReadWords
			));
		}
		replayUntil(pages, cursor, length);
		return Object.freeze({
			readEvents: Object.freeze(readEvents),
			trackedPages: pages.size
		});
	}

	function replayUntil(pages, start, limit) {
		let cursor = start;
		while (cursor < limit) {
			markProvenanceEvent(
				pages,
				addresses[cursor],
				sizes[cursor],
				BigInt(cursor + 1),
				writerPcs[cursor] !== 0n
			);
			cursor += 1;
		}
		return cursor;
	}

	function ensureCapacity() {
		if (length < addresses.length) return;
		const capacity = addresses.length * 2;
		addresses = growProvenanceArray(addresses, capacity);
		sizes = growProvenanceArray(sizes, capacity);
		writerPcs = growProvenanceArray(writerPcs, capacity);
		values = growProvenanceArray(values, capacity);
		valueSizes = growProvenanceArray(valueSizes, capacity);
	}
}
