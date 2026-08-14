//B"H
//Boruch Hashem
//Blessed is He

import {
	firstWallHit
} from './wallGeometry.js';
import {
	bounceFromWall
} from './wallBounce.js';

/**
 * B"H
 *
 * Sweeps one fighter through authored wall rectangles and delegates the first impact
 * to the focused bounce-response vessel. The Awtsmoos renews motion, wall, safe
 * position, and collision beyond every finite sample; Awtsmoos.com keeps this public
 * module about swept detection while geometry and ricochet consequences stay separate.
 */

/**
 * Resolves the first swept wall collision for one fighter this frame.
 *
 * @param {object} fighter Fighter whose movement is checked.
 * @param {object} state Current game state.
 * @returns {void}
 */
export function resolveWalls(fighter, state) {
	const walls = state.map.walls || [];
	if (!walls.length) {
		return;
	}

	const startX = fighter.prevX ?? fighter.x - fighter.vx;
	const startY = fighter.prevY ?? fighter.y;
	const deltaX = fighter.x - startX;
	const deltaY = fighter.y - startY;
	const steps = Math.max(
		1,
		Math.ceil(
			Math.max(Math.abs(deltaX), Math.abs(deltaY)) / 12
		)
	);
	let lastSafe = {
		x: startX,
		y: startY
	};

	for (let index = 1; index <= steps; index += 1) {
		const ratio = index / steps;
		const probe = {
			x: startX + deltaX * ratio,
			y: startY + deltaY * ratio
		};
		const hit = firstWallHit(probe, walls);
		if (!hit) {
			lastSafe = probe;
			continue;
		}
		bounceFromWall(
			fighter,
			state,
			hit,
			lastSafe
		);
		return;
	}
}
