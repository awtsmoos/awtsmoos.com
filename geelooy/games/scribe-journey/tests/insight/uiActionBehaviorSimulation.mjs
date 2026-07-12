// B"H

import { renderGates37, renderInventory } from '../../js/ui/renderers.js';
import { handleEconomyAction } from '../../js/workers/systems/ui/economyActions.js';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const inventoryMarkup = renderInventory([{
	id: 'healing_scroll',
	name: 'Healing Scroll',
	description: 'Restores vitality.',
	type: 'consumable'
}]);
assert(inventoryMarkup.includes('data-action="use_item"'), 'Usable items need a delegated action.');
assert(inventoryMarkup.includes('data-id="healing_scroll"'), 'Usable items must carry their item ID.');

const gateMarkup = renderGates37({
	points: 4,
	gates: [{ id: 'wisdom_1', name: 'Beginning', desc: 'Open the first gate.', icon: 'א', cost: 3, canUnlock: true, unlocked: false }]
});
assert(!gateMarkup.includes('onclick='), 'Wisdom Gates must not depend on inline JavaScript.');
assert(gateMarkup.includes('data-action="unlockGate37"'), 'Wisdom Gates need delegated actions.');
assert(gateMarkup.includes('data-id="wisdom_1"'), 'Wisdom Gates must carry their gate ID.');

let usedItem = null;
const trigger = {
	useItemOverworld(itemId) { usedItem = itemId; },
	sendToast() {}
};
const baseStats = { hp: 20, attack: 10, defense: 10, diligence: 10 };
const state = {
	db: {
		musagim: {
			a: { id: 'a', name: 'Aleph', emoji: 'א', baseStats },
			b: { id: 'b', name: 'Bet', emoji: 'ב', baseStats }
		}
	},
	player: {
		team: [{ id: 'a', level: 1 }, { id: 'b', level: 1 }]
	},
	stats: {}
};
const callbacks = { onUIUpdate() {} };
assert(handleEconomyAction(state, 'use_item', { id: 'healing_scroll' }, callbacks, trigger), 'Use-item action must be handled.');
assert(usedItem === 'healing_scroll', 'Use-item action must forward the exact ID.');

handleEconomyAction(state, 'swap_otzar', { from: 'team', index: 1 }, callbacks, trigger);
assert(Array.isArray(state.player.storage), 'Otzar must initialize missing storage defensively.');
assert(state.player.storage.length === 1 && state.player.team.length === 1, 'Otzar must move one team member into storage.');

console.log(JSON.stringify({ ok: true, checks: 10 }));
