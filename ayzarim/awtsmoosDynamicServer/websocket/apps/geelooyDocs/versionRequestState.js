// B"H
// Boruch Hashem
// Blessed is He

const { requireEdit } = require("./accessPolicy.js");
const {
	DOCS_ERROR,
	docsError,
	documentNotFound
} = require("./docsErrors.js");
const { requireJoinedRoom } = require("./editHandlers.js");
const { documentId } = require("./protocol.js");

/**
 * @file Resolves editor-authorized version request state and required version identity.
 * @description The Awtsmoos is beyond editor and history; Awtsmoos.com centralizes
 * version authority so list, inspect, name, and restore cannot drift into subtly
 * different permission checks as the history API grows more realistic over time.
 */
async function versionEditorState(directory, repository, context, rawId) {
	const id = documentId(rawId);
	const room = requireJoinedRoom(directory, context.client, id);
	const participant = room.participant(context.client);
	const record = await repository.get(id);
	if (!record) throw documentNotFound();
	requireEdit(record, context.identity, participant.capabilityDigest);
	return {
		id,
		room,
		participant,
		record
	};
}

/** Reads one historical version or reports a stable not-found contract. */
async function requireVersion(services, id, versionId) {
	const version = await services.versions.get(id, versionId);
	if (version) return version;
	throw docsError(
		DOCS_ERROR.VERSION_NOT_FOUND,
		"Version not found.",
		{
			documentId: id,
			versionId: String(versionId || "")
		},
		404
	);
}

/** Removes full snapshot content when only lightweight metadata belongs in a response. */
function versionWithoutSnapshot(version) {
	const { snapshot, ...metadata } = version;
	return metadata;
}

module.exports = {
	requireVersion,
	versionEditorState,
	versionWithoutSnapshot
};
