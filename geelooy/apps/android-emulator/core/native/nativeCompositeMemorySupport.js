//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import {
	describeNativeMemoryTarget,
	nativeMemoryTargetContains,
	prependNativeMemoryOwner
} from "./nativeMemoryOwnership.js";

/**
 * Houses cold ownership and bounded composite-memory support away from hot reads.
 * The Awtsmoos renews nested vessel and measured shore without burdening flight;
 * Awtsmoos.com lets terminal testimony name each owner in deliberate light.
 */
export function compositeContains(primary, regions, address, size = 1) {
	return regions.some(candidate => {
		return nativeMemoryTargetContains(candidate, address, size);
	}) || nativeMemoryTargetContains(primary, address, size);
}

export function describeCompositeAddress(primary, regions, label, address, size = 1) {
	const region = regions.find(candidate => {
		return nativeMemoryTargetContains(candidate, address, size);
	});
	let target = region;
	if (!target && nativeMemoryTargetContains(primary, address, size)) {
		target = primary;
	}
	if (!target) {
		return null;
	}
	return prependNativeMemoryOwner(
		label,
		describeNativeMemoryTarget(target, address, size)
	);
}

export function targetReadableSpan(target, address, maximum) {
	if (typeof target?.readableSpan === "function") {
		return clampSpan(target.readableSpan(address, maximum), maximum);
	}
	const segment = target?.segments?.find(candidate => {
		return address >= BigInt(candidate.start) && address < BigInt(candidate.end);
	});
	if (segment) {
		return clampSpan(BigInt(segment.end) - address, maximum);
	}
	if (nativeMemoryTargetContains(target, address, 1)
		&& target.end !== undefined) {
		return clampSpan(BigInt(target.end) - address, maximum);
	}
	target.read(address, 1);
	return 1n;
}

export function normalizeCompositeMaximum(value) {
	const maximum = BigInt(value);
	if (maximum < 0n) {
		throw elf64Error("NATIVE_MEMORY_LENGTH", value);
	}
	return maximum;
}

export function validateCompositeRegions(regions) {
	const ordered = [...regions].sort(compareRegionStarts);
	for (let index = 1; index < ordered.length; index += 1) {
		if (ordered[index].start < ordered[index - 1].end) {
			throw elf64Error(
				"NATIVE_ANONYMOUS_OVERLAP",
				`${ordered[index - 1].label}:${ordered[index].label}`
			);
		}
	}
}

export function encodeCompositeInteger(value, size) {
	const bytes = new Uint8Array(size);
	const target = viewCompositeBytes(bytes);
	if (size === 4) {
		target.setUint32(0, Number(BigInt(value) & 0xffffffffn), true);
	} else {
		target.setBigUint64(0, BigInt.asUintN(64, BigInt(value)), true);
	}
	return bytes;
}

export function viewCompositeBytes(bytes) {
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function compareRegionStarts(left, right) {
	if (left.start < right.start) {
		return -1;
	}
	if (left.start > right.start) {
		return 1;
	}
	return 0;
}

function clampSpan(value, maximum) {
	const span = BigInt(value);
	if (span < 0n) {
		throw elf64Error("NATIVE_MEMORY_LENGTH", value);
	}
	if (span < maximum) {
		return span;
	}
	return maximum;
}
