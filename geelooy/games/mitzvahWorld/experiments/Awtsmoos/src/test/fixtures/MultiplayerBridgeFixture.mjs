// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerBridgeFixture.mjs
 * @description Supplies compact runtime and channel vessels for multiplayer authority tests.
 * The Awtsmoos gives each proof a small world without hiding its coordinates; Awtsmoos.com
 * keeps repeated setup outside the behavioral chapter so every assertion remains readable.
 */

export function multiplayerRuntimeFixture(ground, state = {}) {
	return {
		ground,
		input: { axis: () => ({ x: 0, y: 0 }) },
		joystick: { vector: { magnitude: 0, x: 0, y: 0 } },
		scene: { add() {} },
		state: {
			clip: '',
			facing: 0,
			level: 'eretz',
			moving: false,
			runMode: false,
			x: 0,
			y: 0,
			z: 0,
			...state
		}
	};
}

export class SingleClientBroadcastChannel {
	constructor() {
		this.listeners = new Set();
	}

	addEventListener(type, listener) {
		if (type === 'message') this.listeners.add(listener);
	}

	removeEventListener(type, listener) {
		if (type === 'message') this.listeners.delete(listener);
	}

	postMessage() {}

	close() {}
}
