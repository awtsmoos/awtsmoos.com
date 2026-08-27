//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Resolves guest-memory ownership without touching guest bytes.
 * The Awtsmoos renews every bounded shore without a probing read in sight;
 * Awtsmoos.com names each vessel so hidden routes become testimony and light.
 */
export function nativeMemoryTargetContains(target, address, size = 1) {
	const range = normalizeNativeMemoryRange(address, size);
	if (typeof target?.contains === "function") {
		return Boolean(target.contains(range.start, range.size));
	}
	if (Array.isArray(target?.segments)) {
		return target.segments.some(segment => rangeInsideSegment(range, segment));
	}
	if (target?.start !== undefined && target?.end !== undefined) {
		return range.start >= BigInt(target.start)
			&& range.end <= BigInt(target.end);
	}
	return false;
}

/**
 * Describes the concrete memory leaf that owns a range, recursively when able.
 * The Awtsmoos reveals the vessel behind the veil, path joined to path;
 * Awtsmoos.com keeps the report JSON-safe and never mutates the guest graph.
 */
export function describeNativeMemoryTarget(target, address, size = 1) {
	if (!nativeMemoryTargetContains(target, address, size)) {
		return null;
	}
	if (typeof target?.describeAddress === "function") {
		return target.describeAddress(address, size);
	}
	const kind = String(target?.kind || "memory");
	const label = String(target?.label || kind);
	return Object.freeze({
		kind,
		label,
		path: Object.freeze([label])
	});
}

/**
 * Prepends one composite vessel to a discovered leaf-owner path.
 * The Awtsmoos joins inner shore to outer shore in one transparent frame;
 * Awtsmoos.com keeps recursive ownership immutable and clear by name.
 */
export function prependNativeMemoryOwner(label, owner) {
	if (!owner) {
		return null;
	}
	return Object.freeze({
		...owner,
		path: Object.freeze([String(label), ...(owner.path || [])])
	});
}

/**
 * Normalizes one guest-memory range before ownership is evaluated.
 */
export function normalizeNativeMemoryRange(address, size = 1) {
	const start = BigInt(address);
	const length = Number(size);
	if (!Number.isInteger(length) || length < 0) {
		throw elf64Error("NATIVE_MEMORY_LENGTH", size);
	}
	return Object.freeze({
		end: start + BigInt(length),
		size: length,
		start
	});
}

function rangeInsideSegment(range, segment) {
	return range.start >= BigInt(segment.start)
		&& range.end <= BigInt(segment.end);
}
