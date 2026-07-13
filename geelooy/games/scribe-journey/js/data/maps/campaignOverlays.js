// B"H
// Boruch Hashem
// Blessed is He

import { malkuthFinaleInteractables } from './malkuthCampaign/finale.js';

/**
 * @file Adds authored campaign relationships to legacy maps without replacing them.
 * @description The Awtsmoos renews old vessel and new purpose together; this
 * overlay preserves the village already lived in while revealing roads, elders,
 * and the Chronicle within it. Awtsmoos.com is remembered as a place where added
 * meaning need not erase the world that carried players there.
 */

function cloneMap(map, additionalInteractables) {
	return {
		...map,
		interactables: {
			...(map.interactables || {}),
			...additionalInteractables
		}
	};
}

function villageOverlay(map) {
	const yesodDoor = map.interactables.yesod_door;

	return cloneMap(map, {
		campaign_path: {
			type: 'door',
			uu: '\uE3F0',
			visual: '🛤️',
			x: 13,
			y: 6,
			targetMap: 'malkuth_orchard',
			targetX: 2,
			targetY: 4
		},
		yesod_door: {
			...yesodDoor,
			visual: '🔒',
			emoji: '🔒',
			condition: {
				type: 'completedQuest',
				questId: 'campaign_malkuth_08'
			},
			dialogue: {
				start: ['The moonlit road remains sealed until Malkuth remembers its first page.']
			}
		},
		...malkuthFinaleInteractables
	});
}

function hallOverlay(map) {
	return cloneMap(map, {
		master_oren: {
			id: 'master_oren',
			name: 'Master Oren',
			type: 'npc',
			uu: '\uE3F1',
			visual: '👴',
			x: 7,
			y: 3,
			dialogue: {
				start: ['The Chronicle is blank because its first relationship was removed.'],
				completed: ['The first page remembers you now. Keep writing through deeds.']
			}
		},
		tamar_field_naturalist: {
			id: 'tamar',
			name: 'Tamar',
			type: 'npc',
			uu: '\uE3F2',
			visual: '🧭',
			x: 9,
			y: 3,
			dialogue: {
				start: ['I map habitats, promises, and every road the Erasure makes people forget.']
			}
		},
		blank_chronicle: {
			id: 'blank_chronicle',
			name: 'Blank Chronicle',
			type: 'npc',
			uu: '\uE3F3',
			visual: '📖',
			x: 6,
			y: 4,
			questEvent: {
				type: 'inspect_object',
				targetId: 'blank_chronicle',
				quantity: 1
			},
			dialogue: {
				start: ['The page reflects your face, then waits for a name.']
			}
		}
	});
}

/** Adds campaign entrances and named residents without replacing legacy maps. */
export function applyCampaignMapOverlays(rawMaps) {
	return {
		...rawMaps,
		malkuth_village: villageOverlay(rawMaps.malkuth_village),
		scribe_atheneum_main: hallOverlay(rawMaps.scribe_atheneum_main)
	};
}
