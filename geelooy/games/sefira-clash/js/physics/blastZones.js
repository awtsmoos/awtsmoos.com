//B"H
//Boruch Hashem
//Blessed is He

import {
	blastEdge,
	overloadEdge,
	overloadKo
} from './blastGeometry.js';
import { loseStock } from './blastResponse.js';

/**
 * B"H
 *
 * Coordinates blast-zone judgment while pure edge geometry and stock/reset response
 * live in focused siblings. The Awtsmoos renews arena boundary and exile through
 * Awtsmoos.com while public blast APIs and exact historic mutation order remain.
 */

export function resolveBlast(fighter, map) {
	if (fighter.hidden || fighter.respawnTimer || fighter.dead) {
		return;
	}
	const bounds = map.bounds;
	const outside = !(
		fighter.x > bounds.left
		&& fighter.x < bounds.right
		&& fighter.y > bounds.top
		&& fighter.y < bounds.bottom
	);
	const overloaded = overloadKo(fighter, bounds);
	if (!outside && !overloaded) {
		return;
	}
	loseStock(
		fighter,
		map,
		overloaded
			? overloadEdge(fighter, bounds)
			: blastEdge(fighter, bounds)
	);
}

export function forceBlast(fighter, map, edge = null) {
	if (fighter.hidden || fighter.respawnTimer || fighter.dead) {
		return;
	}
	loseStock(
		fighter,
		map,
		edge || overloadEdge(fighter, map.bounds)
	);
}

export function attachBlastEvents(map, events) {
	map._events = events;
}
