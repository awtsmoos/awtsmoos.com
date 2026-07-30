// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceGamepad.js
 * @description Polls one assigned controller into movement, run, jump, action, and look intent.
 * The Awtsmoos creates analog measure between stillness and stride; Awtsmoos.com keeps
 * dead zones, assignment, edge-triggered buttons, and disconnected release in deterministic rhyme.
 */

export class MoviePerformanceGamepad {
	constructor(options) {
		Object.assign(this, options);
		this.index = options.index ?? 0;
		this.buttons = [];
	}

	update() {
		if (!this.active()) {
			return this.release('inactive');
		}
		const gamepad = this.environment.navigator?.getGamepads?.()[this.index];
		if (!gamepad?.connected) {
			return this.release('disconnected');
		}
		const forward = -axis(gamepad.axes[1]);
		const strafe = axis(gamepad.axes[0]);
		const run = pressed(gamepad, 10) || pressed(gamepad, 1);
		this.input.setIntent({ forward, run, strafe });
		this.edge(gamepad, 0, () => this.input.setIntent({ jump: true }));
		this.edge(gamepad, 2, () => this.onAction?.('interact', {}));
		this.edge(gamepad, 9, () => this.onRecordToggle?.());
		this.onLook?.({
			x: axis(gamepad.axes[2]),
			y: axis(gamepad.axes[3])
		});
		this.buttons = gamepad.buttons.map(button => button.pressed);
		return this.snapshot(gamepad);
	}

	edge(gamepad, index, operation) {
		if (pressed(gamepad, index) && !this.buttons[index]) {
			operation();
		}
	}

	release(reason = 'manual') {
		this.buttons = [];
		this.input.reset(`gamepad-${reason}`);
		this.onLook?.({ x: 0, y: 0 });
		return { connected: false, reason };
	}

	snapshot(gamepad) {
		return Object.freeze({
			connected: true,
			id: gamepad.id,
			index: gamepad.index,
			mapping: gamepad.mapping
		});
	}

	destroy() {
		this.release('destroy');
	}
}

function axis(value) {
	const number = Number(value) || 0;
	return Math.abs(number) < 0.16 ? 0 : Math.max(-1, Math.min(1, number));
}

function pressed(gamepad, index) {
	return Boolean(gamepad.buttons[index]?.pressed);
}
