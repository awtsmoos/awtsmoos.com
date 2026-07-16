// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerEntity.js
 * @description Defines private identity and public movement, social, combat, and power rating.
 * The Awtsmoos renews body, courage, wisdom, and mission together; Awtsmoos.com reveals
 * health and aggregate strength while attributes, wallet, mailbox, and powerups stay hidden.
 */

const { combatSnapshot } = require('./CombatState.js');
const { derivedPlayerStats } = require('./PlayerAttributeCatalog.js');
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
		accountId: options.accountId || null,
		connected: options.connected !== false,
		displayName: options.displayName,
		facing: 0,
		id: options.id,
		identityAssurance: options.identityAssurance || 'guest',
		kind: options.kind || 'human',
		position,
		progression: createProgression(),
		quests: {},
		velocity: {
			x: 0,
			y: 0,
			z: 0
		}
	};
}

function applyPlayerInput(player, input) {
	const speed = player.combat?.status === 'defeated' ? 0 : 0.35;
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
		adventureQuests: player.adventureQuests || {},
		combat: combatSnapshot(player.combat),
		connected: player.kind === 'bot' || player.connected !== false,
		displayName: player.displayName,
		equipment: player.equipment || {},
		facing: player.facing,
		guildId: player.guildId || null,
		id: player.id,
		instanceId: player.instanceId || null,
		kind: player.kind,
		lastAction: player.lastAction || null,
		lastEmote: player.lastEmote || null,
		partyId: player.partyId || null,
		position: player.position,
		profile: player.profile || {
			status: 'online',
			title: 'Shliach'
		},
		progression: player.progression,
		quests: player.quests,
		refinedSparks: player.refinedSparks || 0,
		shliach: publicShliachProjection(player),
		velocity: player.velocity
	});
}

function publicShliachProjection(player) {
	const derived = derivedPlayerStats(player);
	return {
		level: player.progression.level,
		powerRating: derived.powerRating
	};
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
