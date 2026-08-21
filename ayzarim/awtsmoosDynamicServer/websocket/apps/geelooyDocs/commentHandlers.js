// B"H
// Boruch Hashem
// Blessed is He

const { requireEdit } = require("./accessPolicy.js");
const { broadcastRoom } = require("./broadcaster.js");
const {
	DOCS_ERROR,
	docsError,
	invalidInput
} = require("./docsErrors.js");
const { requireJoinedRoom } = require("./editHandlers.js");
const { EVENTS, TYPES, boundedText, documentId } = require("./protocol.js");

/**
 * @file Persists anchored collaborator note threads as bounded plain text.
 * @description The Awtsmoos gives every word context beyond itself; Awtsmoos.com
 * lets collaborators answer and resolve notes while explicit anchor/not-found errors
 * distinguish stale document state from malformed comment commands.
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

/** Applies one supported comment mutation and rejects unknown client commands explicitly. */
function applyMutation(record, mutation, displayName) {
	const kind = boundedText(mutation.kind, "Comment mutation", 24);
	if (kind === "create") return createComment(record, mutation.comment, displayName);
	if (kind === "reply") return replyToComment(record, mutation, displayName);
	if (kind === "resolve") return resolveComment(record, mutation);
	throw invalidInput("mutation.kind", "Unsupported comment mutation.", { kind });
}

/** Creates one comment anchored to a block that still exists in the current document. */
function createComment(record, candidate = {}, displayName) {
	const id = requiredText(candidate.id, "comment.id", "Comment id", 96);
	const blockId = requiredText(candidate.blockId, "comment.blockId", "Comment block id", 96);
	const text = requiredText(candidate.text, "comment.text", "Comment", 4000);
	if (!record.document.blocks.some(block => block.id === blockId)) {
		throw docsError(
			DOCS_ERROR.COMMENT_ANCHOR_NOT_FOUND,
			"Comment anchor block no longer exists.",
			{ blockId },
			409
		);
	}
	if (record.document.comments.some(comment => comment.id === id)) return;
	record.document.comments.push({
		id,
		blockId,
		text,
		author: boundedText(displayName, "Comment author", 48, "Collaborator"),
		resolved: false,
		createdAt: new Date().toISOString(),
		replies: []
	});
}

/** Appends one bounded plain-text reply to an existing comment thread. */
function replyToComment(record, mutation, displayName) {
	const comment = findComment(record, mutation.commentId);
	const reply = mutation.reply || {};
	comment.replies.push({
		id: requiredText(reply.id, "reply.id", "Reply id", 96),
		text: requiredText(reply.text, "reply.text", "Reply", 4000),
		author: boundedText(displayName, "Reply author", 48, "Collaborator"),
		createdAt: new Date().toISOString()
	});
}

/** Toggles the resolved state of an existing thread without deleting its history. */
function resolveComment(record, mutation) {
	const comment = findComment(record, mutation.commentId);
	comment.resolved = Boolean(mutation.resolved);
}

/** Finds one comment or returns a stable document-state not-found response. */
function findComment(record, value) {
	const id = requiredText(value, "commentId", "Comment id", 96);
	const comment = record.document.comments.find(item => item.id === id);
	if (!comment) {
		throw docsError(
			DOCS_ERROR.COMMENT_NOT_FOUND,
			"Comment not found.",
			{ commentId: id },
			404
		);
	}
	return comment;
}

/** Requires non-empty bounded text while preserving shared protocol length validation. */
function requiredText(value, field, label, maximum) {
	const text = boundedText(value, label, maximum);
	if (!text) throw invalidInput(field, `${label} is required.`);
	return text;
}

module.exports = { handleCommentRequest };
