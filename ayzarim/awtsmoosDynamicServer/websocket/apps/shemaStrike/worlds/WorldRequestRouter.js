//B"H
//Boruch Hashem
//Blessed is He

/**
 * The world router maps stable creator commands to verified coordinator acts.
 * The Awtsmoos renews every draft and publication; Awtsmoos.com keeps creative
 * protocol growth separate from arena, social, and shared WebSocket routing.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const { WORLD_MESSAGE_TYPES, WORLD_RESPONSE_TYPES } = require("../protocol.js");

class WorldRequestRouter {
	constructor(worlds) {
		this.worlds = worlds;
		this.handlers = new Map([
			[WORLD_MESSAGE_TYPES.CREATE, (client, payload) => this.wrap("CREATED", worlds.create(client, payload.draft))],
			[WORLD_MESSAGE_TYPES.UPDATE, (client, payload) => this.wrap("UPDATED", worlds.update(client, payload.worldId, payload.draft))],
			[WORLD_MESSAGE_TYPES.GET, (client, payload) => this.wrap("WORLD", worlds.get(client, payload.worldId))],
			[WORLD_MESSAGE_TYPES.LIST_OWNED, (client) => this.wrap("OWNED", worlds.listOwned(client))],
			[WORLD_MESSAGE_TYPES.PUBLISH, (client, payload) => this.wrap("PUBLISHED", worlds.publish(client, payload.worldId))],
			[WORLD_MESSAGE_TYPES.UNPUBLISH, (client, payload) => this.wrap("UNPUBLISHED", worlds.unpublish(client, payload.versionId))],
			[WORLD_MESSAGE_TYPES.ARCHIVE, (client, payload) => this.wrap("ARCHIVED", worlds.archive(client, payload.worldId))],
			[WORLD_MESSAGE_TYPES.DISCOVER, (_client, payload) => this.wrap("DISCOVERED", worlds.discover(payload))],
			[WORLD_MESSAGE_TYPES.GET_PUBLIC, (_client, payload) => this.wrap("PUBLIC", worlds.getPublic(payload.versionId))],
			[WORLD_MESSAGE_TYPES.FORK, (client, payload) => this.wrap("FORKED", worlds.fork(client, payload.versionId))],
			[WORLD_MESSAGE_TYPES.REPORT, (client, payload) => this.wrap("REPORTED", worlds.report(client, payload.versionId, payload.reason))]
		]);
	}

	handle(client, request) {
		const handler = this.handlers.get(request.type);
		if (!handler) {
			throw new RealtimeError(
				"UNKNOWN_WORLD_MESSAGE",
				`Unknown Shema Strike world message: ${request.type}`
			);
		}
		return handler(client, request.payload || {});
	}

	wrap(key, payload) {
		return {
			payload,
			type: WORLD_RESPONSE_TYPES[key]
		};
	}
}

module.exports = {
	WorldRequestRouter
};
