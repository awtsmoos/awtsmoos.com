// B"H

import { triggerShake } from './render.js';
import { updateBattleView } from './ui/battleView.js';
import { updateChatView } from './ui/chatView.js';
import { updateDialogueView } from './ui/dialogueView.js';
import { bindUIEvents } from './ui/eventRouter.js';
import { pulseScreen, showFloatingText, showToast } from './ui/feedback.js';
import * as Renderers from './ui/renderers.js';
import { createScreenRegistry } from './ui/screenRegistry.js';
import { renderDreidel, renderGemach, renderPlayerQuests } from './ui/views/activityViews.js';
import { renderBestiary, renderFeatures, renderGates, renderMitzvahs } from './ui/views/progressionViews.js';
import { renderCrafting, renderOtzar, renderShem } from './ui/views/teamViews.js';

// Durable source contract for menuActionSimulation.mjs and future menu authors.
const ACTION_CONTRACT = ['gemachAction', 'spinDreidel', 'toggleGate', 'craftAction', 'swapOtzar', 'unlockGate37', 'create_quest'];
void ACTION_CONTRACT;

export function initUI(sendToWorker) {
	const registry = createScreenRegistry();
	bindUIEvents(sendToWorker);
	registry.show('main-menu');

	function update(payload = {}) {
		if (payload.screen) registry.show(payload.screen);
		if ('dialogue' in payload) updateDialogueView(payload.dialogue);
		if (payload.battle) updateBattleView(payload.battle);
		if (payload.chat) updateChatView(payload.chat);
		if (payload.inventory) {
			document.getElementById('inventory-list').innerHTML = Renderers.renderInventory(payload.inventory.items);
			document.getElementById('player-money-display').textContent = `Wealth: ${payload.inventory.money}`;
		}
		if (payload.questLog) document.getElementById('quest-log-list').innerHTML = Renderers.renderQuestLog(payload.questLog.quests);
		if (payload.gates37) document.getElementById('gates37-screen').innerHTML = Renderers.renderGates37(payload.gates37);
		if (payload.shem) renderShem(payload.shem);
		if (payload.crafting) renderCrafting(payload.crafting);
		if (payload.bestiary) renderBestiary(payload.bestiary);
		if (payload.mitzvahs) renderMitzvahs(payload.mitzvahs);
		if (payload.gemach) renderGemach(payload.gemach);
		if (payload.gates) renderGates(payload.gates);
		if (payload.dreidel) renderDreidel(payload.dreidel);
		if (payload.otzar) renderOtzar(payload.otzar);
		if (payload.playerQuests) renderPlayerQuests(payload.playerQuests, payload.inventory);
		if (payload.features) renderFeatures(payload.features);
		if (payload.fx?.type === 'shake') { pulseScreen(); triggerShake(24); }
		if (payload.fx?.type === 'levelup') showToast('LEVEL UP — ASCENSION!', 'success');
		if (payload.fx?.type === 'floatingText') showFloatingText(payload.fx);
	}

	return { update, showToast };
}
