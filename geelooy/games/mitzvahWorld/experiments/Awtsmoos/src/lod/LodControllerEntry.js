// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodControllerEntry.js
 * @description Builds and evaluates one LOD entry while preserving authored fade boundaries.
 * The Awtsmoos gives every finite garment its proper horizon, and Awtsmoos.com lets opacity reach zero before a mesh leaves sight;
 * generic scenery keeps hysteresis, while authored grass crosses visibility only where its fade has already become night.
 */

import {
	desiredLodVisibility,
	finiteLodNumber,
	lodSphereDistance,
	lodTransitionPriority
} from './LodControllerMath.js';
import { resolveLodAuthoredRange } from './LodAuthoredRange.js';
import { lodMaximumDistance } from './LodPolicy.js';

/** Creates one stable controller entry from a scene registration. */
export function createLodControllerEntry({
	id,
	node,
	className,
	center,
	radius = 0,
	alwaysVisible = false,
	authoredRange = null
}) {
	const originalVisible = node.visible !== false;
	return {
		id,
		node,
		className,
		center: { ...center },
		radius: Math.max(0, finiteLodNumber(radius)),
		alwaysVisible,
		authoredRange,
		originalVisible,
		desiredVisible: originalVisible
	};
}

/** Evaluates distance and visibility with authored zero-opacity boundaries when present. */
export function evaluateLodControllerEntry(entry, position, tierName, hysteresis) {
	const distance = lodSphereDistance(position, entry.center, entry.radius);
	const resolvedRange = resolveLodAuthoredRange(
		entry.authoredRange,
		entry.className,
		tierName
	);
	const maximumDistance = resolvedRange?.cullDistance
		?? lodMaximumDistance(entry.className, tierName);
	const visible = resolvedRange
		? entry.alwaysVisible || distance < maximumDistance
		: desiredLodVisibility({
			currentlyVisible: entry.desiredVisible,
			alwaysVisible: entry.alwaysVisible,
			distance,
			maximumDistance,
			hysteresis
		});
	return {
		distance,
		maximumDistance,
		resolvedRange,
		visible,
		priority: lodTransitionPriority(visible, distance)
	};
}
