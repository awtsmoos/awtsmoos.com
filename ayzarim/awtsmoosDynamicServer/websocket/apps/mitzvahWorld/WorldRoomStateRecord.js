// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldRoomStateRecord.js
 * @description Captures and restores durable players, creatures, possessions, social truth, and effects.
 * The Awtsmoos renews courage and affinity beyond process replacement without losing a deed;
 * Awtsmoos.com omits transport while preserving lawful personal, social, combat, and world seed.
 */

const { restoreCombatState } = require('./CombatState.js');
const {
	captureCreatureState,
	restoreCreatureState
} = require('./CreatureStateRecord.js');
const { createPlayerState } = require('./PlayerState.js');
const { restoreShliachState } = require('./ShliachProfileState.js');
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
			.filter(player => player.kind === 'human')
			.map(capturePlayer),
		revision: room.revision,
		worldEffects: room.worldEffects.snapshot()
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
	room.worldEffects.restore(roomRecord.worldEffects || []);
	return room;
}

function restorePlayer(record) {
	const defaults = createPlayerState(record.position || {});
	const progression = clone(record.progression || {});
	return {
		...defaults,
		...clone(record),
		adventureQuests: clone(record.adventureQuests || defaults.adventureQuests),
		combat: restoreCombatState(record.combat || defaults.combat),
		connected: false,
		equipment: clone(record.equipment || defaults.equipment),
		inventory: clone(record.inventory || defaults.inventory),
		mailbox: clone(record.mailbox || defaults.mailbox),
		profile: clone(record.profile || defaults.profile),
		progression,
		refinedSparks: Math.max(0, Number(record.refinedSparks || 0)),
		safePosition: clone(record.safePosition || defaults.safePosition),
		shliach: restoreShliachState(record.shliach || defaults.shliach, progression),
		wallet: clone(record.wallet || defaults.wallet)
	};
}

function capturePlayer(player) {
	const record = clone(player);
	delete record.connected;
	return record;
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	captureRoomState,
	restoreRoomState
};
