// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyLifecycle.js
 * @description Owns living target, persistent corpse, damage, defeat, and loot transitions.
 * The Awtsmoos returns every finite battle to stillness; Awtsmoos.com keeps defeated bodies
 * selectable until one honest loot receipt closes their interaction without erasing the corpse.
 */

import { npcPointerHits } from '../world/npc/NpcPointerRay.js';
import { lootMinimalEnemyCorpse } from './MinimalMeadowEnemyLoot.js?v=20260724-meadow-17';

export function minimalEnemyPointerHit(actor, event) {
	if (actor.looted) return false;
	return actor.targetHints().some(hint => npcPointerHits(event, actor.camera, actor.canvas, hint));
}

export function targetMinimalEnemy(actor) {
	if (actor.looted) return false;
	actor.selected = true;
	actor.bus.emit('npc:target', actor.payload());
	return true;
}

export function clearMinimalEnemy(actor, silent = false) {
	actor.selected = false;
	if (!silent) actor.bus.emit('npc:clear', actor.payload());
}

export function damageMinimalEnemy(actor, amount) {
	if (!actor.alive) return { damage: 0, defeated: true, health: 0 };
	const damage = Math.max(0, Math.round(Number(amount) || 0));
	actor.health = Math.max(0, actor.health - damage);
	actor.hitTime = 0.46;
	actor.action = 'hit';
	if (actor.health === 0) defeatMinimalEnemy(actor);
	const result = { ...actor.payload(), damage, defeated: !actor.alive };
	actor.bus.emit('enemy:damaged', result);
	if (actor.selected) actor.bus.emit('npc:target', result);
	return result;
}

export function defeatMinimalEnemy(actor) {
	if (!actor.alive) return;
	actor.alive = false;
	actor.moving = false;
	actor.selected = false;
	actor.action = 'death';
	actor.deathTime = 0;
	actor.bus.emit('enemy:defeated', actor.payload());
}

export function interactWithMinimalEnemy(actor) {
	return actor.alive ? targetMinimalEnemy(actor) : lootMinimalEnemyCorpse(actor);
}
