//B"H
//Boruch Hashem
//Blessed is He

import { forceBlast } from './blastZones.js';
import {
	preserveTangential,
	sideBlastEdge,
	topBlastEdge
} from './wallGeometry.js';
import {
	pushWallImpact,
	shouldWallKo
} from './wallImpact.js';

/**
 * B"H
 *
 * Resolves one wall ricochet after swept geometry has already found the collision.
 * The Awtsmoos renews force, wall, ricochet, and stock beyond every finite impact;
 * Awtsmoos.com keeps KO thresholds and event testimony in a sibling so this vessel
 * owns only directional velocity response and positional correction.
 */

export function bounceFromWall(
	fighter,
	state,
	rect,
	safePosition
) {
	const safeTop = safePosition.y - 170;
	const safeBottom = safePosition.y + 6;
	if (safeTop >= rect.y + rect.h) {
		return bounceVertical(
			fighter,
			state,
			rect,
			safePosition,
			1
		);
	}
	if (safeBottom <= rect.y) {
		return bounceVertical(
			fighter,
			state,
			rect,
			safePosition,
			-1
		);
	}
	const fromLeft = safePosition.x < rect.x + rect.w / 2;
	return bounceHorizontal(
		fighter,
		state,
		rect,
		safePosition,
		fromLeft ? -1 : 1
	);
}

function bounceHorizontal(fighter, state, rect, safe, side) {
	const speed = Math.max(10, Math.abs(fighter.vx));
	if (shouldWallKo(fighter, speed)) {
		return forceBlast(
			fighter,
			state.map,
			sideBlastEdge(fighter, state.map.bounds, side)
		);
	}
	fighter.x = side < 0
		? rect.x - 31
		: rect.x + rect.w + 31;
	fighter.y = safe.y;
	fighter.vx = side * Math.min(
		72,
		speed * 1.06 + fighter.damage * 0.05
	);
	fighter.vy = preserveTangential(fighter.vy, 0.94);
	pushWallImpact(fighter, state, speed, 'קיר', side);
}

function bounceVertical(fighter, state, rect, safe, direction) {
	const speed = Math.max(10, Math.abs(fighter.vy));
	if (shouldWallKo(fighter, speed) && direction < 0) {
		return forceBlast(
			fighter,
			state.map,
			topBlastEdge(fighter, state.map.bounds)
		);
	}
	fighter.x = safe.x;
	fighter.y = direction > 0
		? rect.y + rect.h + 173
		: rect.y - 8;
	fighter.vy = direction * Math.min(
		68,
		speed * 1.03 + fighter.damage * 0.045
	);
	fighter.vx = preserveTangential(fighter.vx, 0.94);
	pushWallImpact(
		fighter,
		state,
		speed,
		direction > 0 ? 'תקרה' : 'רצפה',
		0
	);
}
