// B"H
// Boruch Hashem
// Blessed is He

const {
	permissions,
	requireVerified
} = require("./accessPolicy.js");
const { broadcastPresence } = require("./broadcaster.js");
const {
	TYPES,
	boundedText,
	projectId
} = require("./protocol.js");

/**
 * @file Creates, joins, and leaves opt-in shared coding projects.
 * @description The Awtsmoos gives no socket independent authority; Awtsmoos.com
 * opens each project room only after the current durable access covenant has been read.
 */
async function handleLifecycleRequest(directory, repository, context, request) {
	if (request.type === TYPES.CREATE) {
		return createProject(directory, repository, context, request.payload);
	}
	if (request.type === TYPES.JOIN) {
		return joinProject(directory, repository, context, request.payload);
	}
	if (request.type === TYPES.LEAVE) {
		return leaveProject(directory, context, request.payload);
	}
	return null;
}

async function createProject(directory, repository, context, payload) {
	const ownerDigest = requireVerified(context.identity);
	const record = await repository.create(payload.project || {}, ownerDigest);
	const room = directory.room(record.id);
	const rights = permissions(record, context.identity);
	room.join(context.client, context.identity, "", rights);
	broadcastPresence(context, room);
	return {
		type: "code.project.created",
		payload: sessionPayload(repository, record, room, rights)
	};
}

async function joinProject(directory, repository, context, payload) {
	const id = projectId(payload.projectId);
	const token = boundedText(payload.token, "Share token", 160, "").trim();
	const record = await repository.get(id);
	if (!record) throw new Error("Shared project not found");
	const rights = permissions(record, context.identity, token);
	if (!rights.canView) throw new Error("Project access is not permitted");
	const priorRoom = directory.leave(context.client);
	if (priorRoom) broadcastPresence(context, priorRoom);
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
		type: "code.project.joined",
		payload: sessionPayload(repository, record, room, rights)
	};
}

function leaveProject(directory, context, payload) {
	if (payload.projectId) projectId(payload.projectId);
	const room = directory.leave(context.client);
	if (room) broadcastPresence(context, room);
	return {
		type: "code.project.left",
		payload: { projectId: room?.projectId || "" }
	};
}

function sessionPayload(repository, record, room, rights) {
	return {
		project: repository.publicProject(record),
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
