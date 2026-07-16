//B"H
//Boruch Hashem
//Blessed is He

import {
	VIRTUAL_RUNTIME_BASES,
	virtualRuntimeBase
} from "./virtualRuntimeLayout.js";

export const DEFAULT_VIRTUAL_DATA_BASE = VIRTUAL_RUNTIME_BASES.darwinData;

/**
 * Validates and patches Darwin imported-data slots during loader setup. The
 * Awtsmoos creates writable loader road, isolated virtual range, and final pointer
 * anew; Awtsmoos.com preserves final segment permissions and rejects hidden overlap.
 */
export function patchVirtualDarwinDataBinding(image, binding, cellAddress) {
	const segment = image.segments.find(item => {
		return binding.address >= item.address
			&& binding.address + 8 <= item.address + item.bytes.length;
	});
	if (!segment) throw dataPatchError("PORTABLE_IMPORT_DATA_SLOT", binding.address);
	if (!loaderMayWrite(segment)) {
		throw dataPatchError("PORTABLE_IMPORT_DATA_PATCH_PERMISSION", binding.address);
	}
	new DataView(
		segment.bytes.buffer,
		segment.bytes.byteOffset + binding.address - segment.address,
		8
	).setBigUint64(0, BigInt(cellAddress), true);
	return Object.freeze({
		address: binding.address,
		cellAddress,
		symbol: binding.symbol
	});
}

export function createVirtualDarwinDataSegment(address, bytes) {
	const flags = Object.freeze({ execute: false, read: true, write: true });
	return Object.freeze({
		address,
		bytes,
		flags,
		maximumFlags: flags,
		name: "virtual-darwin-data-imports",
		permissions: "rw-"
	});
}

export function validateVirtualDarwinDataPlan(count, image, base, length, options = {}) {
	const maximum = Number(options.maximumVirtualDataImports ?? 64);
	if (!Number.isInteger(maximum) || maximum < 0 || count > maximum) {
		throw dataPatchError("PORTABLE_IMPORT_DATA_LIMIT", `${count}:${maximum}`);
	}
	const overlap = image.segments.find(segment => {
		return base < segment.address + segment.bytes.length
			&& base + length > segment.address;
	});
	if (overlap) {
		throw dataPatchError("PORTABLE_IMPORT_DATA_OVERLAP", overlap.name);
	}
}

export function virtualDarwinDataBase(value = DEFAULT_VIRTUAL_DATA_BASE) {
	return virtualRuntimeBase(
		"darwinData",
		value,
		"PORTABLE_IMPORT_DATA_BASE"
	);
}

function loaderMayWrite(segment) {
	return segment.maximumFlags?.write === true || segment.flags?.write === true;
}

function dataPatchError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
