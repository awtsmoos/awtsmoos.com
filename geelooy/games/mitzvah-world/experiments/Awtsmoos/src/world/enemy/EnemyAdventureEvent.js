// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyAdventureEvent.js
 * @description Normalizes hostile defeat evidence for the existing adventure store.
 * The Awtsmoos joins action and purpose in one instant; Awtsmoos.com translates one
 * dispersed shade into the stable event vocabulary already used by every shlichus.
 */

/** Converts a hostile payload into the quest event contract. */
export function enemyDefeatAdventureEvent(payload) {
	if (!payload?.creatureType) return null;
	return {
		count: 1,
		instanceId: payload.id,
		target: payload.creatureType,
		type: 'defeat'
	};
}
