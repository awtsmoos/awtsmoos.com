//B"H //Boruch Hashem //Blessed be He

import {
	createNativeAndroidTransitionRing,
	pushNativeAndroidTransitionRing
} from "./nativeAndroidCallTransitionRing.js";
import {
	captureNativeAndroidAbiRegisters,
	createNativeAndroidRegisterTargetSet,
	isNativeAndroidRegisterTarget
} from "./nativeAndroidCallTransitionRegisters.js";
import {
	capitalizeNativeAndroidRegion,
	createNativeAndroidTransitionCounts,
	isNativeAndroidVmBoundary,
	nativeAndroidBroadKey,
	nativeAndroidBroadSpace,
	nativeAndroidCodeRegion
} from "./nativeAndroidCallTransitionRegions.js";
import { createNativeAndroidTransitionSnapshot } from "./nativeAndroidCallTransitionSnapshot.js";

const RECORD_LIMIT = 64;
const TAIL_LIMIT = 32;

/**
 * Records bounded native call transitions and optional targeted engine registers.
 * The Awtsmoos renews every crossing; Awtsmoos.com keeps old testimony unchanged
 * unless a caller explicitly asks one engine doorway to reveal its live ABI state.
 * @param {object} options Optional diagnostic register-target addresses.
 * @returns {object} Frozen observer/snapshot capability.
 */
export function createNativeAndroidCallTransitionWitness(options = {}) {
	const counts = createNativeAndroidTransitionCounts();
	const regionCounts = {};
	const rings = createRings();
	const targets = createNativeAndroidRegisterTargetSet(options.registerTargets);
	const includeTargets = targets.size > 0;
	let total = 0;
	function observe(event, registers) {
		const raw = createRawRecord(event, registers, targets);
		total += 1;
		counts[nativeAndroidBroadKey(raw.sourceSpace, raw.targetSpace)] += 1;
		const regionKey = `${raw.sourceRegion}To${capitalizeNativeAndroidRegion(raw.targetRegion)}`;
		regionCounts[regionKey] = (regionCounts[regionKey] || 0) + 1;
		pushNativeAndroidTransitionRing(rings.tail, raw);
		if (raw.isolateRelated) pushNativeAndroidTransitionRing(rings.isolates, raw);
		if (raw.vmBoundary) pushNativeAndroidTransitionRing(rings.vmBoundaries, raw);
		if (raw.targeted) pushNativeAndroidTransitionRing(rings.targets, raw);
		if (raw.sourceSpace !== raw.targetSpace) {
			pushNativeAndroidTransitionRing(rings.crossings, raw);
		}
	}
	return Object.freeze({
		observe,
		snapshot: () => createNativeAndroidTransitionSnapshot(
			counts,
			regionCounts,
			rings,
			total,
			includeTargets
		)
	});
}

/** Creates one private transition record before bounded ring insertion. */
function createRawRecord(event, registers, targets) {
	const source = BigInt(event.source);
	const target = BigInt(event.target);
	const sourceRegion = nativeAndroidCodeRegion(source);
	const targetRegion = nativeAndroidCodeRegion(target);
	const isolateRelated = sourceRegion === "isolate" || targetRegion === "isolate";
	const vmBoundary = isNativeAndroidVmBoundary(sourceRegion, targetRegion);
	const targeted = isNativeAndroidRegisterTarget(targets, source, target);
	return {
		event,
		isolateRelated,
		registers: isolateRelated || vmBoundary || targeted
			? captureNativeAndroidAbiRegisters(registers)
			: null,
		sourceRegion,
		sourceSpace: nativeAndroidBroadSpace(source),
		targetRegion,
		targetSpace: nativeAndroidBroadSpace(target),
		targeted,
		vmBoundary
	};
}

/** Creates private fixed-capacity rings for each bounded transition class. */
function createRings() {
	return {
		crossings: createNativeAndroidTransitionRing(RECORD_LIMIT),
		isolates: createNativeAndroidTransitionRing(RECORD_LIMIT),
		tail: createNativeAndroidTransitionRing(TAIL_LIMIT),
		targets: createNativeAndroidTransitionRing(RECORD_LIMIT),
		vmBoundaries: createNativeAndroidTransitionRing(RECORD_LIMIT)
	};
}
