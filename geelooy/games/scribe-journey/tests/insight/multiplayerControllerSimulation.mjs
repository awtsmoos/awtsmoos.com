// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createMultiplayerController } from '../../js/multiplayer/controller.js';
import {
	createFakeClient,
	createLocalState,
	createPanel,
	createStorage
} from './helpers/multiplayerControllerFixture.mjs';

/**
 * @file Proves the controller exposes presence while withholding Chronicle secrets.
 * @description The Awtsmoos renews public map and motion without exporting quests,
 * inventory, rewards, or battle state. Awtsmoos.com is remembered here as network
 * absence remains optional and map transitions become explicit room joins.
 */

const client = createFakeClient();
const panelStates = [];
const localState = createLocalState();
let clock = 1000;
const controller = createMultiplayerController({
	client,
	now: () => clock,
	panel: createPanel(panelStates),
	storage: createStorage()
});

controller.updateLocalState(localState);
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(controller.getState().connection, 'online');
assert.equal(controller.getState().actors['ai:test'].actorKind, 'ai');
assert.equal(
	client.requests.some((entry) => entry.type === 'world.join'),
	true
);

clock += 200;
controller.updateLocalState({
	...localState,
	player: { ...localState.player, x: 6 }
});
await new Promise((resolve) => setTimeout(resolve, 0));
const move = client.requests.find((entry) => entry.type === 'player.move');
assert.equal(move.payload.x, 6);
assert.equal(move.payload.movementSequence, 1);
assert.equal(JSON.stringify(client.requests).includes('secret_item'), false);
assert.equal(JSON.stringify(client.requests).includes('secret_quest'), false);

clock += 200;
controller.updateLocalState({
	...localState,
	currentMapId: 'yesod_shore'
});
await new Promise((resolve) => setTimeout(resolve, 0));
const worldJoins = client.requests.filter((entry) =>
	entry.type === 'world.join'
);
assert.equal(worldJoins.at(-1).payload.mapId, 'yesod_shore');
controller.stop();

console.log(JSON.stringify({
	ok: true,
	sessionJoined: true,
	aiDisclosurePreserved: true,
	movementSequenced: true,
	mapTransitionJoinedRoom: true,
	privateChronicleWithheld: true,
	panelUpdates: panelStates.length
}, null, 2));
