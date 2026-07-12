// B"H

import * as Crafting from '../../crafting.js';
import * as Quests from '../../quests.js';
import { featureList } from '../../../data/features_666.js';
import { getMitzvahPayload } from '../../../data/mitzvahs.js';
import { getGates37Payload, getGatesPayload, getOtzarPayload, getShemPayload } from './payloads.js';

const GAME_CLOSERS = new Set([
	'resume', 'close-shem', 'close-crafting', 'close-bestiary', 'close-mitzvah',
	'close-gemach', 'close-gates', 'close-dreidel', 'close-otzar',
	'close-player-quests', 'close-features', 'close-gates37'
]);

function show(state, callbacks, mode, screen, payload = {}) {
	state.mode = mode;
	callbacks.onUIUpdate({ screen, ...payload });
}

/** Returns true when the action is purely navigational. */
export function handleNavigationAction(state, action, callbacks) {
	if (GAME_CLOSERS.has(action)) {
		show(state, callbacks, 'game', 'game');
		return true;
	}

	const routes = {
		gameMenu: () => show(state, callbacks, 'gameMenu', 'gameMenu'),
		'main-menu': () => show(state, callbacks, 'main-menu', 'main-menu'),
		'inventory-screen': () => show(state, callbacks, 'inventory', 'inventory-screen', { inventory: Quests.getInventoryPayload(state) }),
		'quest-log-screen': () => show(state, callbacks, 'questlog', 'quest-log-screen', { questLog: Quests.getQuestLogPayload(state) }),
		'shem-screen': () => show(state, callbacks, 'shem', 'shem-screen', { shem: getShemPayload(state) }),
		'crafting-screen': () => show(state, callbacks, 'crafting', 'crafting-screen', { crafting: Crafting.getCraftingPayload(state) }),
		'mitzvah-screen': () => show(state, callbacks, 'mitzvah', 'mitzvah-screen', { mitzvahs: getMitzvahPayload(state) }),
		'gates-screen': () => show(state, callbacks, 'gates', 'gates-screen', { gates: getGatesPayload(state) }),
		'gates37-screen': () => show(state, callbacks, 'gates37', 'gates37-screen', { gates37: getGates37Payload(state) }),
		'otzar-screen': () => show(state, callbacks, 'otzar', 'otzar-screen', { otzar: getOtzarPayload(state) }),
		'player-quest-screen': () => show(state, callbacks, 'player-quest', 'player-quest-screen', { playerQuests: state.player.postedQuests || [], inventory: state.player.inventory }),
		'features-screen': () => show(state, callbacks, 'features', 'features-screen', { features: { list: featureList.slice(0, 50) } }),
		'bestiary-screen': () => {
			const entries = Object.values(state.db.musagim).map(musag => ({ name: musag.name, emoji: musag.emoji, seen: true, caught: false }));
			show(state, callbacks, 'bestiary', 'bestiary-screen', { bestiary: { entries, seenCount: entries.length, caughtCount: 0 } });
		}
	};

	if (action === 'close-inventory' || action === 'close-questlog') {
		show(state, callbacks, 'gameMenu', 'gameMenu');
		return true;
	}
	if (!routes[action]) return false;
	routes[action]();
	return true;
}
