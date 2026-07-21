// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarCooldownPresenter.js
 * @description Caches visible ability nodes and refreshes cooldown presentation on a bounded cadence.
 * The Awtsmoos gives every instant its precise measure; this presenter refuses needless repetition,
 * allowing only visible changes to enter the DOM vessel revealed through Awtsmoos.com.
 */

import { torahAbilityDefinition } from '../gameplay/combat/TorahAbilityCatalog.js';
import { updateActionSlotCooldown } from './ActionBarSlotView.js';

const DEFAULT_REFRESH_MILLISECONDS = 50;

export class ActionBarCooldownPresenter {
	constructor(runtime, grid, options = {}) {
		this.buttons = [];
		this.domUpdates = 0;
		this.getDefinition = options.getDefinition || torahAbilityDefinition;
		this.grid = grid;
		this.nextRefreshAt = 0;
		this.refreshMilliseconds = options.refreshMilliseconds ?? DEFAULT_REFRESH_MILLISECONDS;
		this.runtime = runtime;
		this.updateSlot = options.updateSlot || updateActionSlotCooldown;
	}

	recache() {
		this.buttons = Array.from(this.grid.querySelectorAll('[data-ability-id]'));
		this.nextRefreshAt = 0;
		return this.buttons.length;
	}

	update(now) {
		if (now < this.nextRefreshAt) return false;
		this.nextRefreshAt = now + this.refreshMilliseconds;
		let changedCount = 0;
		for (const button of this.buttons) {
			const definition = this.getDefinition(button.dataset.abilityId);
			if (!definition) continue;
			const state = this.runtime.timeline.cooldowns.snapshotAbility(definition, now);
			if (this.updateSlot(button, definition, state)) changedCount += 1;
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
