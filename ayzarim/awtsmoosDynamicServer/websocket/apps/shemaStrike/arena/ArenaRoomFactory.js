//B"H
//Boruch Hashem
//Blessed is He

/**
 * Room factory resolves one immutable published world before simulation begins.
 * The Awtsmoos renews creator choice and server law; Awtsmoos.com refuses a world
 * pin that lacks sufficient validated spawns for the chosen fighter capacity.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const { ArenaRoom } = require("../ArenaRoom.js");
const { createJoinCode } = require("../joinCode.js");
const { validateArenaSettings } = require("./ArenaSettings.js");

class ArenaRoomFactory {
	constructor(rooms, worldResolver = null) {
		this.rooms = rooms;
		this.worldResolver = worldResolver;
	}

	create(client, name, settingsValue) {
		const settings = validateArenaSettings(settingsValue);
		const world = settings.worldVersionId
			? this.resolveWorld(settings.worldVersionId)
			: null;
		if (world && world.spawnPoints.length < settings.maximumPlayers) {
			throw new RealtimeError(
				"WORLD_SPAWN_CAPACITY_TOO_SMALL",
				"Published world lacks enough spawn points for this arena capacity."
			);
		}
		const joinCode = createJoinCode(this.rooms);
		return new ArenaRoom(joinCode, client, name, settings, world);
	}

	resolveWorld(versionId) {
		if (!this.worldResolver?.resolvePublishedWorld) {
			throw new RealtimeError(
				"WORLD_RESOLVER_UNAVAILABLE",
				"Published worlds are unavailable on this server."
			);
		}
		return this.worldResolver.resolvePublishedWorld(versionId);
	}
}

module.exports = {
	ArenaRoomFactory
};
