// B"H
// Boruch Hashem
// Blessed is He

const { requireEdit } = require("./accessPolicy.js");
const { broadcastRoom } = require("./broadcaster.js");
const { mutateFile } = require("./fileMutation.js");
const { normalizeProjectPath } = require("./pathPolicy.js");
const {
	EVENTS,
	TYPES,
	projectId,
	revision
} = require("./protocol.js");

/**
 * @file Applies revisioned source splices and returns authoritative file snapshots on demand.
 * @description The Awtsmoos loses no letter when editors meet; Awtsmoos.com transforms
 * disjoint changes, rejects overlapping guesses, and keeps explicit sync as the path back to truth.
 */
async function handleEditRequest(directory, repository, context, request) {
	if (request.type === TYPES.PATCH) {
		return patchFile(directory, repository, context, request.payload);
	}
	if (request.type === TYPES.SYNC) {
		return syncFile(directory, repository, context, request.payload);
	}
	return null;
}

async function patchFile(directory, repository, context, payload) {
	const id = projectId(payload.projectId);
	const path = normalizeProjectPath(payload.path);
	const room = requireJoinedRoom(directory, context.client, id);
	const participant = room.participant(context.client);
	const baseRevision = revision(payload.baseRevision, "File revision");
	const result = await repository.update(id, record => {
		requireEdit(record, context.identity, participant.capabilityDigest);
		const file = record.files?.[path];
		if (!file) throw new Error("Shared file not found");
		return mutateFile(file, baseRevision, payload.operation);
	});
	broadcastRoom(context, room, EVENTS.FILE, {
		projectId: id,
		path,
		revision: result.revision,
		operation: result.operation
	}, context.client);
	return {
		type: "code.file.patched",
		payload: {
			path,
			revision: result.revision,
			operation: result.operation
		}
	};
}

async function syncFile(directory, repository, context, payload) {
	const id = projectId(payload.projectId);
	const path = normalizeProjectPath(payload.path);
	const room = requireJoinedRoom(directory, context.client, id);
	const participant = room.participant(context.client);
	const record = await repository.get(id);
	if (!record) throw new Error("Shared project not found");
	requireEdit(record, context.identity, participant.capabilityDigest);
	const file = record.files?.[path];
	if (!file) throw new Error("Shared file not found");
	return {
		type: "code.file.synced",
		payload: {
			path,
			content: file.content,
			revision: file.revision
		}
	};
}

function requireJoinedRoom(directory, client, id) {
	const room = directory.findByClient(client);
	if (!room || room.projectId !== id) {
		throw new Error("Join the project before editing");
	}
	return room;
}

module.exports = {
	handleEditRequest,
	requireJoinedRoom
};
