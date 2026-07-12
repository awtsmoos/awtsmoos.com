/**
 * B"H
 * @module MobileControlEvents
 * @description Touch intents, panels, scene choices, shops, crafting, and party lead.
 */
import { State } from '../../binah/State.js';
import { advanceScene, chooseSceneChoice, sceneActive } from '../../story/SceneRuntime.js';
import { craftRecipe } from '../../yesod/crafting/CraftingRuntime.js';
import { buyItem, sellItem } from '../../yesod/economy/ShopRuntime.js';
import { setLeadMusag } from '../../yesod/party/PartyRuntime.js';
import { ensureIntents, HOLD_INTENTS, PULSE_FRAMES } from './MobileUiHelpers.js';

export class MobileControlEvents {
	static pulses = {};

	static bind(root) {
		root.querySelectorAll('[data-intent]').forEach(node => this.bindIntent(node));
		root.querySelectorAll('[data-action]').forEach(node => node.addEventListener('click', event => this.action(event, node.dataset.action)));
		root.querySelector('[data-ohr-panel]')?.addEventListener('click', event => this.panelClick(event));
		root.querySelector('[data-ohr-dialogue]')?.addEventListener('click', event => this.dialogueClick(event));
		window.addEventListener('blur', () => this.releaseAll());
		window.addEventListener('pagehide', () => this.releaseAll());
	}

	static bindIntent(node) {
		const intent = node.dataset.intent;
		if (!intent) return;
		['pointerup', 'pointerleave', 'pointercancel'].forEach(type => node.addEventListener(type, event => this.intentUp(event, node, intent)));
		node.addEventListener('pointerdown', event => this.intentDown(event, node, intent));
		node.addEventListener('click', event => this.intentClick(event, intent));
	}

	static intentDown(event, node, intent) {
		event.preventDefault();
		node.setPointerCapture?.(event.pointerId);
		if (State.isUiBlocking()) return this.releaseAll();
		ensureIntents()[intent] = 1;
		if (!HOLD_INTENTS.has(intent)) this.pulses[intent] = PULSE_FRAMES;
	}

	static intentUp(event, node, intent) {
		event.preventDefault();
		node.releasePointerCapture?.(event.pointerId);
		if (HOLD_INTENTS.has(intent)) ensureIntents()[intent] = 0;
		else this.pulses[intent] = Math.max(this.pulses[intent] || 0, PULSE_FRAMES);
	}

	static intentClick(event, intent) {
		if (!intent || HOLD_INTENTS.has(intent) || State.isUiBlocking()) return;
		event.preventDefault();
		this.pulses[intent] = Math.max(this.pulses[intent] || 0, PULSE_FRAMES);
		ensureIntents()[intent] = 1;
	}

	static action(event, action) {
		if (!action) return;
		event.preventDefault();
		State.openPanel(action);
		this.releaseAll();
	}

	static panelClick(event) {
		const buy = event.target?.closest?.('[data-shop-buy]');
		const sell = event.target?.closest?.('[data-shop-sell]');
		const craft = event.target?.closest?.('[data-craft-recipe]');
		const lead = event.target?.closest?.('[data-party-lead]');
		if (buy) buyItem(buy.dataset.shopBuy);
		if (sell) sellItem(sell.dataset.shopSell);
		if (craft) craftRecipe(craft.dataset.craftRecipe);
		if (lead) setLeadMusag(Number(lead.dataset.partyLead));
		if (event.target?.closest?.('[data-close-panel]')) State.openPanel(null);
	}

	static dialogueClick(event) {
		const choice = event.target?.closest?.('[data-scene-choice]');
		if (choice) return chooseSceneChoice(choice.dataset.sceneChoice);
		if (event.target?.closest?.('[data-dialogue-next]')) return sceneActive() ? advanceScene() : State.dialogueNext(1);
		if (event.target?.closest?.('[data-dialogue-back]')) State.dialogueNext(-1);
		if (event.target?.closest?.('[data-dialogue-close]')) State.closeDialogue(true);
		if (event.target?.closest?.('[data-dialogue-mission]')) { State.closeDialogue(false); State.openPanel('journal'); }
	}

	static tickPulses() {
		const intents = ensureIntents();
		if (State.isUiBlocking()) return this.releaseAll();
		Object.keys(this.pulses).forEach(intent => {
			if (this.pulses[intent] > 0) { intents[intent] = 1; this.pulses[intent] -= 1; }
			else { intents[intent] = 0; delete this.pulses[intent]; }
		});
	}

	static releaseAll() {
		const intents = ensureIntents();
		['U', 'D', 'L', 'R', 'A', 'B'].forEach(key => { intents[key] = 0; });
		this.pulses = {};
	}
}
