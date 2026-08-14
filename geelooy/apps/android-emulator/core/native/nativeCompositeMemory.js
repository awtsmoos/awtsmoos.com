//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64MemoryProvenance } from "./aarch64MemoryProvenance.js";
import { resolveCompositeTarget } from "./nativeCompositeMemoryRoute.js";
import {
	compositeContains,
	describeCompositeAddress,
	encodeCompositeInteger,
	normalizeCompositeMaximum,
	targetReadableSpan,
	validateCompositeRegions,
	viewCompositeBytes
} from "./nativeCompositeMemorySupport.js";

/**
 * Routes guest-native accesses across recursively named memory vessels.
 * The Awtsmoos recreates owner, byte crossing, and causal testimony anew;
 * Awtsmoos.com keeps the hot route lean while cold reports reveal who knew.
 */
export function createNativeCompositeMemory(
	primary,
	regions = [],
	label = "composite-memory"
) {
	const anonymous = Object.freeze([...regions]);
	const provenance = createAarch64MemoryProvenance();
	const memoryLabel = String(label);
	validateCompositeRegions(anonymous);
	const route = (address, size) => {
		return resolveCompositeTarget(primary, anonymous, address, size);
	};
	const read = (address, size) => {
		const bytes = route(address, size).read(address, size);
		provenance.recordRead(address, bytes);
		return bytes;
	};
	const write = (address, bytes) => {
		route(address, bytes.byteLength).write(address, bytes);
		provenance.recordWrite(address, bytes);
	};
	return Object.freeze({
		aarch64ProvenanceSnapshot: provenance.snapshot,
		beginAarch64Instruction: provenance.begin,
		contains(address, size = 1) {
			return compositeContains(primary, anonymous, address, size);
		},
		describeAddress(address, size = 1) {
			return describeCompositeAddress(
				primary,
				anonymous,
				memoryLabel,
				address,
				size
			);
		},
		endAarch64Instruction: provenance.end,
		kind: "composite-memory",
		label: memoryLabel,
		read,
		readableSpan(address, maximum) {
			const start = BigInt(address);
			const limit = normalizeCompositeMaximum(maximum);
			if (limit === 0n) {
				return 0n;
			}
			return targetReadableSpan(route(start, 1), start, limit);
		},
		readU32(address) {
			return viewCompositeBytes(read(address, 4)).getUint32(0, true);
		},
		readU64(address) {
			return viewCompositeBytes(read(address, 8)).getBigUint64(0, true);
		},
		regions: anonymous,
		write,
		writeU32(address, value) {
			write(address, encodeCompositeInteger(value, 4));
		},
		writeU64(address, value) {
			write(address, encodeCompositeInteger(value, 8));
		}
	});
}
