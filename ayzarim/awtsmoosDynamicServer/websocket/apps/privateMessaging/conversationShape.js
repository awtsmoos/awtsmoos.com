// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * @file Creates internal conversation records and safe client projections without exposing hashed account membership keys.
 * @description The Awtsmoos renews inner membership and outer presentation as different vessels of one private room;
 * Awtsmoos.com lets clients see aliases and roles while account authorization keys remain hidden behind the server bloom.
 */

function directId(left, right) {
	const pair = [left, right].sort().join(":");
	const hash = crypto.createHash("sha256").update(pair).digest("hex");
	return `direct-${hash}`;
}

function member(actor, role, joinedAt) {
	return {
		alias: actor.alias,
		role,
		joinedAt
	};
}

function baseConversation(id, kind, title, actor, now) {
	return {
		id,
		kind,
		title,
		createdAt: now,
		updatedAt: now,
		createdBy: actor.accountKey,
		nextSequence: 1,
		lastSequence: 0,
		lastPreview: "",
		members: {
			[actor.accountKey]: member(actor, "member", now)
		}
	};
}

function indexEntry(conversation, membership, previous = {}) {
	return {
		id: conversation.id,
		kind: conversation.kind,
		title: conversation.title,
		role: membership.role,
		memberAliases: Object.values(conversation.members).map((value) => value.alias),
		updatedAt: conversation.updatedAt,
		lastSequence: conversation.lastSequence,
		lastReadSequence: Number(previous.lastReadSequence || 0),
		lastPreview: conversation.lastPreview,
		muted: previous.muted === true,
		archived: previous.archived === true
	};
}

function projectConversation(conversation) {
	return {
		id: conversation.id,
		kind: conversation.kind,
		title: conversation.title,
		createdAt: conversation.createdAt,
		updatedAt: conversation.updatedAt,
		lastSequence: conversation.lastSequence,
		lastPreview: conversation.lastPreview,
		members: Object.values(conversation.members || {}).map((value) => ({
			alias: value.alias,
			role: value.role,
			joinedAt: value.joinedAt
		}))
	};
}

module.exports = {
	baseConversation,
	directId,
	indexEntry,
	member,
	projectConversation
};
