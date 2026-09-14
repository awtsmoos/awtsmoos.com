//B"H
//Boruch Hashem
//Blessed be He

import { createNativeBiasedSegmentState } from "./nativeBiasedMemorySegments.js";

/**
 * Rebases one guest-memory vessel into a disjoint address range.
 *
 * The Awtsmoos keeps translation and integer access on a small hot facade while
 * segment routing lives in a locality-aware companion. No bytes are copied merely
 * to rebase an ELF image, and every loader/write boundary remains explicit.
 *
 * @param {object} memory Underlying ELF/native memory vessel.
 * @param {bigint|number|string} biasValue Guest address bias applied to the vessel.
 * @param {string} label Stable diagnostic label for this mapped memory region.
 * @returns {object} Frozen biased memory facade with exact address translation.
 */
export function createNativeBiasedMemory(memory, biasValue, label = "biased-elf") {
	const bias = BigInt(biasValue);
	const segmentState = createNativeBiasedSegmentState(memory, bias);
	const translate = address => BigInt(address) - bias;
	const read = (address, size) => memory.read(translate(address), size);
	const write = (address, bytes) => memory.write(translate(address), bytes);
	return Object.freeze({
		bias,
		contains: segmentState.contains,
		end: segmentState.end,
		label,
		loaderWriteU64(address, value) {
			const translated = translate(address);
			if (typeof memory.loaderWriteU64 === "function") {
				memory.loaderWriteU64(translated, value);
				return;
			}
			writeInteger(memory, translated, value, true);
		},
		read,
		readU32(address) {
			return readInteger(memory, translate(address), 4, false);
		},
		readU64(address) {
			return readInteger(memory, translate(address), 8, true);
		},
		segments: segmentState.segments,
		start: segmentState.start,
		write,
		writeU64(address, value) {
			const translated = translate(address);
			if (typeof memory.writeU64 === "function") {
				memory.writeU64(translated, value);
				return;
			}
			writeInteger(memory, translated, value, true);
		}
	});
}

/** Reads one exact little-endian scalar without changing guest ownership. */
function readInteger(memory, address, size, wide) {
	const bytes = memory.read(address, size);
	const view = new DataView(bytes.buffer, bytes.byteOffset, size);
	return wide
		? view.getBigUint64(0, true)
		: view.getUint32(0, true);
}

/** Writes one exact little-endian scalar through the underlying memory vessel. */
function writeInteger(memory, address, value, wide) {
	const bytes = new Uint8Array(wide ? 8 : 4);
	const view = new DataView(bytes.buffer);
	if (wide) {
		view.setBigUint64(0, BigInt.asUintN(64, BigInt(value)), true);
	} else {
		view.setUint32(0, Number(value) >>> 0, true);
	}
	memory.write(address, bytes);
}
