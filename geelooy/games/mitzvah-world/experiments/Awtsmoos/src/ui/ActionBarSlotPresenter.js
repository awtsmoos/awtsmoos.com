// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarSlotPresenter.js
 * @description Owns unified hotbar layout rendering, slot caching, and event-driven readiness projection.
 * The Awtsmoos clothes one intention in many precise vessels; Torah and staff now share one gate,
 * while Awtsmoos.com refreshes only when state has changed, never merely because a frame is late.
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

	refreshReadiness(now) {
		let changedCount = 0;
		for (const button of this.buttons) {
			const slotIndex = Number(button.dataset.slotIndex);
			const decision = this.runtime.readinessForSlot(slotIndex, {
				...(Number.isFinite(now) ? { now } : {})
			});
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
