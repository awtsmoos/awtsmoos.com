// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarInputController.js
 * @description Composes bounded activation, drag, inspection, and listener vessels.
 * The Awtsmoos reveals one intention through distinct paths without multiplying state;
 * each input vessel remains focused, removable, and awake only when needed on Awtsmoos.com.
 */

import { ActionBarActivationInput } from './ActionBarActivationInput.js';
import { ActionBarInputListenerRegistry } from './ActionBarInputListenerRegistry.js';
import { ActionBarLongPressController } from './ActionBarLongPressController.js';
import { ActionBarPointerDragInput } from './ActionBarPointerDragInput.js';

export class ActionBarInputController {
	constructor(options) {
		this.root = options.root;
		this.runtime = options.runtime;
		this.onInspect = options.onInspect || (() => {});
		this.onInspectEnd = options.onInspectEnd || (() => {});
		this.longPress = new ActionBarLongPressController({
			...options.longPressOptions,
			onInspect: this.onInspect,
			onInspectEnd: this.onInspectEnd
		});
		this.activation = new ActionBarActivationInput({
			consumeLongPressClick: slotIndex => this.longPress.consumeClick(slotIndex),
			getSlot: target => this.slot(target),
			runtime: this.runtime
		});
		this.dragInput = new ActionBarPointerDragInput({
			getSlot: target => this.slot(target),
			onResult: options.onResult,
			root: this.root,
			runtime: this.runtime
		});
		this.listeners = new ActionBarInputListenerRegistry(
			this.root,
			options.document || document,
			this.createHandlers()
		);
	}

	createHandlers() {
		return {
			click: event => this.activation.click(event),
			dragend: event => this.dragInput.end(event),
			dragover: event => this.dragInput.over(event),
			dragstart: event => this.dragInput.start(event),
			drop: event => this.dragInput.drop(event),
			focusin: event => this.inspect(event),
			focusout: event => this.inspectEnd(event),
			keydown: event => this.activation.keydown(event),
			pointercancel: event => this.longPress.end(event),
			pointerdown: event => this.pointerDown(event),
			pointermove: event => this.longPress.move(event),
			pointerout: event => this.inspectEnd(event),
			pointerover: event => this.inspect(event),
			pointerup: event => this.longPress.end(event)
		};
	}

	activateGamepad(buttonIndex, secondRow = false) {
		return this.activation.activateGamepad(buttonIndex, secondRow);
	}

	pointerDown(event) {
		const slot = this.slot(event.target);
		if (!slot?.dataset.abilityId) return false;
		return this.longPress.begin(event, Number(slot.dataset.slotIndex), slot);
	}

	inspect(event) {
		if (this.touchPointer(event)) return;
		const slot = this.slot(event.target);
		if (slot) this.onInspect(Number(slot.dataset.slotIndex), slot);
	}

	inspectEnd(event) {
		const slot = this.slot(event.target);
		const nextSlot = this.slot(event.relatedTarget);
		if (!slot || slot === nextSlot) return;
		if (this.touchPointer(event)) this.longPress.cancel(true);
		else this.onInspectEnd();
	}

	touchPointer(event) {
		return event.pointerType === 'touch' || event.pointerType === 'pen';
	}

	slot(target) {
		return target?.closest?.('.Mitzvah-action-slot') || null;
	}

	snapshot() {
		return {
			listeners: this.listeners.snapshot(),
			longPress: this.longPress.snapshot(),
			rows: this.runtime.store.snapshot().rows
		};
	}

	destroy() {
		this.listeners.destroy();
		this.longPress.destroy();
	}
}
