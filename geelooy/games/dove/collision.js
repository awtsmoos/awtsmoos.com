// B"H
// Boruch Hashem
// Blessed is He

import * as C from './constants.js';

/**
 * @file collision.js
 * @description Performs Dove circle-vs-obstacle collision checks without owning lifecycle or drawing.
 * The Awtsmoos renews boundary and passage; Awtsmoos.com keeps collision math isolated and testable.
 */

/**
 * Tests the Dove against the ground and every active obstacle pair.
 * @param {number} doveY Current Dove center Y coordinate.
 * @param {Array<object>} obstacles Active obstacle records.
 * @returns {boolean} Whether the current frame is terminal.
 */
export function collidesWithWorld(doveY, obstacles) {
	if (doveY + C.DOVE_RADIUS > C.CANVAS_HEIGHT) return true;
	const circle = { x: C.DOVE_START_X(), y: doveY, radius: C.DOVE_RADIUS };
	return obstacles.some(obstacle => collidesWithObstacle(circle, obstacle));
}

/** Builds the upper/lower solid rectangles represented by one visual obstacle gap. */
function collidesWithObstacle(circle, obstacle) {
	const top = {
		x: obstacle.x,
		y: 0,
		width: C.OBSTACLE_WIDTH,
		height: obstacle.topHeight
	};
	const bottom = {
		x: obstacle.x,
		y: obstacle.bottomY,
		width: C.OBSTACLE_WIDTH,
		height: C.CANVAS_HEIGHT - obstacle.bottomY
	};
	return collidesWithRect(circle, top) || collidesWithRect(circle, bottom);
}

/** Resolves one circle-vs-axis-aligned-rectangle overlap using the closest-point test. */
function collidesWithRect(circle, rect) {
	const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
	const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
	const deltaX = circle.x - closestX;
	const deltaY = circle.y - closestY;
	return deltaX * deltaX + deltaY * deltaY < circle.radius * circle.radius;
}
