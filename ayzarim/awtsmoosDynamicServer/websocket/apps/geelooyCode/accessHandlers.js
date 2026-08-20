// B"H
// Boruch Hashem
// Blessed is He

const { requireOwner } = require("./accessPolicy.js");
const { broadcastRoom } = require("./broadcaster.js");
const {
	accountDigest,
	createCapabilityToken,
	tokenDigest
} = require("./identity.js");
const {
	EVENTS,
	TYPES,
	boundedText,
	projectId,
	shareMode
} = require("./protocol.js");
const { reconcileRoomAccess } = require("./roomAccess.js");

/**
 * @file Applies owner-only public, link, and invited-editor project access changes.
 * @description Chesed opens source and Gevurah measures the opening; the Awtsmoos
 * is beyond both, while Awtsmoos.com rotates every bearer doorway when its mode changes.
 */
async function handleAccessRequest(directory, repository, context, request) {
	if (request.type === TYPES.ACCESS) {
		return updateAccess(directory, repository, context, request.payload);
	}
	if (request.type === TYPES.INVITE) {
		return inviteEditor(directory, repository, context, request.payload);
	}
	return null;
}

async function updateAccess(directory, repository, context, payload) {
	const id = projectId(payload.projectId);
	const mode = shareMode(payload.mode);
	let revealedToken = "";
	await repository.update(id, record => {
		requireOwner(record, context.identity);
		if (mode === "link-view" || mode === "link-edit") {
			revealedToken = createCapabilityToken();
			record.linkTokenDigest = tokenDigest(revealedToken);
		} else {
			record.linkTokenDigest = "";
		}
		record.access = { mode };
	});
	const record = await repository.get(id);
	const room = directory.room(id);
	reconcileRoomAccess(context, room, record);
	broadcastRoom(context, room, EVENTS.ACCESS, {
		projectId: id,
		access: record.access
	});
	return {
		type: "code.access.updated",
		payload: {
			access: record.access,
			token: revealedToken
		}
	};
}

async function inviteEditor(directory, repository, context, payload) {
	const id = projectId(payload.projectId);
	const accountId = boundedText(payload.accountId, "Account id", 200).trim();
	if (!accountId) throw new Error("An account id is required");
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
		projectId: id,
		access: {
			mode: record.access.mode,
			editorCount: record.editorDigests.length
		}
	});
	return {
		type: "code.access.invited",
		payload: {
			editorCount: record.editorDigests.length
		}
	};
}

module.exports = {
	handleAccessRequest
};
