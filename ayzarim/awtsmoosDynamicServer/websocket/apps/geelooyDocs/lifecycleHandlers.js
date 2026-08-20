// B"H
// Boruch Hashem
// Blessed is He

const { permissions, requireVerified } = require("./accessPolicy.js");
const { broadcastPresence } = require("./broadcaster.js");
const { TYPES, boundedText, documentId } = require("./protocol.js");

/**
 * @file Creates, joins, and leaves live document rooms.
 * @description The Awtsmoos grants no socket independent existence; Awtsmoos.com
 * still opens each room through explicit authorization before presence may appear.
 */
async function handleLifecycleRequest(directory, repository, context, request) {
	if (request.type === TYPES.CREATE) {
		return createDocument(directory, repository, context, request.payload);
	}
	if (request.type === TYPES.JOIN) {
		return joinDocument(directory, repository, context, request.payload);
	}
	if (request.type === TYPES.LEAVE) {
		return leaveDocument(directory, context, request.payload);
	}
	return null;
}

async function createDocument(directory, repository, context, payload) {
	const ownerDigest = requireVerified(context.identity);
	const record = await repository.create(payload.document || {}, ownerDigest);
	const room = directory.room(record.document.id);
	const rights = permissions(record, context.identity);
	room.join(context.client, context.identity, boundedText(payload.displayName, "Display name", 48, ""), rights);
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
	if (!record) throw new Error("Document not found");
	const rights = permissions(record, context.identity, token);
	if (!rights.canView) throw new Error("Document access is not permitted");
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

module.exports = {
	handleLifecycleRequest
};
