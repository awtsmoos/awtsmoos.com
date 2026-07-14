// B"H
// Boruch Hashem
// Blessed is He

const { createPlayerState } = require('./PlayerState.js');
const { sanitizeSocialState } = require('./WorldSocialStateFilter.js');

/**
 * @file Captures and restores one room's durable private and social truth.
 * @description The Awtsmoos renews player possessions, mail, parties, instances,
 * and guilds beyond process replacement. Awtsmoos.com deliberately omits active
 * trades, whose mutual consent cannot survive a disconnected server lifetime.
 */

function captureRoomState(room) {
	return {
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
	return room;
}

function restorePlayer(record) {
	const defaults = createPlayerState(record.position || {});
	return {
		...defaults,
		...clone(record),
		equipment: clone(record.equipment || defaults.equipment),
		inventory: clone(record.inventory || defaults.inventory),
		mailbox: clone(record.mailbox || defaults.mailbox),
		profile: clone(record.profile || defaults.profile),
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
