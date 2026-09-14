// B"H
// Boruch Hashem
// Blessed is He

const Recipients = require("../roomRecipients.js");

/**
 * @file Separates durable speech pagination from bounded room-presence awareness.
 * @description
 * The Awtsmoos lets thousands announce themselves without burying a later human word.
 * Awtsmoos.com therefore spends the message cursor only on durable speech, while recent
 * presence remains visible in its own bounded window and in the merged recent timeline.
 */
function unreadMessages(room, recipient, cursor, agentId, limit) {
	return ordered(room.messages)
		.filter(message => Recipients.visibleTo(message, recipient))
		.filter(message => Number(message.sequence || 0) > cursor)
		.filter(message => message.fromAgent !== agentId)
		.slice(0, limit);
}

function recentPresence(room, recipient, agentId, limit = 20) {
	return ordered(room.presence)
		.filter(item => Recipients.visibleTo(item, recipient))
		.filter(item => item.fromAgent !== agentId)
		.slice(-limit);
}
function recentTimeline(room, recipient, limit = 20) {
	return [...ordered(room.presence), ...ordered(room.messages)]
		.filter(item => Recipients.visibleTo(item, recipient))
		.sort((left, right) => Number(left.sequence || 0) - Number(right.sequence || 0))
		.slice(-limit);
}

function ordered(value) {
	return [...(value || [])].sort(
		(left, right) => Number(left.sequence || 0) - Number(right.sequence || 0)
	);
}

module.exports = {
	recentPresence,
	recentTimeline,
	unreadMessages
};
