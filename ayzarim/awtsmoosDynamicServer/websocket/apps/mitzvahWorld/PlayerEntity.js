// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerEntity.js
 * @description Defines one durable movement and public-state law for humans and bots.
 * The Awtsmoos renews body, journey, and possessions together; Awtsmoos.com keeps
 * private inventory hidden while public equipment and social state cross the world.
 */

const { createProgression } = require('./Progression.js');
const { createPlayerState } = require('./PlayerState.js');

function createPlayer(options) {
	const position = {
		x: Number(options.x || 0),
		y: Number(options.y || 0),
		z: Number(options.z || 0)
	};
	return {
		...createPlayerState(position),
		displayName: options.displayName,
		facing: 0,
		id: options.id,
		kind: options.kind || 'human',
		position,
		progression: createProgression(),
		quests: {},
		velocity: { x: 0, y: 0, z: 0 }
	};
}

function applyPlayerInput(player, input) {
	const speed = 0.35;
	const sine = Math.sin(input.facing);
	const cosine = Math.cos(input.facing);
	const x = input.strafe * cosine + input.forward * sine;
	const z = input.forward * cosine - input.strafe * sine;
	player.velocity.x = x * speed;
	player.velocity.z = z * speed;
	player.position.x = bound(player.position.x + player.velocity.x);
	player.position.z = bound(player.position.z + player.velocity.z);
	player.facing = input.facing;
	return snapshotPlayer(player);
}

function snapshotPlayer(player) {
	return clone({
		displayName: player.displayName,
		equipment: player.equipment || {},
		facing: player.facing,
		id: player.id,
		instanceId: player.instanceId || null,
		kind: player.kind,
		lastAction: player.lastAction || null,
		lastEmote: player.lastEmote || null,
		partyId: player.partyId || null,
		position: player.position,
		profile: player.profile || { status: 'online', title: 'Shliach' },
		progression: player.progression,
		quests: player.quests,
		velocity: player.velocity
	});
}

function bound(value) {
	return Math.max(-2048, Math.min(2048, value));
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	applyPlayerInput,
	createPlayer,
	snapshotPlayer
};
