// B"H
// Boruch Hashem
// Blessed is He

import { createDefaultGameState } from '../../js/data/database.js';
import { useBattleItem } from '../../js/workers/combat/battleItems.js';
import { emitHealthThresholds } from '../../js/workers/combat/battleEvents.js';
import { finishBattle } from '../../js/workers/combat/battleRewards.js';
import * as Combat from '../../js/workers/combat/core.js';
import { executeTurn } from '../../js/workers/combat/turnEngine.js';
import * as Quests from '../../js/workers/quests.js';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function objective(type, targetId, required = 1) {
	return { id: `${type}_${targetId}`, type, targetId, required, text: `${type} ${targetId}` };
}

const state = createDefaultGameState();
state.player.level = 100;
state.player.inventory.push({ ...state.db.items.echo_seal, captureRate: 0.95 });
state.db.quests = {
	capture_only: { id: 'capture_only', title: 'Capture', objectives: [objective('recruit_musag', 'blotling')] },
	defeat_only: { id: 'defeat_only', title: 'Defeat', objectives: [objective('defeat_species', 'blotling')] },
	phase_test: { id: 'phase_test', title: 'Phases', objectives: [objective('defeat_boss_phase', 'classification_seals', 3)] },
	boss_test: { id: 'boss_test', title: 'Boss', objectives: [objective('defeat_boss', 'lexicon_tyrant')] },
	move_test: { id: 'move_test', title: 'Move', objectives: [objective('use_move', 'Pummel')] },
	loss_test: { id: 'loss_test', title: 'Loss', objectives: [objective('battle_loss', 'blotling')] }
};

for (const questId of Object.keys(state.db.quests)) {
	assert(Quests.accept(state, questId), `Could not accept ${questId}.`);
}

const updates = [];
const sendUIUpdate = payload => updates.push(payload);
const sendToast = () => {};
const originalRandom = Math.random;
Math.random = () => 0;

try {
	assert(Combat.initiate(state, [{ id: 'blotling', level: 3 }], { type: 'wild' }, sendUIUpdate), 'Capture battle did not start.');
	state.battle.opponent.currentHp = 1;
	assert(useBattleItem(state, 'echo_seal', sendUIUpdate), 'Recruitment item could not be used.');
	assert(state.battle.captured, 'The weakened Blotling was not recruited.');
	finishBattle(state, true, sendUIUpdate, sendToast);
	assert(Quests.getStatus(state, 'capture_only') === 'ready', 'Recruitment objective did not progress.');
	assert(Quests.getStatus(state, 'defeat_only') === 'in_progress', 'Recruitment incorrectly counted as defeat.');

	assert(Combat.initiate(state, [{ id: 'lexicon_tyrant', level: 25 }], { type: 'wild', onceFlag: 'lexicon_tyrant' }, sendUIUpdate), 'Boss battle did not start.');
	const maxHp = state.battle.opponent.maxHp;
	for (const ratio of [0.79, 0.54, 0.29]) {
		state.battle.opponent.currentHp = Math.floor(maxHp * ratio);
		emitHealthThresholds(state);
	}
	assert(Quests.getStatus(state, 'phase_test') === 'ready', 'Three classification seal phases were not counted exactly.');
	state.battle.opponent.currentHp = 0;
	state.battle.winner = 'player';
	finishBattle(state, true, sendUIUpdate, sendToast);
	assert(Quests.getStatus(state, 'boss_test') === 'ready', 'Boss victory objective did not progress.');
	assert(state.player.worldChanges.defeatedBosses.lexicon_tyrant, 'Boss defeat did not persist.');

	assert(Combat.initiate(state, [{ id: 'blotling', level: 3 }], { type: 'wild' }, sendUIUpdate), 'Move battle did not start.');
	executeTurn(state, 'Pummel', false, sendUIUpdate);
	assert(Quests.getStatus(state, 'move_test') === 'ready', 'Move use objective did not progress.');
	state.battle.winner = 'opponent';
	finishBattle(state, false, sendUIUpdate, sendToast);
	assert(Quests.getStatus(state, 'loss_test') === 'ready', 'Battle loss objective did not progress.');
	assert(state.currentMapId === 'malkuth_village', 'Loss recovery did not return to Malkuth Village.');
} finally {
	Math.random = originalRandom;
}

console.log(JSON.stringify({
	ok: true,
	checks: 15,
	teamSize: state.player.team.length,
	storageSize: state.player.storage.length,
	bossDefeated: state.player.worldChanges.defeatedBosses.lexicon_tyrant,
	uiUpdates: updates.length
}, null, 2));
