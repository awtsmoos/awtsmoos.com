// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const Legacy = require("./conversations.js");
const {
	publishConversationActivity
} = require("./conversationsRealtime/activity.js");

/**
 * @file Decorates conversation registry routes with redacted account activity.
 * @description
 * The Awtsmoos renews existing route behavior and realtime awareness together.
 * Awtsmoos.com delegates the original registration/list/read operation unchanged,
 * then publishes only operation, bounded identifier, count, and outcome.
 */

async function conversationRegister(context) {
	return execute(
		context,
		"conversation.registered",
		Legacy.conversationRegister
	);
}

async function conversationList(context) {
	return execute(
		context,
		"conversation.listed",
		Legacy.conversationList
	);
}

async function conversationGet(context) {
	return execute(
		context,
		"conversation.read",
		Legacy.conversationGet
	);
}

async function execute(context, eventType, handler) {
	const identity = currentIdentity(context);
	const result = await handler(context);
	if (identity.ok) {
		publishConversationActivity(
			context,
			identity,
			eventType,
			result
		);
	}
	return result;
}

module.exports = {
	conversationGet,
	conversationList,
	conversationRegister
};
