// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldRoomStateRecord.js
 * @description Captures durable players, creatures, possessions, and social truth.
 * The Awtsmoos renews courage and creature outcome beyond process replacement;
 * Awtsmoos.com omits transport and animation while preserving lawful world results.
 */

const { restoreCombatState } = require('./CombatState.js');
const {
	captureCreatureState,
	restoreCreatureState
} = require('./CreatureStateRecord.js');
const { createPlayerState } = require('./PlayerState.js');
const { sanitizeSocialState } = require('./WorldSocialStateFilter.js');

function captureRoomState(room) {
	return {
		creatures: captureCreatureState(room.creatures),
		guilds: room.guilds.snapshotAll(),
		id: room.id,
		instances: room.instances.snapshotAll(),
		nextEntity: room.nextEntity,
		parties: room.parties.snapshotAll(),
		players: [...room.players.values()]
			.filter((player) => player.kind === 'human')
			.map(clone),
		revision: room.revision
	};
}

function restoreRoomState(directory, roomRecord, survivingPlayerIds) {
	const room = directory.room(roomRecord.id);
	const social = sanitizeSocialState(roomRecord, survivingPlayerIds);
	room.players.clear();
	for (const player of social.players) {
		if (survivingPlayerIds.has(player.id)) {
			room.players.set(player.id, restorePlayer(player));
		}
	}
	room.nextEntity = Math.max(Number(roomRecord.nextEntity || 1), 1);
	room.journal.revision = Math.max(Number(roomRecord.revision || 0), 0);
	room.parties.restore(social.parties);
	room.instances.restore(social.instances);
	room.guilds.restore(social.guilds);
	restoreCreatureState(room.creatures, roomRecord.creatures);
	return room;
}

function restorePlayer(record) {
	const defaults = createPlayerState(record.position || {});
	return {
		...defaults,
		...clone(record),
		adventureQuests: clone(record.adventureQuests || defaults.adventureQuests),
		combat: restoreCombatState(record.combat || defaults.combat),
		equipment: clone(record.equipment || defaults.equipment),
		inventory: clone(record.inventory || defaults.inventory),
		mailbox: clone(record.mailbox || defaults.mailbox),
		profile: clone(record.profile || defaults.profile),
		refinedSparks: Math.max(0, Number(record.refinedSparks || 0)),
		safePosition: clone(record.safePosition || defaults.safePosition),
		wallet: clone(record.wallet || defaults.wallet)
	};
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	captureRoomState,
	restoreRoomState
};
