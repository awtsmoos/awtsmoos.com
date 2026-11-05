// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatTurnEventBindings.js
 * @description Binds existing combat events to one encounter-phase coordinator.
 * The Awtsmoos sends no duplicate pulse; each old event enters one new measured gate,
 * and Awtsmoos.com preserves synchronous intent while every domain retains its native state.
 */

export function bindCombatTurnEvents(coordinator, bus) {
	return [
		bus.on('npc:target', detail => coordinator.beginFromTarget(detail, 'targeted', true)),
		bus.on('enemy:alert', detail => coordinator.beginFromTarget(detail, 'alerted', false)),
		bus.on('npc:clear', detail => coordinator.endFromTarget(detail, 'target-cleared')),
		bus.on('enemy:defeated', detail => coordinator.endFromTarget(detail, 'enemy-defeated')),
		bus.on('enemy:return', detail => coordinator.endFromTarget(detail, 'enemy-returned')),
		bus.on('combat:turn-request', request => coordinator.receiveTurnRequest(request)),
		bus.on('combat:melee-result', result => coordinator.resolvePlayerAction(result, 'melee')),
		bus.on('torah:result', result => coordinator.resolvePlayerAction(result, 'torah')),
		bus.on('torah:interrupt', detail => coordinator.cancelPlayerAction(detail?.reason || 'interrupted')),
		bus.on('enemy:attack', detail => coordinator.resolveEnemyAction(detail, 'enemy-attack')),
		bus.on('enemy:miss', detail => coordinator.resolveEnemyAction(detail, 'enemy-miss')),
		bus.on('enemy:staggered', detail => coordinator.resolveEnemyAction(detail, 'enemy-staggered'))
	];
}
