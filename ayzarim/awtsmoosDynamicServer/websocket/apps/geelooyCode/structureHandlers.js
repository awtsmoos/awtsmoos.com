// B"H
// Boruch Hashem
// Blessed is He

const { requireEdit } = require("./accessPolicy.js");
const { requireJoinedRoom } = require("./editHandlers.js");
const { normalizeProjectPath } = require("./pathPolicy.js");
const { MAX_FILE_SIZE } = require("./projectNormalizer.js");
const {
	TYPES,
	projectId,
	revision
} = require("./protocol.js");
const { structureResponse } = require("./structureEvents.js");

/**
 * @file Applies exact-revision create, rename, and delete operations to a shared source tree.
 * @description The Awtsmoos is beyond file structure; Awtsmoos.com makes structural
 * changes stricter than text splices so two competing renames never silently cross paths.
 */
async function handleStructureRequest(directory, repository, context, request) {
	if (request.type === TYPES.FILE_CREATE) {
		return createFile(directory, repository, context, request.payload);
	}
	if (request.type === TYPES.FILE_RENAME) {
		return renameFile(directory, repository, context, request.payload);
	}
	if (request.type === TYPES.FILE_DELETE) {
		return deleteFile(directory, repository, context, request.payload);
	}
	return null;
}

async function createFile(directory, repository, context, payload) {
	const id = projectId(payload.projectId);
	const room = requireJoinedRoom(directory, context.client, id);
	const participant = room.participant(context.client);
	const path = normalizeProjectPath(payload.path);
	const content = String(payload.content || "");
	if (content.length > MAX_FILE_SIZE) throw new Error("Shared file is too large");
	const projectRevision = await repository.update(id, record => {
		requireEdit(record, context.identity, participant.capabilityDigest);
		if (record.files[path]) throw new Error("Shared file already exists");
		record.files[path] = emptyFile(content);
		record.revision += 1;
		return record.revision;
	});
	return structureResponse(context, room, "create", id, projectRevision, {
		path,
		content
	});
}

async function renameFile(directory, repository, context, payload) {
	const id = projectId(payload.projectId);
	const room = requireJoinedRoom(directory, context.client, id);
	const participant = room.participant(context.client);
	const path = normalizeProjectPath(payload.path);
	const nextPath = normalizeProjectPath(payload.nextPath);
	const expected = revision(payload.projectRevision, "Project revision");
	const projectRevision = await repository.update(id, record => {
		requireEdit(record, context.identity, participant.capabilityDigest);
		requireProjectRevision(record, expected);
		if (!record.files[path]) throw new Error("Shared file not found");
		if (record.files[nextPath]) throw new Error("Rename target already exists");
		record.files[nextPath] = record.files[path];
		delete record.files[path];
		record.revision += 1;
		return record.revision;
	});
	return structureResponse(context, room, "rename", id, projectRevision, {
		path,
		nextPath
	});
}

async function deleteFile(directory, repository, context, payload) {
	const id = projectId(payload.projectId);
	const room = requireJoinedRoom(directory, context.client, id);
	const participant = room.participant(context.client);
	const path = normalizeProjectPath(payload.path);
	const expected = revision(payload.projectRevision, "Project revision");
	const projectRevision = await repository.update(id, record => {
		requireEdit(record, context.identity, participant.capabilityDigest);
		requireProjectRevision(record, expected);
		if (!record.files[path]) throw new Error("Shared file not found");
		delete record.files[path];
		record.revision += 1;
		return record.revision;
	});
	return structureResponse(context, room, "delete", id, projectRevision, { path });
}

function requireProjectRevision(record, expected) {
	if (record.revision !== expected) {
		throw new Error("Project structure changed; refresh before retrying");
	}
}

function emptyFile(content) {
	return {
		content,
		revision: 0,
		historyBaseRevision: 0,
		history: []
	};
}

module.exports = {
	handleStructureRequest
};
