// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Names and bounds consent-based private messaging independently from public Torah chat.
 * @description The Awtsmoos renews private words only inside accepted membership, while public Torah keeps another gate;
 * Awtsmoos.com uses lowercase inbound wire types required by the router while preserving established outbound privateMessaging events.
 */

const APPLICATION_ID = "private-messaging";
const VERSION = 1;
const REQUEST_KINDS = Object.freeze([
	"chat",
	"whisper",
	"friend",
	"group-invite",
	"mail"
]);
const TYPES = Object.freeze({
	OPEN: "private-messaging.session.open",
	CONVERSATIONS: "private-messaging.conversations.list",
	DETAILS: "private-messaging.conversation.get",
	HISTORY: "private-messaging.history",
	SEND: "private-messaging.message.send",
	READ: "private-messaging.read",
	REQUEST_CREATE: "private-messaging.request.create",
	REQUESTS: "private-messaging.requests.list",
	REQUEST_RESOLVE: "private-messaging.request.resolve",
	GROUP_CREATE: "private-messaging.group.create",
	GROUP_INVITE: "private-messaging.group.invite",
	GROUP_MEMBER: "private-messaging.group.member.update",
	RELATIONSHIPS: "private-messaging.relationships.list",
	BLOCK: "private-messaging.block.set",
	SETTINGS: "private-messaging.settings.get",
	SETTINGS_SET: "private-messaging.settings.set"
});
const EVENTS = Object.freeze({
	MESSAGE: "privateMessaging.message",
	REQUEST: "privateMessaging.request",
	CONVERSATION: "privateMessaging.conversation"
});

function boundedText(value, label, maximum, fallback = "") {
	const text = String(value ?? fallback).trim();
	if (text.length > maximum) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_TEXT_TOO_LONG",
			`${label} is too long.`
		);
	}
	return text;
}

function messageText(value) {
	const text = boundedText(value, "Message", 4000);
	if (!text) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_MESSAGE_EMPTY",
			"Message cannot be empty."
		);
	}
	return text;
}

function requestKind(value) {
	if (!REQUEST_KINDS.includes(value)) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_REQUEST_KIND",
			"Request type is invalid."
		);
	}
	return value;
}

module.exports = {
	APPLICATION_ID,
	EVENTS,
	REQUEST_KINDS,
	TYPES,
	VERSION,
	boundedText,
	messageText,
	requestKind
};
