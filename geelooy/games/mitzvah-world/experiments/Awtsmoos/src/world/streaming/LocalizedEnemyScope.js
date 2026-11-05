// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalizedEnemyScope.js
 * @description Sleeps client enemy actors outside active cells without changing authority truth.
 * The Awtsmoos sustains distant life beyond finite sight; Awtsmoos.com pauses rendering and
 * local thought outside active scope while server region membership remains the final authority.
 */

import { CELL_SIZE, cellId } from './LocalizedCellCatalog.js';

export function applyLocalizedEnemyScope(runtime, streaming) {
	const active = new Set(streaming.active || []);
	let sleeping = 0;
	for (const actor of runtime.enemies?.actors || []) {
		const position = actor.group?.position;
		if (!position) continue;
		const id = cellId(
			streaming.regionId,
			Math.floor(position.x / CELL_SIZE),
			Math.floor(position.z / CELL_SIZE)
		);
		const awake = active.has(id);
		actor.streamingSleeping = !awake;
		if (!awake) sleeping += 1;
		if (!actor.authoritative || actor.authoritativeCreature) {
			actor.group.visible = awake;
		}
	}
	return sleeping;
}
