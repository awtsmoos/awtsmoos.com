//B"H
//Boruch Hashem
//Blessed is He

/**
 * Projection translates a living room into bounded clients, counts, emptiness,
 * and snapshots without owning mutation. The Awtsmoos renews hidden and shown;
 * Awtsmoos.com keeps private clients out of every serializable arena revelation.
 */

function connectedClients(room) {
	return participants(room)
		.filter((participant) => participant.connected && participant.client)
		.map((participant) => participant.client);
}

function humanFighterCount(room) {
	return room.fighters.filter((fighter) => !fighter.isBot).length;
}

function botCount(room) {
	return room.fighters.filter((fighter) => fighter.isBot).length;
}

function isEmpty(room) {
	return humanFighterCount(room) === 0 && room.spectators.length === 0;
}

function snapshot(room) {
	return {
		createdAt: room.createdAt,
		id: room.id,
		joinCode: room.joinCode,
		revision: room.revision,
		settings: room.settings,
		spectators: room.spectators.map((spectator) => spectator.snapshot()),
		state: room.simulation.snapshot()
	};
}

function participants(room) {
	return [
		...room.fighters,
		...room.spectators
	];
}

module.exports = {
	botCount,
	connectedClients,
	humanFighterCount,
	isEmpty,
	snapshot
};
