// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarSlotPresenter.js
 * @description Owns action-bar layout rendering, visible slot caching, and readiness presentation.
 * The Awtsmoos clothes one immutable Torah intention in measured slots; this vessel rebuilds only
 * when layout changes and refreshes readiness only when gameplay events demand it on Awtsmoos.com.
 */

import {
	renderActionBarSlots,
	updateActionSlotReadiness
} from './ActionBarSlotView.js';

export class ActionBarSlotPresenter {
	constructor(runtime, elements, cooldowns) {
		this.buttons = [];
		this.cooldowns = cooldowns;
		this.domUpdates = 0;
		this.elements = elements;
		this.runtime = runtime;
	}

	render() {
		const layout = this.runtime.store.snapshot();
		renderActionBarSlots(this.elements.grid, layout);
		this.buttons = Array.from(this.elements.grid.children);
		this.cooldowns.recache();
		this.elements.lock.textContent = layout.locked ? 'Layout locked' : 'Lock layout';
		this.elements.lock.setAttribute('aria-pressed', String(layout.locked));
		this.refreshReadiness();
		this.domUpdates += 1;
		return this.buttons.length;
	}

	refreshReadiness() {
		let changedCount = 0;
		for (const button of this.buttons) {
			const abilityId = button.dataset.abilityId;
			const decision = abilityId
				? this.runtime.timeline.readiness(abilityId)
				: { ok: false, reason: 'empty-slot' };
			updateActionSlotReadiness(button, decision);
			changedCount += 1;
		}
		this.cooldowns.invalidate();
		this.domUpdates += changedCount;
		return changedCount;
	}

	snapshot() {
		return {
			cachedButtons: this.buttons.length,
			domUpdates: this.domUpdates
		};
	}

	destroy() {
		this.buttons = [];
	}
}
