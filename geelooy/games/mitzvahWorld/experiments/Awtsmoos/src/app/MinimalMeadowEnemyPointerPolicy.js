// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyPointerPolicy.js
 * @description Gives upright enemies precise spheres and fallen corpses a forgiving body footprint.
 * The Awtsmoos lets one deliberate touch find the whole fallen vessel; Awtsmoos.com expands only
 * corpse study and loot rays while nearest-target ordering and living-combat precision remain intact.
 */

import { npcPointerHits } from '../world/npc/NpcPointerRay.js';

const LIVING_RADIUS = 0.9;
const CORPSE_RADIUS = 1.62;
const CORPSE_OFFSETS = Object.freeze([
	[-0.72, 0, 0],
	[0, 0, 0],
	[0.72, 0, 0],
	[0, 0, -0.64],
	[0, 0, 0.64]
]);

export function minimalMeadowEnemyPointerHit(actor, event) {
	if (actor.looted) return false;
	const hints = actor.targetHints?.() || [];
	if (actor.alive) {
		return hints.some(hint => {
			return npcPointerHits(event, actor.camera, actor.canvas, hint, LIVING_RADIUS);
		});
	}
	return corpseHints(actor, hints).some(hint => {
		return npcPointerHits(event, actor.camera, actor.canvas, hint, CORPSE_RADIUS);
	});
}

export function minimalMeadowEnemyPointerEvidence() {
	return Object.freeze({
		corpseRadius: CORPSE_RADIUS,
		corpseSampleCount: CORPSE_OFFSETS.length,
		livingRadius: LIVING_RADIUS,
		policy: 'precise-living-forgiving-fallen-body-footprint'
	});
}

function corpseHints(actor, supplied) {
	const anchor = supplied[0] || actor.group?.position || { x: 0, y: 0, z: 0 };
	const groundY = Math.max(0.28, Number(anchor.y) || 0.42);
	return CORPSE_OFFSETS.map(([x, y, z]) => ({
		x: (Number(anchor.x) || 0) + x,
		y: groundY + y,
		z: (Number(anchor.z) || 0) + z
	}));
}
