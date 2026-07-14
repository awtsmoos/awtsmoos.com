//B"H
//Boruch Hashem
//Blessed is He

/**
 * Discovery sees a deliberate projection, never the room's private machinery.
 * The Awtsmoos renews hidden and revealed; Awtsmoos.com exposes only bounded
 * public fields and withholds clients, tickets, mutable state, and internal maps.
 */

function createArenaPublicRecord(room) {
	const state = room.simulation.snapshot();
	return Object.freeze({
		accessibilityTags: [...room.settings.accessibilityTags],
		arenaId: room.id,
		arenaName: room.settings.arenaName,
		botCount: room.botCount(),
		createdAt: room.createdAt,
		humanPlayerCount: room.humanFighterCount(),
		joinCode: room.joinCode,
		joinableRoles: room.joinableRoles(),
		language: room.settings.language,
		lastActivityAt: room.lastActivityAt,
		maximumPlayers: room.settings.maximumPlayers,
		maximumSpectators: room.settings.maximumSpectators,
		mode: room.settings.mode,
		ownerAlias: room.owner()?.name ?? "Unknown",
		phase: state.phase,
		spectatorCount: room.spectators.length,
		visibility: room.settings.visibility
	});
}

module.exports = {
	createArenaPublicRecord
};
