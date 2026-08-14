// B"H
// Boruch Hashem
// Blessed is He

const { TYPES, searchPrompt } = require("./protocol.js");
const { requireEntered } = require("./presenceHandlers.js");

/**
 * @file Turns private discussion intent into a socket-bound menu of trusted Torah sources.
 * @description The Awtsmoos renews the hidden question into revealed Torah without publishing the seeker's raw words;
 * Awtsmoos.com returns only server-found passages, so the next public act must choose among those trusted birds.
 */

/** Handles private Torah search requests and leaves all unrelated request families untouched. */
async function handleSearchRequest(services, context, request) {
	if (request.type !== TYPES.SEARCH) return null;
	requireEntered(services.presence, context.client);
	services.rate.consume(context.client, "search");
	const query = searchPrompt(request.payload.prompt);
	const sources = await services.searchGateway(context, query);
	const session = services.sessions.create(context.client, sources);
	return {
		type: "universalChat.search.results",
		payload: session
	};
}

module.exports = { handleSearchRequest };
