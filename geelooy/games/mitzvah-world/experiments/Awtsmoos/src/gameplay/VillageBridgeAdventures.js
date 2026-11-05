// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBridgeAdventures.js
 * @description Defines the Bridge Trial and its restorative follow-through as durable AdventureStore truth.
 * The Awtsmoos joins effort, earned material, and repaired passage while Awtsmoos.com keeps each
 * objective semantic, reward exact-once, and world consequence readable by UI, persistence, and AI.
 */

import { CANONICAL_VILLAGE_LANDMARKS } from '../world/village/CanonicalVillagePlan.js';

export const VILLAGE_BRIDGE_TRIAL_QUEST_ID = 'village-bridge-trial';
export const VILLAGE_BRIDGE_RESTORATION_QUEST_ID = 'restore-village-bridge';
export const VILLAGE_BRIDGE_RESTORATION_TARGET = 'village-bridge-restoration';

const entrance = CANONICAL_VILLAGE_LANDMARKS.entrance;
const bridge = CANONICAL_VILLAGE_LANDMARKS.bridge;

/** Durable quest definitions intentionally use the existing semantic event vocabulary. */
export const VILLAGE_BRIDGE_ADVENTURES = Object.freeze([
	Object.freeze({
		description: 'Complete the village route from the arrival gate to BRIDGE01 and earn the stone needed for its repair.',
		giver: giver('Village Steward', 'village-steward', entrance),
		id: VILLAGE_BRIDGE_TRIAL_QUEST_ID,
		multiplayer: false,
		name: 'Village Bridge Trial',
		objectives: Object.freeze([
			objective('activity', 'village-bridge-trial', 'Complete the Village Bridge Trial.', entrance)
		]),
		reward: Object.freeze({
			items: Object.freeze([{ itemId: 'stone-block', quantity: 1 }]),
			mitzvahPoints: 25,
			xp: 160
		}),
		title: 'Village Bridge Trial'
	}),
	Object.freeze({
		description: 'Use the stone earned by completing the trial to restore the missing center span of BRIDGE01.',
		giver: giver('Village Steward', 'village-steward', bridge),
		id: VILLAGE_BRIDGE_RESTORATION_QUEST_ID,
		multiplayer: false,
		name: 'Restore the Village Bridge',
		objectives: Object.freeze([
			objective('build', VILLAGE_BRIDGE_RESTORATION_TARGET, 'Restore the missing bridge span.', bridge)
		]),
		reward: Object.freeze({ mitzvahPoints: 15, xp: 120 }),
		title: 'Restore the Village Bridge',
		worldEffects: Object.freeze([
			Object.freeze({ state: 'restored', target: 'BRIDGE01', type: 'world:bridge-restored' })
		])
	})
]);

/** Creates one immutable giver record at a canonical landmark. */
function giver(name, id, position) {
	return Object.freeze({ id, name, position: point(position) });
}

/** Creates one single-count semantic quest objective. */
function objective(eventType, target, description, marker) {
	return Object.freeze({ count: 1, description, eventType, marker: point(marker), target });
}

/** Copies only the position fields AdventureStore presentation needs. */
function point(value) {
	return Object.freeze({ x: Number(value.x), y: 0, z: Number(value.z) });
}
