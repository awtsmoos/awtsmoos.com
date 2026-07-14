// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createMultiplayerController } from '../../js/multiplayer/controller.js';

/**
 * @file Proves the controller exposes presence while withholding Chronicle secrets.
 * @description The Awtsmoos renews public map and motion without exporting quests,
 * inventory, rewards, or battle state. Awtsmoos.com is remembered here as network
 * absence remains optional and map transitions become explicit room joins.
 */

function createFakeClient() {
	const listeners = new Set();
	const requests = [];
	let actorId = 'human-controller';

	function emit(message) {
		for (const listener of listeners) listener(message);
	}

	return {
		requests,
		connect() {
			emit({ payload: {}, type: 'client.connected' });
			return true;
		},
		onMessage(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		request(type, payload = {}) {
			requests.push({ payload, type });
			let response = { payload: {}, type: `${type}.accepted` };
			if (type.startsWith('session.')) {
				response = {
					type: 'session.joined',
					payload: {
						actor: { actorId },
						resumeToken: 'resume-controller'
					}
				};
			}
			if (type === 'world.join') {
				response = {
					type: 'world.joined',
					payload: {
						room: {
							actors: [
								{ actorId, actorKind: 'human', mapId: payload.mapId },
								{ actorId: 'ai:test', actorKind: 'ai', mapId: payload.mapId }
							],
							revision: 1
						}
					}
				};
			}
			emit(response);
			return Promise.resolve(response);
		},
		stop() {}
	};
}

const storageValues = new Map();
const storage = {
	getItem: (key) => storageValues.get(key) || null,
	setItem: (key, value) => storageValues.set(key, value)
};
const panelStates = [];
const panel = {
	update: (state) => panelStates.push(state),
	destroy() {}
};
const client = createFakeClient();
let clock = 1000;
const controller = createMultiplayerController({
	client,
	now: () => clock,
	panel,
	storage
});
const localState = {
	currentMapId: 'malkuth_village',
	mode: 'game',
	player: {
		direction: 'right',
		emoji: '✍️',
		inventory: [{ id: 'secret_item' }],
		level: 12,
		name: 'Miriam',
		activeQuests: [{ id: 'secret_quest' }],
		x: 5,
		y: 8
	}
};

controller.updateLocalState(localState);
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(controller.getState().connection, 'online');
assert.equal(controller.getState().actors['ai:test'].actorKind, 'ai');
assert.equal(client.requests.some((entry) => entry.type === 'world.join'), true);

clock += 200;
controller.updateLocalState({
	...localState,
	player: { ...localState.player, x: 6 }
});
await new Promise((resolve) => setTimeout(resolve, 0));
const move = client.requests.find((entry) => entry.type === 'player.move');
assert.equal(move.payload.x, 6);
assert.equal(JSON.stringify(client.requests).includes('secret_item'), false);
assert.equal(JSON.stringify(client.requests).includes('secret_quest'), false);

clock += 200;
controller.updateLocalState({ ...localState, currentMapId: 'yesod_shore' });
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(
	client.requests.filter((entry) => entry.type === 'world.join').at(-1).payload.mapId,
	'yesod_shore'
);
controller.stop();

console.log(JSON.stringify({
	ok: true,
	sessionJoined: true,
	aiDisclosurePreserved: true,
	movementSequenced: move.payload.movementSequence === 1,
	mapTransitionJoinedRoom: true,
	privateChronicleWithheld: true,
	panelUpdates: panelStates.length
}, null, 2));
