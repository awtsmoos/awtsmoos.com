// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarActivationInput.js
 * @description Resolves bounded click, keyboard, and gamepad activation into visible slots.
 * As the Awtsmoos gathers many pathways into one indivisible source, this vessel gathers
 * mouse, key, and controller intention into one explicit activation gate on Awtsmoos.com.
 */

import {
	gamepadActionSlot,
	keyboardActionSlot
} from '../gameplay/actionbar/ActionBarBindingRules.js';

export class ActionBarActivationInput {
	constructor(options) {
		this.consumeLongPressClick = options.consumeLongPressClick || (() => false);
		this.getSlot = options.getSlot;
		this.runtime = options.runtime;
	}

	click(event) {
		const lock = event.target?.closest?.('[data-actionbar-control="lock"]');
		if (lock) {
			this.toggleLock();
			return true;
		}
		const slot = this.getSlot(event.target);
		if (!slot) return false;
		const slotIndex = Number(slot.dataset.slotIndex);
		event.preventDefault();
		if (this.consumeLongPressClick(slotIndex)) return true;
		this.activate(slotIndex, 'pointer');
		return true;
	}

	keydown(event) {
		const secondRow = Boolean(event.shiftKey) && this.visibleRows() === 2;
		const slotIndex = keyboardActionSlot(event, { secondRow });
		if (slotIndex == null) return false;
		event.preventDefault();
		this.activate(slotIndex, 'keyboard');
		return true;
	}

	activateGamepad(buttonIndex, secondRow = false) {
		const visibleSecondRow = Boolean(secondRow) && this.visibleRows() === 2;
		const slotIndex = gamepadActionSlot(buttonIndex, { secondRow: visibleSecondRow });
		if (slotIndex == null) return false;
		this.activate(slotIndex, 'gamepad');
		return true;
	}

	activate(slotIndex, source) {
		return this.runtime.activateSlot(slotIndex, { source });
	}

	toggleLock() {
		const snapshot = this.runtime.store.snapshot();
		return this.runtime.store.setLocked(!snapshot.locked);
	}

	visibleRows() {
		return this.runtime.store.snapshot().rows;
	}
}
