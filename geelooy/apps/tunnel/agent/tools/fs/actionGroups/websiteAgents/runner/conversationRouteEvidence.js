//B"H
//Boruch Hashem
//Blessed be He

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns a canonical upstream ChatGPT UUID or null. */
function validConversationId(value) {
	const id = String(value || "");
	return UUID.test(id) ? id : null;
}

/** Returns the upstream UUID only when the mission witnessed the canonical route. */
function conversationId(agent = {}) {
	if (!agent.conversationRouteVerifiedAt) return null;
	return validConversationId(agent.conversationId || agent.conversationKey);
}

/** A dispatched turn must have accepted response plus canonical route evidence. */
function complete(agent = {}) {
	return Boolean(agent.submissionAcceptedAt && conversationId(agent));
}

module.exports = { complete, conversationId, validConversationId };
