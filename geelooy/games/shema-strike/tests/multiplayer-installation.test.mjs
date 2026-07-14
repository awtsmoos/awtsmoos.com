//B"H
// Boruch Hashem
// Blessed is He
/**
 * Installation tests prove online play remains an optional decorator. The
 * Awtsmoos renews campaign and arena; Awtsmoos.com verifies every inactive frame
 * still reaches the original update and render methods without a socket need.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { installMultiplayer } from "../js/multiplayer/installMultiplayer.js";
import { MESSAGE_TYPES } from "../js/multiplayer/protocol.js";

function fakeInput() {
	return {
		began: 0,
		cleared: 0,
		axis: () => 0,
		beginFrame() {
			this.began += 1;
		},
		clear() {
			this.cleared += 1;
		},
		clearPressed() {},
		consume: () => false
	};
}

function fakeView() {
	return {
		actions: null,
		bind(actions) {
			this.actions = actions;
		},
		hide() {},
		hideArena() {},
		renderArena() {},
		setStatus() {},
		show() {},
		showArena() {}
	};
}

function fakeSocket() {
	return {
		listeners: [],
		requests: [],
		sends: [],
		onEvent(listener) {
			this.listeners.push(listener);
		},
		request(type, payload) {
			this.requests.push({ payload, type });
			if (type === MESSAGE_TYPES.CREATE) {
				return Promise.resolve({
					payload: {
						arena: { joinCode: "ABC234", state: { fighters: [] } },
						playerId: "player-1"
					}
				});
			}
			return Promise.resolve({ payload: { left: true } });
		},
		send(type, payload) {
			this.sends.push({ payload, type });
			return Promise.resolve();
		}
	};
}

function fakeGame() {
	return {
		input: fakeInput(),
		originalRenders: 0,
		originalUpdates: 0,
		renderer: {},
		state: "menu",
		ui: {
			hideOverlays() {},
			hud: { show() {} },
			showMenu() {}
		},
		update() {
			this.originalUpdates += 1;
		},
		render() {
			this.originalRenders += 1;
		}
	};
}

test("delegates every non-online frame to the original campaign methods", () => {
	const game = fakeGame();
	installMultiplayer(game, { socket: fakeSocket(), view: fakeView() });

	game.update(1 / 60);
	game.render(0.5);
	assert.equal(game.originalUpdates, 1);
	assert.equal(game.originalRenders, 1);
	assert.ok(game.multiplayer);
});

test("enters and leaves online state without invoking campaign persistence", async () => {
	const game = fakeGame();
	const socket = fakeSocket();
	const controller = installMultiplayer(game, { socket, view: fakeView() });

	await controller.create("Player");
	assert.equal(game.state, "online");
	game.update(0.1);
	assert.equal(socket.sends.at(-1).type, MESSAGE_TYPES.INPUT);
	assert.equal(game.originalUpdates, 0);
	await controller.leave();
	assert.equal(game.state, "menu");
	assert.equal(socket.requests.at(-1).type, MESSAGE_TYPES.LEAVE);
});
