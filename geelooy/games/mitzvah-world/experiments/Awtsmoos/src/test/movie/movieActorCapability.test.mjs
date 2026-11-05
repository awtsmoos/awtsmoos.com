// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import {
	MovieActorDirector,
	movieNpcCapability
} from '../../movie/MovieActorDirector.js';
import {
	movieCameraEndpointTarget,
	moviePlayerEye
} from '../../movie/MovieCameraTarget.js';

function vector() {
	return {
		x: 0,
		y: 0,
		z: 0,
		set(x, y, z) {
			this.x = x;
			this.y = y;
			this.z = z;
		}
	};
}

function runtimeWithoutNpc() {
	return {
		clips: { idle: 'idle' },
		footOffset: 0.25,
		groundSampler: {
			terrainHeightAt: () => 2
		},
		model: {
			position: vector(),
			quaternion: vector()
		},
		player: {
			names: ['idle']
		},
		state: {
			faceHeight: 1.65,
			facing: 0,
			renderY: 2.25,
			x: 0,
			y: 2.25,
			z: 0
		},
		terrain: { stats: {} }
	};
}

function actorState(target, at = { x: 4, z: 6 }) {
	return {
		clip: {
			action: 'move',
			animation: 'idle',
			at
		},
		eased: 1,
		progress: 1,
		track: { target }
	};
}

const playerOnlyRuntime = runtimeWithoutNpc();
assert.equal(movieNpcCapability(playerOnlyRuntime), null);
const playerOnlyDirector = new MovieActorDirector(playerOnlyRuntime);
assert.doesNotThrow(() => {
	playerOnlyDirector.apply([
		actorState('player'),
		actorState('npc')
	], 1 / 60);
});
assert.equal(playerOnlyRuntime.state.x, 4);
assert.equal(playerOnlyRuntime.state.z, 6);
assert.equal(playerOnlyRuntime.state.y, 2.25);
assert.deepEqual(
	movieCameraEndpointTarget(playerOnlyRuntime, { targetActor: 'npc' }),
	moviePlayerEye(playerOnlyRuntime)
);

const npcRuntime = runtimeWithoutNpc();
npcRuntime.npc = {
	x: 1,
	z: 1,
	model: {
		position: vector(),
		quaternion: vector()
	},
	player: {
		names: ['idle']
	}
};
npcRuntime.npc.model.position.y = 2;
assert.equal(movieNpcCapability(npcRuntime), npcRuntime.npc);
const npcDirector = new MovieActorDirector(npcRuntime);
assert.equal(npcDirector.applyNpc(actorState('npc', { x: 8, z: 9 })), true);
assert.equal(npcRuntime.npc.x, 8);
assert.equal(npcRuntime.npc.z, 9);

console.log('movie actors and cameras degrade safely without an NPC singleton');
