// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatBar.js
 * @description Routes defeat-aware combat intent while the Bag modal suspends all activation.
 * The Awtsmoos joins hand and key without letting intention escape its proper season;
 * Awtsmoos.com preserves the inherited defeat boundary and closes combat during Bag contemplation.
 */

import { minimalMeadowCombatActionList } from '../app/MinimalMeadowCombatActions.js';
import { MinimalMeadowPlayerDefeatCombatBarState } from '../app/MinimalMeadowPlayerDefeatCombatBarState.js';
import {
	handleDefeatedCombatKey,
	isCombatTextEntry
} from './MobileHudCompositionCombatInput.js';
import { isInventoryModalOpen } from './InventoryModalState.js';
import { createMinimalMeadowCombatBarView } from './MinimalMeadowCombatBarView.js';

export class MinimalMeadowCombatBar {
	constructor(host, bus, environment = globalThis) {
		this.host = host;
		this.bus = bus;
		this.environment = environment;
		this.actions = minimalMeadowCombatActionList();
		this.view = createMinimalMeadowCombatBarView(host);
		this.presentation = new MinimalMeadowPlayerDefeatCombatBarState(bus, this.view);
		this.onClick = event => this.handleClick(event);
		this.onKeyDown = event => this.handleKeyDown(event);
		this.view.root.addEventListener('click', this.onClick);
		environment.addEventListener?.('keydown', this.onKeyDown);
	}

	handleClick(event) {
		const button = event.target.closest('button');
		if (!button) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		if (this.modalOpen()) {
			return;
		}
		if (this.presentation.defeated) {
			this.presentation.status('Defeated · press Enter to return now');
			return;
		}
		if (button.disabled) {
			return;
		}
		if (button.dataset.actionId) {
			this.activate(button.dataset.actionId);
			return;
		}
		if (button.dataset.targetCycle) {
			this.bus.emit('target:cycle', {});
			return;
		}
		if (button.dataset.collapse) {
			this.toggleCollapsed(button);
		}
	}

	handleKeyDown(event) {
		if (event.repeat || isCombatTextEntry(event.target) || this.modalOpen()) {
			return;
		}
		if (this.presentation.defeated) {
			handleDefeatedCombatKey(event, this.bus);
			return;
		}
		const action = this.actions.find(candidate => candidate.keyCode === event.code);
		if (action) {
			event.preventDefault();
			this.activate(action.id);
			return;
		}
		if (event.code === 'Tab') {
			event.preventDefault();
			this.bus.emit('target:cycle', {});
		}
	}

	activate(actionId) {
		if (!this.modalOpen()) {
			this.bus.emit('combat:activate', { actionId, source: 'action-bar' });
		}
	}

	toggleCollapsed(button) {
		const collapsed = this.view.bar.dataset.collapsed !== 'true';
		this.view.bar.dataset.collapsed = String(collapsed);
		button.textContent = collapsed ? '+' : '−';
	}

	modalOpen() {
		return isInventoryModalOpen(this.host.ownerDocument);
	}

	diagnostics() {
		return {
			buttons: this.view.buttons.size,
			casting: this.presentation.casting?.actionId || null,
			cooldowns: { ...this.presentation.cooldowns },
			defeated: this.presentation.defeated,
			status: this.view.status.textContent
		};
	}

	destroy() {
		this.view.root.removeEventListener('click', this.onClick);
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
		this.presentation.destroy();
		this.host.replaceChildren();
	}
}
