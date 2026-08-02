// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGamepadRuntime.js
 * @description Polls present controllers every frame and absent controllers through bounded discovery.
 * The Awtsmoos gives connection and release no independent existence; Awtsmoos.com keeps
 * full-rate axes, exact button edges, quiet disconnect, diagnostics, and teardown explicit.
 */

import {
	EMPTY_MINIMAL_MEADOW_GAMEPAD_AXES,
	mergeMinimalMeadowGamepadAxes,
	minimalMeadowGamepadAxes
} from './MinimalMeadowGamepadAxes.js';
import {
	minimalMeadowGamepadButtonPressed,
	routeMinimalMeadowGamepadButton
} from './MinimalMeadowGamepadButtons.js';
import {
	MINIMAL_MEADOW_GAMEPAD_DISCOVERY_INTERVAL_SECONDS,
	resolveMinimalMeadowGamepad
} from './MinimalMeadowGamepadDiscovery.js';

export class MinimalMeadowGamepadRuntime {
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.environment = environment;
		this.activeIndex = null;
		this.activeId = null;
		this.axes = EMPTY_MINIMAL_MEADOW_GAMEPAD_AXES;
		this.previousButtons = [];
		this.discoveryRemaining = 0;
		this.originalAxis = runtime.input?.axis;
		this.wrappedAxis = (...args) => mergeMinimalMeadowGamepadAxes(
			this.originalAxis?.apply(runtime.input, args) || {},
			this.axes
		);
		if (runtime.input) runtime.input.axis = this.wrappedAxis;
		this.onConnected = event => this.connect(event.gamepad);
		this.onDisconnected = event => this.disconnect(event.gamepad);
		environment.addEventListener?.('gamepadconnected', this.onConnected);
		environment.addEventListener?.('gamepaddisconnected', this.onDisconnected);
	}

	update(deltaSeconds = 1 / 60, returnSnapshot = true) {
		const gamepad = resolveMinimalMeadowGamepad(this, deltaSeconds);
		if (!gamepad) {
			if (this.activeIndex !== null) this.clear(true);
			return returnSnapshot ? this.snapshot() : null;
		}
		if (this.activeIndex !== gamepad.index) this.connect(gamepad);
		this.axes = minimalMeadowGamepadAxes(gamepad);
		this.routeButtons(gamepad.buttons || []);
		return returnSnapshot ? this.snapshot(gamepad) : null;
	}

	connect(gamepad) {
		if (!gamepad) return false;
		this.activeIndex = gamepad.index;
		this.activeId = gamepad.id || 'Gamepad';
		this.discoveryRemaining = MINIMAL_MEADOW_GAMEPAD_DISCOVERY_INTERVAL_SECONDS;
		this.previousButtons.length = 0;
		this.runtime.bus?.emit?.('controller:changed', {
			connected: true,
			id: this.activeId,
			index: gamepad.index
		});
		return true;
	}

	disconnect(gamepad) {
		if (gamepad && gamepad.index !== this.activeIndex) return false;
		return this.clear(true);
	}

	routeButtons(buttons) {
		for (let index = 0; index < buttons.length; index += 1) {
			const pressed = minimalMeadowGamepadButtonPressed(buttons[index]);
			if (pressed && !this.previousButtons[index]) {
				routeMinimalMeadowGamepadButton(this.runtime, index);
			}
			this.previousButtons[index] = pressed;
		}
	}

	clear(announce = false) {
		const wasConnected = this.activeIndex !== null;
		this.activeIndex = null;
		this.activeId = null;
		this.axes = EMPTY_MINIMAL_MEADOW_GAMEPAD_AXES;
		this.previousButtons.length = 0;
		if (announce && wasConnected) {
			this.runtime.bus?.emit?.('controller:changed', { connected: false });
		}
		return this.snapshot();
	}

	snapshot(gamepad = null) {
		return Object.freeze({
			axes: this.axes,
			connected: this.activeIndex !== null,
			id: gamepad?.id || this.activeId,
			index: this.activeIndex
		});
	}

	destroy() {
		this.environment.removeEventListener?.('gamepadconnected', this.onConnected);
		this.environment.removeEventListener?.('gamepaddisconnected', this.onDisconnected);
		if (this.runtime.input?.axis === this.wrappedAxis) {
			this.runtime.input.axis = this.originalAxis;
		}
		this.clear(false);
	}
}
