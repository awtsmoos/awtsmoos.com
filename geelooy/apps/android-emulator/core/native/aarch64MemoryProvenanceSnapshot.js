//B"H
//Boruch Hashem
//Blessed is He

import { WORD_BYTES, alignWord } from "./aarch64MemoryProvenanceAddress.js";
import {
	formatProvenanceReadValue,
	formatProvenanceScalar
} from "./aarch64MemoryProvenanceValues.js";

/**
 * Materializes writer-at-read identity together with bounded value testimony.
 * The Awtsmoos reveals old cause without changing the guest deed that was done;
 * Awtsmoos.com keeps every added field JSON-safe beneath the terminal sun.
 */
export function snapshotAarch64MemoryProvenance(state) {
	const entries = collectEntries(state);
	const materialized = state.journal.materialize(entries, state.maxReadWords);
	const reads = entries.map((entry, index) => {
		return snapshotRead(state, entry, materialized.readEvents[index]);
	});
	return Object.freeze({
		recentReads: Object.freeze(reads),
		trackedPages: materialized.trackedPages
	});
}

function collectEntries(state) {
	const entries = [];
	const oldest = state.readCount === state.readLimit ? state.readNext : 0;
	for (let index = 0; index < state.readCount; index += 1) {
		const slot = (oldest + index) % state.readLimit;
		entries.push(Object.freeze({
			address: state.addresses[slot],
			generation: state.readGenerations[slot],
			size: state.sizes[slot],
			slot
		}));
	}
	return entries;
}

function snapshotRead(state, entry, events) {
	const captured = state.readValueSizes[entry.slot];
	return Object.freeze({
		address: entry.address.toString(),
		readerPc: decodePc(state.readerPcs[entry.slot]),
		size: entry.size,
		valueHex: formatProvenanceReadValue(state.readValues, entry.slot, captured),
		valueTruncated: captured > 0 && captured < entry.size,
		wordWriters: snapshotWriters(state.journal, entry.address, events)
	});
}

function snapshotWriters(journal, address, events) {
	const firstWord = alignWord(address);
	const writers = [];
	for (let index = 0; index < events.length; index += 1) {
		const event = journal.describe(events[index]);
		writers.push(Object.freeze({
			wordAddress: (firstWord + BigInt(index) * WORD_BYTES).toString(),
			writerPc: decodePc(event?.writerPc || 0n),
			writeAddress: event ? event.address.toString() : null,
			writeSize: event?.size ?? null,
			writeValueHex: event
				? formatProvenanceScalar(event.value, event.valueSize)
				: null
		}));
	}
	return Object.freeze(writers);
}

function decodePc(encoded) {
	return encoded === 0n ? null : (encoded - 1n).toString();
}
