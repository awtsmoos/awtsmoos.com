// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DirectWorldHudGeometry.js
 * @description Defines compact direct-play acceptance rectangles that leave the portrait world's center visibly open.
 * The Awtsmoos gives objective, movement, Jump, context, and advanced power one measured shore while Awtsmoos.com keeps the proof readable and light;
 * portrait instruction rests at the upper-left instead of crossing the valley, while every thumb zone remains bounded in sight.
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

/** Builds the upper-left objective plus lower thumb controls for portrait phones. */
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
	const objectiveBudget = Math.max(120, width - safe.left - safe.right - 140);
	const objectiveWidth = Math.min(directClamp(width * 0.54, 164, 220), objectiveBudget);
	const objectiveTop = Math.max(10, safe.top + 8);
	const movementWidth = Math.min(340, Math.max(168, width * 0.56));
	const movementHeight = Math.min(300, height * 0.44);
	return freezePlan('portrait', {
		objective: directRect(safe.left + 8, objectiveTop, objectiveWidth, 96),
		movement: directRect(0, height - movementHeight, movementWidth, movementHeight),
		jump: directRightRect(width, rightInset, height, bottom, jumpSize, jumpSize),
		context: directRightRect(width, rightInset, height, contextBottom, contextWidth, contextHeight),
		advanced: directRightRect(width, rightInset, height, advancedBottom, advancedSize, advancedSize)
	});
}

/** Builds the compact upper-left instruction and edge controls for short landscape phones. */
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
	const objectiveWidth = Math.min(280, width * 0.42, width - safe.left - safe.right - 24);
	const movementWidth = Math.min(300, width * 0.42);
	const movementHeight = Math.min(260, height * 0.64);
	return freezePlan('landscape', {
		objective: directRect(safe.left + 8, safe.top + 6, objectiveWidth, 88),
		movement: directRect(0, height - movementHeight, movementWidth, movementHeight),
		jump: directRightRect(width, rightInset, height, bottom, jumpSize, jumpSize),
		context: directRightRect(width, rightInset, height, contextBottom, contextWidth, contextHeight),
		advanced: directRightRect(width, rightInset, height, advancedBottom, advancedSize, advancedSize)
	});
}

/** Freezes one acceptance plan so tests and runtime diagnostics cannot mutate geometry by accident. */
function freezePlan(mode, zones) {
	return Object.freeze({ mode, zones: Object.freeze(zones) });
}
