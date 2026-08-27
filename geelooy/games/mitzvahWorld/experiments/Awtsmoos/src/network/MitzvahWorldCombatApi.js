// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCombatApi.js
 * @description Exposes authoritative attacks, Kavanah, support, counters, knowledge, boss, care, and loot.
 * The Awtsmoos lets browser intention travel without carrying consequence in its pocket;
 * Awtsmoos.com sends bounded names, targets, timing, tokens, and queries to the server hand.
 */

export function createMitzvahWorldCombatApi(send) {
	return {
		attack(creatureId, action = {}) {
			return send('combat.attack', {
				actionId: action.actionId,
				creatureId,
				elapsedSeconds: action.elapsedSeconds,
				impactToken: action.impactToken,
				intent: action.intent || 'defense',
				weaponId: action.weaponId
			});
		},
		defend(actionId) {
			return send('combat.defend', { actionId });
		},
		combatTick(steps = 1) {
			return send('combat.tick', { steps });
		},
		combatSnapshot() {
			return send('combat.snapshot');
		},
		startKavanah(actionId) {
			return send('kavanah.start', { actionId });
		},
		moveKavanah(castId, magnitude) {
			return send('kavanah.move', { castId, magnitude });
		},
		releaseKavanah(castId) {
			return send('kavanah.release', { castId });
		},
		cancelKavanah(reason = 'cancelled') {
			return send('kavanah.cancel', { reason });
		},
		supportCast(command = {}) {
			return send('combat.support.cast', { ...command });
		},
		groupCounter(command = {}) {
			return send('combat.group-counter', { ...command });
		},
		daasSnapshot() {
			return send('daas.snapshot');
		},
		bossSnapshot(creatureId) {
			return send('boss.snapshot', { creatureId });
		},
		care(creatureId) {
			return send('creature.care', { creatureId });
		},
		creatures() {
			return send('creature.snapshot');
		},
		loot(creatureId) {
			return send('loot.claim', { creatureId });
		},
		harvest(creatureId) {
			return send('harvest.perform', { creatureId });
		}
	};
}
