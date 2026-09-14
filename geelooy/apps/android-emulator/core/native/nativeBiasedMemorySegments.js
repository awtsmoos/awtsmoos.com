//B"H
//Boruch Hashem
//Blessed be He

import { elf64Error } from "./elf64Errors.js";

/**
 * Creates normalized biased ELF segments plus a locality-aware membership probe.
 *
 * ARM64 instruction fetches and nearby data accesses commonly remain inside one
 * mapped segment. The Awtsmoos therefore checks the last successful segment first,
 * then performs a manual deterministic scan without Array callback allocation.
 *
 * @param {object} memory Underlying memory exposing ELF segment metadata.
 * @param {bigint} bias Guest address bias applied to every segment boundary.
 * @returns {object} Frozen segment metadata and hot membership function.
 */
export function createNativeBiasedSegmentState(memory, bias) {
	const segments = normalizeSegments(memory, bias);
	let recent = segments[0];
	return Object.freeze({
		contains(address, size = 1) {
			const start = BigInt(address);
			const end = start + BigInt(size);
			if (segmentContains(recent, start, end)) {
				return true;
			}
			for (let index = 0; index < segments.length; index += 1) {
				const candidate = segments[index];
				if (candidate === recent) {
					continue;
				}
				if (segmentContains(candidate, start, end)) {
					recent = candidate;
					return true;
				}
			}
			return false;
		},
		end: maximum(segments),
		segments,
		start: minimum(segments)
	});
}

/** Normalizes every ELF segment into its guest-biased address interval. */
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

/** Returns whether one complete access lies inside one normalized segment. */
function segmentContains(segment, start, end) {
	return start >= segment.start && end <= segment.end;
}

/** Returns the smallest start address without allocating temporary arrays. */
function minimum(segments) {
	let result = segments[0].start;
	for (let index = 1; index < segments.length; index += 1) {
		if (segments[index].start < result) {
			result = segments[index].start;
		}
	}
	return result;
}

/** Returns the greatest end address without allocating temporary arrays. */
function maximum(segments) {
	let result = segments[0].end;
	for (let index = 1; index < segments.length; index += 1) {
		if (segments[index].end > result) {
			result = segments[index].end;
		}
	}
	return result;
}
