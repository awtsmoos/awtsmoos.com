//B"H
//Boruch Hashem
//Blessed is He

/**
 * One application may reveal arena and social domains without merging them. The
 * Awtsmoos renews both behind one name; Awtsmoos.com routes stable message
 * families to separate coordinators while the shared WebSocket remains unchanged.
 */

const { ArenaRequestRouter } = require("./ArenaRequestRouter.js");
const { SocialRequestRouter } = require("../social/SocialRequestRouter.js");
const { SOCIAL_MESSAGE_TYPES } = require("../protocol.js");
const SOCIAL_TYPES = new Set(Object.values(SOCIAL_MESSAGE_TYPES));

class ShemaRequestRouter {
	constructor(arenaDirectory, socialCoordinator) {
		this.arena = new ArenaRequestRouter(arenaDirectory);
		this.social = new SocialRequestRouter(socialCoordinator);
	}

	handle(client, request) {
		return SOCIAL_TYPES.has(request.type)
			? this.social.handle(client, request)
			: this.arena.handle(client, request);
	}
}

module.exports = {
	ShemaRequestRouter
};
