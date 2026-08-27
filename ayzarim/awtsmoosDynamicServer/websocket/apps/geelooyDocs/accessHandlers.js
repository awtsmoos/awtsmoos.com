// B"H
// Boruch Hashem
// Blessed is He

const { requireOwner } = require("./accessPolicy.js");
const { broadcastRoom } = require("./broadcaster.js");
const { invalidInput } = require("./docsErrors.js");
const {
	accountDigest,
	createCapabilityToken,
	tokenDigest
} = require("./identity.js");
const {
	EVENTS,
	TYPES,
	boundedText,
	documentId,
	shareMode
} = require("./protocol.js");
const { reconcileRoomAccess } = require("./roomAccess.js");

/**
 * @file Applies owner-only sharing and invitation changes through explicit Docs API validation.
 * @description The Awtsmoos is infinitely open without surrendering truth; Awtsmoos.com
 * makes every public doorway an owner act and every malformed invitation a bounded
 * client-fixable error rather than an internal failure hidden behind server prose.
 */
async function handleAccessRequest(directory, repository, context, request) {
	if (request.type === TYPES.ACCESS) {
		return updateAccess(directory, repository, context, request.payload || {});
	}
	if (request.type === TYPES.INVITE) {
		return inviteEditor(directory, repository, context, request.payload || {});
	}
	return null;
}

async function updateAccess(directory, repository, context, payload) {
	const id = documentId(payload.documentId);
	const mode = shareMode(payload.mode);
	let revealedToken = "";
	await repository.update(id, record => {
		requireOwner(record, context.identity);
		if (["link-view", "link-edit"].includes(mode)) {
			revealedToken = createCapabilityToken();
			record.linkTokenDigest = tokenDigest(revealedToken);
		} else {
			record.linkTokenDigest = "";
		}
		record.document.access = { mode };
	});
	const record = await repository.get(id);
	const room = directory.room(id);
	reconcileRoomAccess(context, room, record);
	broadcastRoom(context, room, EVENTS.ACCESS, {
		documentId: id,
		access: record.document.access
	});
	return {
		type: "docs.access.updated",
		payload: {
			access: record.document.access,
			token: revealedToken
		}
	};
}

async function inviteEditor(directory, repository, context, payload) {
	const id = documentId(payload.documentId);
	const accountId = boundedText(payload.accountId, "Account id", 200);
	if (!accountId) {
		throw invalidInput("accountId", "An account id is required.");
	}
	const editorDigest = accountDigest(accountId);
	await repository.update(id, record => {
		requireOwner(record, context.identity);
		record.editorDigests ||= [];
		if (!record.editorDigests.includes(editorDigest)) {
			record.editorDigests.push(editorDigest);
		}
	});
	const record = await repository.get(id);
	const room = directory.room(id);
	reconcileRoomAccess(context, room, record);
	broadcastRoom(context, room, EVENTS.ACCESS, {
		documentId: id,
		access: {
			mode: record.document.access.mode,
			editorCount: record.editorDigests.length
		}
	});
	return {
		type: "docs.access.invited",
		payload: { editorCount: record.editorDigests.length }
	};
}

module.exports = { handleAccessRequest };
