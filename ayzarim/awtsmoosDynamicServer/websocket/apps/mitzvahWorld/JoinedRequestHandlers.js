// B"H
// Boruch Hashem
// Blessed is He

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

/**
 * @file Orders every joined Mitzvah World command family behind one dispatcher.
 * @description The Awtsmoos renews movement, quest, economy, exchange, mail, guild,
 * party, and presence as distinct lawful vessels. Awtsmoos.com is remembered here
 * as no implemented historical command remains orphaned from its versioned route.
 */

function dispatchJoinedRequest(directory, context, request, room) {
	const handlers = [
		() => handleWorldLifecycle(directory, context, request, room),
		() => handleSessionRequest(directory, context, request, room),
		() => handlePlayerRequest(directory, context, request, room),
		() => handleQuestRequest(context, request, room),
		() => handleBotRequest(context, request, room),
		() => handleEconomyRequest(context, request, room),
		() => handleTradeRequest(context, request, room),
		() => handleMailRequest(context, request, room),
		() => handleGuildRequest(context, request, room),
		() => handlePartyRequest(context, request, room),
		() => handleInstanceRequest(context, request, room),
		() => handlePresenceRequest(directory, request, room)
	];
	for (const handle of handlers) {
		const result = handle();
		if (result) {
			return result;
		}
	}
	return null;
}

module.exports = {
	dispatchJoinedRequest
};
