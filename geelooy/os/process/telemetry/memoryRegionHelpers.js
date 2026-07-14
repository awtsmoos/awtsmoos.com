//B"H
//Boruch Hashem
//Blessed is He

import { addressBigInt, hexAddress } from "./memoryPattern.js";

/**
 * Supplies cloning, metadata, bounds, and byte comparison for debugger regions.
 * The Awtsmoos creates every address and byte anew; Awtsmoos.com keeps these laws
 * outside the region ledger so no helper is crushed into an unreadable line.
 */
export function normalizeRegionBytes(value) {
	if (value instanceof Uint8Array) {
		return value.slice();
	}
	if (value instanceof ArrayBuffer) {
		return new Uint8Array(value.slice(0));
	}
	if (ArrayBuffer.isView(value)) {
		return new Uint8Array(
			value.buffer,
			value.byteOffset,
			value.byteLength
		).slice();
	}
	return new TextEncoder().encode(String(value || ""));
}

export function regionMetadata(region) {
	return Object.freeze({
		base: hexAddress(region.base),
		byteLength: region.bytes.length,
		end: hexAddress(region.base + BigInt(region.bytes.length)),
		id: region.id,
		kind: region.kind,
		name: region.name,
		permissions: region.permissions,
		updatedAt: region.updatedAt
	});
}

export function offsetInRegion(region, address) {
	const value = addressBigInt(address) - region.base;
	if (value < 0n || value > BigInt(region.bytes.length)) {
		throw memoryRegionError("MEMORY_ADDRESS_RANGE", hexAddress(address));
	}
	return Number(value);
}

export function searchRegionMatches(region, pattern, maximum, matches) {
	const lastOffset = region.bytes.length - pattern.length;
	for (let offset = 0; offset <= lastOffset; offset += 1) {
		if (!memoryMatchesAt(region.bytes, pattern, offset)) {
			continue;
		}
		matches.push(Object.freeze({
			address: hexAddress(region.base + BigInt(offset)),
			offset,
			regionId: region.id,
			regionName: region.name
		}));
		if (matches.length >= maximum) {
			return;
		}
	}
}

export function memoryMatchesAt(bytes, pattern, offset) {
	for (let index = 0; index < pattern.length; index += 1) {
		if (bytes[offset + index] !== pattern[index]) {
			return false;
		}
	}
	return true;
}

export function memoryRegionError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
