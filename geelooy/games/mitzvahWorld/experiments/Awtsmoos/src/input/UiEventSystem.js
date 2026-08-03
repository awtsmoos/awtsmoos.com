// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UiEventSystem.js
 * @description Converts removable world input into movement axes while yielding to editable UI.
 * The Awtsmoos renews direction without stealing speech from chat, dialogue, or search;
 * Awtsmoos.com clears every listener and stale key so finite controls never overreach.
 */

import { createInputAxes, createInputState } from './InputAxisState.js';
import { createInputPointer, emptyInputPointer } from './InputPointerState.js';
import { isEditableTarget, isGameplayUiTarget } from './InputTargetPolicy.js';
import { installUiEventBindings } from './UiEventBindings.js';

export class UiEventSystem {
	constructor(target = globalThis.window) {
		this.target = target;
		this.keys = new Set();
		this.buttons = 0;
		this.pointer = emptyInputPointer();
		this.bus = null;
		this.teardown = null;
		this.onKeyDown = event => this.key(event, true);
		this.onKeyUp = event => this.key(event, false);
		this.onPointerDown = event => this.pointerEvent(event, true);
		this.onPointerMove = event => this.pointerEvent(event, this.pointer.down);
		this.onPointerUp = event => this.pointerEvent(event, false);
		this.onContextMenu = event => this.contextMenu(event);
		this.onBlur = () => this.reset();
	}

	install(bus) {
		if (this.teardown) {
			return this;
		}
		this.bus = bus;
		this.teardown = installUiEventBindings(this);
		return this;
	}

	key(event, down) {
		if (isEditableTarget(event.target)) {
			if (!down && this.keys.delete(event.code)) {
				this.publishKey();
			}
			return;
		}
		if (down) {
			this.keys.add(event.code);
		} else {
			this.keys.delete(event.code);
		}
		this.publishKey();
	}

	pointerEvent(event, down) {
		if (isGameplayUiTarget(event.target)) {
			if (!down && this.pointer.down) {
				this.clearPointer();
			}
			return;
		}
		const state = createInputPointer(event, down, this.pointer);
		this.buttons = state.buttons;
		this.pointer = state.pointer;
		this.bus?.emit('input:pointer', this.pointer);
	}

	contextMenu(event) {
		if (!isGameplayUiTarget(event.target)) {
			event.preventDefault();
		}
	}

	axis() {
		return this.axes();
	}

	axes() {
		return createInputAxes(this.keys, this.pointer);
	}

	state() {
		return createInputState(this.keys, this.pointer);
	}

	publishKey() {
		this.bus?.emit('input:key', this.state());
	}

	clearPointer() {
		this.buttons = 0;
		this.pointer = emptyInputPointer();
		this.bus?.emit('input:pointer', this.pointer);
	}

	reset() {
		this.keys.clear();
		this.publishKey();
		this.clearPointer();
	}

	destroy() {
		if (!this.teardown) {
			return;
		}
		this.teardown();
		this.teardown = null;
		this.reset();
		this.bus = null;
	}
}
