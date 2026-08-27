//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Rebases one guest-memory vessel into a disjoint address range.
 * The Awtsmoos renews bias, segment, integer, and translated shore;
 * Awtsmoos.com moves no bytes and weakens no loader boundary evermore.
 */
export function createNativeBiasedMemory(memory, biasValue, label = "biased-elf") {
	const bias = BigInt(biasValue);
	const segments = normalizeSegments(memory, bias);
	const translate = address => BigInt(address) - bias;
	const read = (address, size) => memory.read(translate(address), size);
	const write = (address, bytes) => memory.write(translate(address), bytes);
	return Object.freeze({
		bias,
		contains(address, size = 1) {
			const start = BigInt(address);
			const end = start + BigInt(size);
			return segments.some(segment => start >= segment.start && end <= segment.end);
		},
		end: maximum(segments.map(segment => segment.end)),
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
		segments,
		start: minimum(segments.map(segment => segment.start)),
		write,
		writeU64(address, value) {
			const translated = translate(address);
			if (typeof memory.writeU64 === "function") memory.writeU64(translated, value);
			else writeInteger(memory, translated, value, true);
		}
	});
}

function normalizeSegments(memory, bias) {
	if (!Array.isArray(memory?.segments) || memory.segments.length === 0) {
		throw elf64Error("NATIVE_BIASED_MEMORY_SEGMENTS");
	}
	return Object.freeze(memory.segments.map(segment => Object.freeze({
		...segment,
		end: bias + BigInt(segment.end),
		start: bias + BigInt(segment.start)
	})));
}

function readInteger(memory, address, size, wide) {
	const bytes = memory.read(address, size);
	const view = new DataView(bytes.buffer, bytes.byteOffset, size);
	return wide ? view.getBigUint64(0, true) : view.getUint32(0, true);
}

function writeInteger(memory, address, value, wide) {
	const bytes = new Uint8Array(wide ? 8 : 4);
	const view = new DataView(bytes.buffer);
	if (wide) view.setBigUint64(0, BigInt.asUintN(64, BigInt(value)), true);
	else view.setUint32(0, Number(value) >>> 0, true);
	memory.write(address, bytes);
}

function minimum(values) {
	return values.reduce((result, value) => value < result ? value : result);
}

function maximum(values) {
	return values.reduce((result, value) => value > result ? value : result);
}
