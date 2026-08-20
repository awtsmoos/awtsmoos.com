// B"H
// Boruch Hashem
// Blessed is He

const { requireEdit } = require("./accessPolicy.js");
const { broadcastRoom } = require("./broadcaster.js");
const { requireJoinedRoom } = require("./editHandlers.js");
const { EVENTS, TYPES, boundedText, documentId } = require("./protocol.js");

/**
 * @file Persists anchored note threads as plain text beside rich document blocks.
 * @description The Awtsmoos gives every word context beyond itself; Awtsmoos.com
 * lets collaborators attend highlighted text without granting comments executable markup.
 */
async function handleCommentRequest(directory, repository, context, request) {
	if (request.type !== TYPES.COMMENT) return null;
	const payload = request.payload || {};
	const id = documentId(payload.documentId);
	const room = requireJoinedRoom(directory, context.client, id);
	const participant = room.participant(context.client);
	const mutation = payload.mutation || {};
	const comments = await repository.update(id, record => {
		requireEdit(record, context.identity, participant.capabilityDigest);
		applyMutation(record, mutation, participant.displayName);
		return structuredClone(record.document.comments);
	});
	broadcastRoom(context, room, EVENTS.COMMENTS, {
		documentId: id,
		comments
	});
	return {
		type: "docs.comment.mutated",
		payload: { comments }
	};
}

function applyMutation(record, mutation, displayName) {
	const kind = boundedText(mutation.kind, "Comment mutation", 24);
	if (kind === "create") return createComment(record, mutation.comment, displayName);
	if (kind === "reply") return replyToComment(record, mutation, displayName);
	if (kind === "resolve") return resolveComment(record, mutation);
	throw new Error("Unsupported comment mutation");
}

function createComment(record, candidate = {}, displayName) {
	const id = boundedText(candidate.id, "Comment id", 96);
	const blockId = boundedText(candidate.blockId, "Comment block id", 96);
	if (!record.document.blocks.some(block => block.id === blockId)) {
		throw new Error("Comment anchor block does not exist");
	}
	if (record.document.comments.some(comment => comment.id === id)) return;
	record.document.comments.push({
		id,
		blockId,
		text: boundedText(candidate.text, "Comment", 4000),
		author: boundedText(displayName, "Comment author", 48, "Collaborator"),
		resolved: false,
		createdAt: new Date().toISOString(),
		replies: []
	});
}

function replyToComment(record, mutation, displayName) {
	const comment = findComment(record, mutation.commentId);
	const reply = mutation.reply || {};
	comment.replies.push({
		id: boundedText(reply.id, "Reply id", 96),
		text: boundedText(reply.text, "Reply", 4000),
		author: boundedText(displayName, "Reply author", 48, "Collaborator"),
		createdAt: new Date().toISOString()
	});
}

function resolveComment(record, mutation) {
	const comment = findComment(record, mutation.commentId);
	comment.resolved = Boolean(mutation.resolved);
}

function findComment(record, value) {
	const id = boundedText(value, "Comment id", 96);
	const comment = record.document.comments.find(item => item.id === id);
	if (!comment) throw new Error("Comment not found");
	return comment;
}

module.exports = {
	handleCommentRequest
};
