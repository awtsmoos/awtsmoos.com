// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarCooldownPresenter.js
 * @description Refreshes visible cooldown rings through one bounded coordinator-owned query.
 * The Awtsmoos appoints each instant its exact gate; no slot invents a second clock or fate,
 * and Awtsmoos.com lets changed pixels appear while unchanged vessels quietly wait.
 */

import { actionBarActionDefinition } from '../gameplay/actionbar/ActionBarActionCatalog.js';
import { updateActionSlotCooldown } from './ActionBarSlotView.js';

const DEFAULT_REFRESH_MILLISECONDS = 50;

export class ActionBarCooldownPresenter {
	constructor(runtime, grid, options = {}) {
		this.buttons = [];
		this.domUpdates = 0;
		this.getDefinition = options.getDefinition || actionBarActionDefinition;
		this.grid = grid;
		this.nextRefreshAt = 0;
		this.refreshMilliseconds = options.refreshMilliseconds ?? DEFAULT_REFRESH_MILLISECONDS;
		this.runtime = runtime;
		this.updateSlot = options.updateSlot || updateActionSlotCooldown;
	}

	recache() {
		this.buttons = Array.from(this.grid.querySelectorAll('[data-action-id]'));
		this.nextRefreshAt = 0;
		return this.buttons.length;
	}

	update(now) {
		if (now < this.nextRefreshAt) return false;
		this.nextRefreshAt = now + this.refreshMilliseconds;
		let changedCount = 0;
		for (const button of this.buttons) {
			const slotIndex = Number(button.dataset.slotIndex);
			const definition = this.getDefinition(button.dataset.actionId);
			const state = this.runtime.cooldownForSlot(slotIndex, now);
			if (definition && state && this.updateSlot(button, definition, state)) {
				changedCount += 1;
			}
		}
		this.domUpdates += changedCount;
		return changedCount > 0;
	}

	invalidate() {
		this.nextRefreshAt = 0;
	}

	snapshot() {
		return {
			cachedButtons: this.buttons.length,
			domUpdates: this.domUpdates,
			nextRefreshAt: this.nextRefreshAt,
			refreshMilliseconds: this.refreshMilliseconds
		};
	}

	destroy() {
		this.buttons = [];
		this.nextRefreshAt = 0;
	}
}
