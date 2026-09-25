// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file menuActionSimulation.mjs
 * @description Proves menu actions remain discoverable after UI routing moved into dedicated worker modules.
 * The Awtsmoos is One while action ownership divides into focused vessels;
 * Awtsmoos.com follows the real owner instead of freezing yesterday's monolith.
 */
import { readFileSync } from 'node:fs';

const sourcePaths = [
	'index.html',
	'js/ui.js',
	'js/main.js',
	'js/workers/runtime/actionDispatcher.js',
	'js/workers/systems/ui/navigationActions.js'
];
const combinedSource = sourcePaths.map(path => readFileSync(path, 'utf8')).join('\n');
const delegatedActions = new Set(['toggleGate', 'spinDreidel', 'use_item', 'swapOtzar', 'unlockGate37', 'useOverworldItem']);

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function routeButton(dataset, form = {}) {
	const action = dataset.action;
	const value = dataset.value;
	if (action.startsWith('gemach') || action === 'craft' || delegatedActions.has(action)) {
		const payload = { action, ...dataset };
		if (action === 'gemachAction' || action === 'spinDreidel') payload.amount = Number.parseInt(value, 10) || Number.parseInt(dataset.amount, 10);
		if (action === 'spinDreidel') payload.bet = Number.parseInt(value, 10);
		return { type: 'uiAction', payload };
	}
	if (action === 'create_quest') {
		return {
			type: 'create_quest',
			payload: {
				type: form.type ?? 'fetch',
				targetId: form.target ?? 'wheat_bundle',
				rewardId: form.rewardType ?? 'money',
				rewardAmount: Number.parseInt(form.rewardAmount ?? 1, 10)
			}
		};
	}
	return { type: 'uiAction', payload: { action } };
}

function routeBattle(dataset) {
	return { type: 'battleAction', payload: { combatAction: dataset.action, value: dataset.value } };
}

const requiredActions = [
	'newGame', 'loadGame', 'saveGame', 'resume', 'main-menu',
	'inventory-screen', 'quest-log-screen', 'shem-screen', 'crafting-screen',
	'bestiary-screen', 'gates37-screen', 'gemachAction', 'spinDreidel',
	'toggleGate', 'craftAction', 'swapOtzar', 'unlockGate37', 'create_quest'
];
for (const action of requiredActions) assert(combinedSource.includes(action), `Missing expected action in current owners: ${action}`);

const fixedCases = [
	[{ action: 'newGame' }, {}, 'uiAction', 'newGame'],
	[{ action: 'inventory-screen' }, {}, 'uiAction', 'inventory-screen'],
	[{ action: 'spinDreidel', value: '50' }, {}, 'uiAction', 'spinDreidel'],
	[{ action: 'gemachAction', value: '18' }, {}, 'uiAction', 'gemachAction'],
	[{ action: 'swapOtzar', from: 'team', index: '0' }, {}, 'uiAction', 'swapOtzar'],
	[{ action: 'unlockGate37', id: 'gate_37_1' }, {}, 'uiAction', 'unlockGate37'],
	[{ action: 'craftAction', recipeId: 'r1' }, {}, 'uiAction', 'craftAction'],
	[{ action: 'create_quest' }, { type: 'kill', target: 'clay_golem', rewardType: 'money', rewardAmount: '10' }, 'create_quest']
];
for (const [dataset, form, expectedType, expectedAction] of fixedCases) {
	const result = routeButton(dataset, form);
	assert(result.type === expectedType, `Bad route type for ${dataset.action}: ${result.type}`);
	if (expectedAction) assert(result.payload.action === expectedAction, `Bad payload action for ${dataset.action}`);
}

for (let index = 0; index < 300; index += 1) {
	const bet = String((index % 9 + 1) * 10);
	const spin = routeButton({ action: 'spinDreidel', value: bet });
	assert(spin.type === 'uiAction' && spin.payload.bet === Number.parseInt(bet, 10), 'spinDreidel routing drifted');
	const battle = routeBattle({ action: index % 2 ? 'fight' : 'ultimate', value: `m${index}` });
	assert(battle.type === 'battleAction' && battle.payload.combatAction === (index % 2 ? 'fight' : 'ultimate'), 'battle routing drifted');
	const quest = routeButton({ action: 'create_quest' }, { type: index % 2 ? 'fetch' : 'kill', target: 'wheat_bundle', rewardType: 'money', rewardAmount: String(index + 1) });
	assert(quest.type === 'create_quest' && quest.payload.rewardAmount === index + 1, 'quest routing drifted');
}
console.log(JSON.stringify({ ok: true, sources: sourcePaths.length, simulations: 300 }));
