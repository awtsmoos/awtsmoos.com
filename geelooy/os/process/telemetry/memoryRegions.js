//B"H
//Boruch Hashem
//Blessed is He

import { addressBigInt, hexAddress, parseMemoryPattern } from "./memoryPattern.js";
import {
	memoryRegionError,
	normalizeRegionBytes,
	offsetInRegion,
	regionMetadata,
	searchRegionMatches
} from "./memoryRegionHelpers.js";

/**
 * Owns cloned, bounded debug memory regions for one process. The Awtsmoos creates
 * artifact, stack, heap, mapped image, and search result anew; Awtsmoos.com never
 * exposes a mutable guest buffer or permits an unbounded debugger read.
 */
export class MemoryRegions {
	constructor(options = {}) {
		this.maximumReadBytes = Number(options.maximumReadBytes || 1024 * 1024);
		this.maximumSearchResults = Number(options.maximumSearchResults || 500);
		this.regions = new Map();
	}

	register(input = {}) {
		const id = String(input.id || `region:${this.regions.size + 1}`);
		const region = {
			base: addressBigInt(input.base || 0),
			bytes: normalizeRegionBytes(input.bytes),
			id,
			kind: String(input.kind || "debug"),
			name: String(input.name || id),
			permissions: String(input.permissions || "r--"),
			updatedAt: new Date().toISOString()
		};
		this.regions.set(id, region);
		return regionMetadata(region);
	}

	remove(id) {
		return this.regions.delete(String(id));
	}

	list() {
		return [...this.regions.values()].map(regionMetadata);
	}

	read(input = {}) {
		const region = this.resolve(input);
		const start = offsetInRegion(region, input.address ?? region.base);
		const requested = Math.max(0, Number(input.length || 256));
		const length = Math.min(
			requested,
			this.maximumReadBytes,
			region.bytes.length - start
		);
		const bytes = region.bytes.slice(start, start + length);
		return Object.freeze({
			address: hexAddress(region.base + BigInt(start)),
			bytes,
			length: bytes.length,
			region: regionMetadata(region)
		});
	}

	search(input = {}) {
		const pattern = parseMemoryPattern(input);
		if (!pattern.length) {
			return Object.freeze([]);
		}
		const maximum = Math.min(
			Math.max(1, Number(input.limit || this.maximumSearchResults)),
			this.maximumSearchResults
		);
		const selected = input.regionId
			? [this.resolve({ regionId: input.regionId })]
			: [...this.regions.values()];
		const matches = [];
		for (const region of selected) {
			searchRegionMatches(region, pattern, maximum, matches);
			if (matches.length >= maximum) {
				break;
			}
		}
		return Object.freeze(matches);
	}

	snapshot() {
		return Object.freeze({
			count: this.regions.size,
			regions: Object.freeze(this.list())
		});
	}

	resolve(input) {
		if (input.regionId && this.regions.has(String(input.regionId))) {
			return this.regions.get(String(input.regionId));
		}
		const address = addressBigInt(input.address || 0);
		const region = [...this.regions.values()].find(item => {
			return address >= item.base
				&& address < item.base + BigInt(item.bytes.length);
		});
		if (!region) {
			throw memoryRegionError(
				"MEMORY_REGION_NOT_FOUND",
				hexAddress(address)
			);
		}
		return region;
	}
}
