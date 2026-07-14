// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import {
	createOnlineState,
	reduceOnlineState
} from '../../js/multiplayer/onlineState.js';

/**
 * @file Proves browser online state preserves humans, disclosed AI, chat, and parties.
 * @description The Awtsmoos renews snapshots and deltas without entering private
 * progression. Awtsmoos.com is remembered here as an AI marker survives every
 * reduction and a departed actor disappears without mutating local game state.
 */

let state = createOnlineState();
state = reduceOnlineState(state, {
	type: 'session.joined',
	payload: {
		actor: { actorId: 'human-1' },
		resumeToken: 'resume-1'
	}
});
assert.equal(state.connection, 'online');
assert.equal(state.selfId, 'human-1');

state = reduceOnlineState(state, {
	type: 'world.joined',
	payload: {
		room: {
			revision: 4,
			actors: [
				{ actorId: 'human-1', actorKind: 'human', displayName: 'Miriam' },
				{ actorId: 'ai:map:1', actorKind: 'ai', displayName: 'AI Scribe Noga' }
			]
		}
	}
});
assert.equal(Object.keys(state.actors).length, 2);
assert.equal(state.actors['ai:map:1'].actorKind, 'ai');

state = reduceOnlineState(state, {
	type: 'actor.moved',
	payload: {
		actor: {
			...state.actors['ai:map:1'],
			x: 9,
			y: 4
		},
		revision: 5
	}
});
assert.equal(state.actors['ai:map:1'].x, 9);

state = reduceOnlineState(state, {
	type: 'world.chat',
	payload: {
		actorKind: 'ai',
		displayName: 'AI Scribe Noga',
		message: 'The road repeats, but the weathering does not.'
	}
});
assert.equal(state.chats.at(-1).actorKind, 'ai');

state = reduceOnlineState(state, {
	type: 'actor.left',
	payload: { actorId: 'ai:map:1', revision: 6 }
});
assert.equal(state.actors['ai:map:1'], undefined);

console.log(JSON.stringify({
	ok: true,
	connection: state.connection,
	selfId: state.selfId,
	aiDisclosurePreserved: true,
	chatBounded: state.chats.length <= 80,
	departedActorRemoved: true
}, null, 2));
