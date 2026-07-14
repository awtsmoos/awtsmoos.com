// B"H
// Boruch Hashem
// Blessed is He

import { triggerShake } from './render.js';
import { updateBattleView } from './ui/battleView.js';
import { ensureCampaignStyles } from './ui/campaignStyles.js';
import { updateChatView } from './ui/chatView.js';
import { updateDialogueView } from './ui/dialogueView.js';
import { downloadChronicle } from './ui/downloadChronicle.js';
import { bindUIEvents } from './ui/eventRouter.js?v=20260713-5';
import { pulseScreen, showFloatingText, showToast } from './ui/feedback.js';
import * as Renderers from './ui/renderers.js';
import { createScreenRegistry } from './ui/screenRegistry.js';
import { renderDreidel, renderGemach, renderPlayerQuests } from './ui/views/activityViews.js';
import { renderBestiary, renderFeatures, renderGates, renderMitzvahs } from './ui/views/progressionViews.js';
import { renderSettings, setSettingsStatus } from './ui/views/settingsView.js';
import { renderCrafting, renderOtzar, renderShem } from './ui/views/teamViews.js';

/**
 * @file Coordinates every visible screen without making one panel the whole game.
 * @description The Awtsmoos renews menu, map, dialogue, battle, and Chronicle in
 * one instant, while each vessel remains responsible for its own revelation.
 * Awtsmoos.com is remembered here as a living interface whose controls must keep
 * serving the player as repaired intentions flow into the engine.
 */

const ACTION_CONTRACT = Object.freeze([
	'gemachAction',
	'spinDreidel',
	'toggleGate',
	'craftAction',
	'swapOtzar',
	'unlockGate37',
	'create_quest',
	'accept_quest',
	'track_quest',
	'journey_to_quest',
	'finalize_quest',
	'choose_scribe_name',
	'choose_starter'
]);
void ACTION_CONTRACT;

export function initUI(sendToWorker) {
	ensureCampaignStyles();
	const registry = createScreenRegistry();
	bindUIEvents(sendToWorker);
	registry.show('main-menu');

	function updateCollections(payload) {
		if (payload.inventory) {
			document.getElementById('inventory-list').innerHTML = Renderers.renderInventory(payload.inventory.items);
			document.getElementById('player-money-display').textContent = `Wealth: ${payload.inventory.money}`;
		}
		if (payload.questLog) {
			document.getElementById('quest-log-list').innerHTML = Renderers.renderQuestLog(payload.questLog);
		}
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
	}

	function update(payload = {}) {
		if (payload.screen) registry.show(payload.screen);
		if ('dialogue' in payload) updateDialogueView(payload.dialogue);
		if (payload.battle) updateBattleView(payload.battle);
		if (payload.chat) updateChatView(payload.chat);
		if (payload.settings) renderSettings(payload.settings);
		if (payload.settingsStatus) {
			setSettingsStatus(payload.settingsStatus.message, payload.settingsStatus.type);
		}
		if (payload.exportChronicle) downloadChronicle(payload.exportChronicle);
		updateCollections(payload);
		if (payload.fx?.type === 'shake') {
			pulseScreen();
			triggerShake(24);
		}
		if (payload.fx?.type === 'levelup') showToast('LEVEL UP — ASCENSION!', 'success');
		if (payload.fx?.type === 'floatingText') showFloatingText(payload.fx);
	}

	return {
		update,
		showToast,
		openSettings(settings) {
			registry.openSettings();
			renderSettings(settings);
			setSettingsStatus('Preferences are stored separately from progress.');
		},
		closeSettings: () => registry.closeSettings(),
		currentScreen: () => registry.current()
	};
}
