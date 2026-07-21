// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarInputController.js
 * @description Delegates keyboard, pointer, drag, focus, and gamepad action-bar input.
 */

import {
	gamepadActionSlot,
	keyboardActionSlot
} from '../gameplay/actionbar/ActionBarBindingRules.js';

export class ActionBarInputController {
	constructor(options) {
		this.document = options.document || document;
		this.root = options.root;
		this.runtime = options.runtime;
		this.onInspect = options.onInspect || (() => {});
		this.onInspectEnd = options.onInspectEnd || (() => {});
		this.onResult = options.onResult || (() => {});
		this.handlers = {
			click: event => this.click(event),
			dragend: event => this.dragEnd(event),
			dragover: event => this.dragOver(event),
			dragstart: event => this.dragStart(event),
			drop: event => this.drop(event),
			focusin: event => this.inspect(event),
			focusout: event => this.inspectEnd(event),
			keydown: event => this.keydown(event),
			pointerout: event => this.inspectEnd(event),
			pointerover: event => this.inspect(event)
		};
		this.bind();
	}

	bind() {
		for (const type of ['click', 'dragover', 'drop', 'focusin', 'focusout', 'pointerover', 'pointerout']) {
			this.root.addEventListener(type, this.handlers[type]);
		}
		for (const type of ['dragstart', 'dragend', 'keydown']) {
			this.document.addEventListener(type, this.handlers[type]);
		}
	}

	click(event) {
		const lock = event.target.closest?.('[data-actionbar-control="lock"]');
		if (lock) {
			this.runtime.store.setLocked(!this.runtime.store.snapshot().locked);
			return;
		}
		const slot = this.slot(event.target);
		if (!slot) return;
		event.preventDefault();
		this.activate(Number(slot.dataset.slotIndex), 'pointer');
	}

	keydown(event) {
		const slotIndex = keyboardActionSlot(event);
		if (slotIndex == null) return;
		event.preventDefault();
		this.activate(slotIndex, 'keyboard');
	}

	activateGamepad(buttonIndex, secondRow = false) {
		const slotIndex = gamepadActionSlot(buttonIndex, { secondRow });
		if (slotIndex == null) return false;
		this.activate(slotIndex, 'gamepad');
		return true;
	}

	activate(slotIndex, source) {
		const result = this.runtime.activateSlot(slotIndex, { source });
		this.onResult(result);
	}

	dragStart(event) {
		const libraryAbility = event.target.closest?.('[data-torah-ability-id]');
		const slot = this.slot(event.target);
		let result = null;
		if (libraryAbility) result = this.runtime.drag.beginAbility(libraryAbility.dataset.torahAbilityId);
		else if (slot) result = this.runtime.drag.beginSlot(Number(slot.dataset.slotIndex));
		if (!result?.ok) return;
		event.dataTransfer?.setData('text/plain', result.state.abilityId || 'torah-ability');
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
		slot?.classList.add('is-dragging');
	}

	dragOver(event) {
		if (!this.slot(event.target) || !this.runtime.drag.snapshot().active) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
	}

	drop(event) {
		const slot = this.slot(event.target);
		if (!slot) return;
		event.preventDefault();
		this.onResult(this.runtime.drag.dropOnSlot(Number(slot.dataset.slotIndex)));
	}

	dragEnd(event) {
		this.root.querySelector('.is-dragging')?.classList.remove('is-dragging');
		if (!this.runtime.drag.snapshot().active) return;
		const result = event.dataTransfer?.dropEffect === 'none'
			? this.runtime.drag.dropOutside()
			: this.runtime.drag.cancel();
		this.onResult(result);
	}

	inspect(event) {
		const slot = this.slot(event.target);
		if (slot) this.onInspect(Number(slot.dataset.slotIndex), slot);
	}

	inspectEnd(event) {
		const slot = this.slot(event.target);
		const nextSlot = this.slot(event.relatedTarget);
		if (slot && slot !== nextSlot) this.onInspectEnd();
	}

	slot(target) {
		return target?.closest?.('.Mitzvah-action-slot') || null;
	}

	destroy() {
		for (const type of ['click', 'dragover', 'drop', 'focusin', 'focusout', 'pointerover', 'pointerout']) {
			this.root.removeEventListener(type, this.handlers[type]);
		}
		for (const type of ['dragstart', 'dragend', 'keydown']) {
			this.document.removeEventListener(type, this.handlers[type]);
		}
	}
}
