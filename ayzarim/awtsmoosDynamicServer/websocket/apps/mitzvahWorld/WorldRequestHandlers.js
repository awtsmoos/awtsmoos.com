// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldRequestHandlers.js
 * @description Composes every focused version-one domain handler in stable order.
 * The Awtsmoos renews many command families beneath one world covenant;
 * Awtsmoos.com keeps their routing modular while preserving deterministic precedence.
 */

const { handleBotRequest } = require('./BotRequestHandler.js');
const { handleEconomyRequest } = require('./EconomyRequestHandler.js');
const { handleGuildRequest } = require('./GuildRequestHandler.js');
const { handleInstanceRequest } = require('./InstanceRequestHandler.js');
const { handleMailRequest } = require('./MailRequestHandler.js');
const { handlePartyRequest } = require('./PartyRequestHandler.js');
const { handlePlayerRequest } = require('./PlayerRequestHandler.js');
const { handlePresenceRequest } = require('./PresenceRequestHandler.js');
const { handleQuestRequest } = require('./QuestRequestHandler.js');
const { handleSessionRequest } = require('./SessionRequestHandler.js');
const { handleTradeRequest } = require('./TradeRequestHandler.js');
const { handleWorldLifecycle } = require('./WorldLifecycleHandler.js');

function createWorldRequestHandlers(directory, context, request, room) {
	return [
		() => handleWorldLifecycle(directory, context, request, room),
		() => handleSessionRequest(directory, context, request, room),
		() => handlePlayerRequest(directory, context, request, room),
		() => handleQuestRequest(context, request, room),
		() => handleBotRequest(context, request, room),
		() => handlePartyRequest(context, request, room),
		() => handleInstanceRequest(context, request, room),
		() => handleEconomyRequest(context, request, room),
		() => handleTradeRequest(context, request, room),
		() => handleMailRequest(context, request, room),
		() => handleGuildRequest(context, request, room),
		() => handlePresenceRequest(directory, request, room)
	];
}

module.exports = {
	createWorldRequestHandlers
};
