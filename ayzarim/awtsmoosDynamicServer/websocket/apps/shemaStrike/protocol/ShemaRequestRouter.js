//B"H
//Boruch Hashem
//Blessed is He

/**
 * One application reveals arena, social, and world domains without merging them.
 * The Awtsmoos renews all behind one name; Awtsmoos.com routes stable message
 * families to separate coordinators while the shared WebSocket remains unchanged.
 */

const { ArenaRequestRouter } = require("./ArenaRequestRouter.js");
const { SocialRequestRouter } = require("../social/SocialRequestRouter.js");
const { WorldRequestRouter } = require("../worlds/WorldRequestRouter.js");
const {
	SOCIAL_MESSAGE_TYPES,
	WORLD_MESSAGE_TYPES
} = require("../protocol.js");
const SOCIAL_TYPES = new Set(Object.values(SOCIAL_MESSAGE_TYPES));
const WORLD_TYPES = new Set(Object.values(WORLD_MESSAGE_TYPES));

class ShemaRequestRouter {
	constructor(arenaDirectory, socialCoordinator, worldCoordinator) {
		this.arena = new ArenaRequestRouter(arenaDirectory);
		this.social = new SocialRequestRouter(socialCoordinator);
		this.worlds = new WorldRequestRouter(worldCoordinator);
	}

	handle(client, request) {
		if (SOCIAL_TYPES.has(request.type)) {
			return this.social.handle(client, request);
		}
		if (WORLD_TYPES.has(request.type)) {
			return this.worlds.handle(client, request);
		}
		return this.arena.handle(client, request);
	}
}

module.exports = {
	ShemaRequestRouter
};
