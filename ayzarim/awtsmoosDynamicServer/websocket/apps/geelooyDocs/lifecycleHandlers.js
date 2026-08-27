// B"H
// Boruch Hashem
// Blessed is He

const { permissions, requireVerified } = require("./accessPolicy.js");
const { broadcastPresence } = require("./broadcaster.js");
const {
	DOCS_ERROR,
	docsError,
	documentNotFound
} = require("./docsErrors.js");
const { TYPES, boundedText, documentId } = require("./protocol.js");

/**
 * @file Creates, joins, and leaves live Awtsmoos Docs editor rooms with explicit authority.
 * @description The Awtsmoos grants no socket independent existence; Awtsmoos.com
 * names missing documents and denied views distinctly, letting clients offer truthful
 * recovery instead of turning ordinary access decisions into anonymous server failure.
 */
async function handleLifecycleRequest(directory, repository, context, request, services) {
	if (request.type === TYPES.CREATE) {
		return createDocument(directory, repository, context, request.payload || {}, services);
	}
	if (request.type === TYPES.JOIN) {
		return joinDocument(directory, repository, context, request.payload || {});
	}
	if (request.type === TYPES.LEAVE) {
		return leaveDocument(directory, context, request.payload || {});
	}
	return null;
}

async function createDocument(directory, repository, context, payload, services) {
	const ownerDigest = requireVerified(context.identity);
	const displayName = boundedText(payload.displayName, "Display name", 48, "");
	const record = await repository.create(payload.document || {}, ownerDigest);
	await services.versions.create(record.document, {
		kind: "initial",
		label: "Created",
		author: displayName
	});
	const room = directory.room(record.document.id);
	const rights = permissions(record, context.identity);
	room.join(context.client, context.identity, displayName, rights);
	broadcastPresence(context, room);
	return {
		type: "docs.document.created",
		payload: sessionPayload(repository, record, room, rights)
	};
}

async function joinDocument(directory, repository, context, payload) {
	const id = documentId(payload.documentId);
	const token = boundedText(payload.token, "Share token", 160, "");
	const record = await repository.get(id);
	if (!record) throw documentNotFound();
	const rights = permissions(record, context.identity, token);
	if (!rights.canView) {
		throw docsError(
			DOCS_ERROR.VIEW_DENIED,
			"Document viewing is not permitted.",
			{ documentId: id },
			403
		);
	}
	const previous = directory.leave(context.client);
	if (previous) broadcastPresence(context, previous);
	const room = directory.room(id);
	room.join(
		context.client,
		context.identity,
		boundedText(payload.displayName, "Display name", 48, ""),
		rights,
		token
	);
	broadcastPresence(context, room);
	return {
		type: "docs.document.joined",
		payload: sessionPayload(repository, record, room, rights)
	};
}

function leaveDocument(directory, context, payload) {
	if (payload.documentId) documentId(payload.documentId);
	const room = directory.leave(context.client);
	if (room) broadcastPresence(context, room);
	return {
		type: "docs.document.left",
		payload: { documentId: room?.documentId || "" }
	};
}

function sessionPayload(repository, record, room, rights) {
	return {
		document: repository.publicSnapshot(record),
		permissions: {
			canEdit: rights.canEdit,
			isOwner: rights.isOwner
		},
		presence: room.publicPresence()
	};
}

module.exports = { handleLifecycleRequest };
