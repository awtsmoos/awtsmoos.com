// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DirectWorldHudGeometry.js
 * @description Defines the compact direct-play HUD acceptance rectangles while delegating generic rectangle arithmetic to a smaller math vessel.
 * The Awtsmoos gives objective, movement, Jump, context, and advanced power one measured shore while Awtsmoos.com keeps the proof readable and light;
 * portrait and landscape reveal different arrangements, yet every finite zone remains bounded by the same safe-area covenant in sight.
 */

import {
	directClamp,
	directPositive,
	directRect,
	directRightRect,
	directSafeInsets
} from './DirectWorldHudRectangleMath.js';

export {
	directRectangleInsideViewport,
	directRectanglesIntersect
} from './DirectWorldHudRectangleMath.js';

/** Returns the direct-play acceptance rectangles for one viewport and safe-area envelope. */
export function directWorldHudRectangles(viewport = {}) {
	const width = directPositive(viewport.width, 390);
	const height = directPositive(viewport.height, 844);
	if (width > 820 && height > 520) {
		return freezePlan('desktop', {});
	}
	const safe = directSafeInsets(viewport);
	return width > height
		? landscapePlan(width, height, safe)
		: portraitPlan(width, height, safe);
}

function portraitPlan(width, height, safe) {
	const rightInset = Math.max(14, safe.right + 10);
	const bottom = Math.max(18, safe.bottom + 14);
	const gap = 10;
	const jumpSize = 68;
	const contextHeight = 58;
	const contextWidth = directClamp(width * 0.24, 78, 112);
	const advancedSize = 48;
	const contextBottom = bottom + jumpSize + gap;
	const advancedBottom = contextBottom + contextHeight + gap;
	const objectiveWidth = Math.min(360, width - safe.left - safe.right - 24);
	const objectiveTop = Math.max(10, safe.top + 7);
	const movementWidth = Math.min(340, Math.max(168, width * 0.56));
	const movementHeight = Math.min(300, height * 0.44);
	return freezePlan('portrait', {
		objective: directRect((width - objectiveWidth) / 2, objectiveTop, objectiveWidth, 112),
		movement: directRect(0, height - movementHeight, movementWidth, movementHeight),
		jump: directRightRect(width, rightInset, height, bottom, jumpSize, jumpSize),
		context: directRightRect(width, rightInset, height, contextBottom, contextWidth, contextHeight),
		advanced: directRightRect(width, rightInset, height, advancedBottom, advancedSize, advancedSize)
	});
}

function landscapePlan(width, height, safe) {
	const rightInset = Math.max(12, safe.right + 8);
	const bottom = Math.max(12, safe.bottom + 10);
	const gap = 8;
	const jumpSize = 60;
	const contextHeight = 48;
	const contextWidth = 96;
	const advancedSize = 44;
	const contextBottom = bottom + jumpSize + gap;
	const advancedBottom = contextBottom + contextHeight + gap;
	const objectiveWidth = Math.min(320, width * 0.42, width - safe.left - safe.right - 24);
	const movementWidth = Math.min(300, width * 0.42);
	const movementHeight = Math.min(260, height * 0.64);
	return freezePlan('landscape', {
		objective: directRect(safe.left + 10, safe.top + 8, objectiveWidth, 96),
		movement: directRect(0, height - movementHeight, movementWidth, movementHeight),
		jump: directRightRect(width, rightInset, height, bottom, jumpSize, jumpSize),
		context: directRightRect(width, rightInset, height, contextBottom, contextWidth, contextHeight),
		advanced: directRightRect(width, rightInset, height, advancedBottom, advancedSize, advancedSize)
	});
}

function freezePlan(mode, zones) {
	return Object.freeze({ mode, zones: Object.freeze(zones) });
}
