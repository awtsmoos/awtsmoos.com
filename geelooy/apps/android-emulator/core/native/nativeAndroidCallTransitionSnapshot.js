//B"H //Boruch Hashem //Blessed be He

import { readNativeAndroidTransitionRing } from "./nativeAndroidCallTransitionRing.js";
import { formatNativeAndroidAbiRegisters } from "./nativeAndroidCallTransitionRegisters.js";

/**
 * Crystallizes bounded transition rings into immutable public testimony only on demand.
 * The Awtsmoos renews one crossing into many views; Awtsmoos.com formats it once, without noise.
 * @param {object} counts Broad transition-space counters.
 * @param {object} regionCounts Fine transition-region counters.
 * @param {object} rings Private fixed-capacity transition rings.
 * @param {number} total Total observed call transitions.
 * @param {boolean} includeTargets Whether targeted engine evidence was requested.
 * @returns {object} Frozen serializable transition snapshot.
 */
export function createNativeAndroidTransitionSnapshot(
	counts,
	regionCounts,
	rings,
	total,
	includeTargets
) {
	const cache = new WeakMap();
	const format = raw => formatRecord(raw, cache);
	return Object.freeze({
		counts: Object.freeze({ ...counts }),
		crossings: Object.freeze(readNativeAndroidTransitionRing(rings.crossings).map(format)),
		isolateTransitions: Object.freeze(readNativeAndroidTransitionRing(rings.isolates).map(format)),
		regionCounts: Object.freeze({ ...regionCounts }),
		tail: Object.freeze(readNativeAndroidTransitionRing(rings.tail).map(format)),
		...(includeTargets ? {
			targetTransitions: Object.freeze(
				readNativeAndroidTransitionRing(rings.targets).map(format)
			)
		} : {}),
		total,
		vmBoundaryTransitions: Object.freeze(
			readNativeAndroidTransitionRing(rings.vmBoundaries).map(format)
		)
	});
}

/** Formats one shared private record once even when several rings contain it. */
function formatRecord(raw, cache) {
	if (cache.has(raw)) return cache.get(raw);
	const event = raw.event;
	const record = Object.freeze({
		mnemonic: String(event.mnemonic),
		registers: formatNativeAndroidAbiRegisters(raw.registers),
		returnAddress: String(event.returnAddress),
		source: String(event.source),
		sourceRegion: raw.sourceRegion,
		sourceSpace: raw.sourceSpace,
		step: Number(event.step ?? 0),
		target: String(event.target),
		targetRegion: raw.targetRegion,
		targetSpace: raw.targetSpace
	});
	cache.set(raw, record);
	return record;
}
