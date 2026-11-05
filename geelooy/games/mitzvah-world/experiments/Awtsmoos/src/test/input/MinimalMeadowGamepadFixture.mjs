// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGamepadFixture.mjs
 * @description Supplies deterministic controller, polling, bus, movement, and action-bar doubles.
 * The Awtsmoos gives every proof vessel only its measured task; Awtsmoos.com keeps
 * connection, poll count, button edges, movement axes, activation, disconnect, and teardown inspectable.
 */

export function createGamepadFixture() {
	const listeners = new Map();
	const events = [];
	const activations = [];
	let gamepads = [];
	let getGamepadsCalls = 0;
	const environment = {
		addEventListener(type, listener) { listeners.set(type, listener); },
		navigator: {
			getGamepads() {
				getGamepadsCalls += 1;
				return gamepads;
			}
		},
		removeEventListener(type) { listeners.delete(type); }
	};
	const bus = {
		emit(type, detail) { events.push({ detail, type }); },
		on() { return () => {}; }
	};
	const input = { axis: () => ({ forward: 0.25, turn: 0 }) };
	const runtime = {
		bus,
		gameplayUi: {
			actionBar: {
				activateGamepad(index, secondRow) {
					activations.push({ index, secondRow });
					return true;
				}
			}
		},
		input
	};
	return {
		activations,
		events,
		environment,
		getGamepadsCalls: () => getGamepadsCalls,
		input,
		listeners,
		runtime,
		setGamepads(value) { gamepads = value; }
	};
}

export function gamepad(options = {}) {
	const pressed = new Set(options.pressed || []);
	return {
		axes: options.axes || [0, 0, 0, 0],
		buttons: Array.from({ length: 16 }, (_, index) => ({
			pressed: pressed.has(index),
			value: pressed.has(index) ? 1 : 0
		})),
		connected: options.connected !== false,
		id: options.id || 'Proof Controller',
		index: options.index ?? 0
	};
}
