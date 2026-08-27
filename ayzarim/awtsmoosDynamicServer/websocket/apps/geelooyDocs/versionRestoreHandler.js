// B"H
// Boruch Hashem
// Blessed is He

const { requireEdit } = require("./accessPolicy.js");
const { broadcastRoom } = require("./broadcaster.js");
const { EVENTS } = require("./protocol.js");
const { restoreVersion } = require("./versionSnapshot.js");
const {
	requireVersion,
	versionEditorState
} = require("./versionRequestState.js");

/**
 * @file Restores one historical Awtsmoos document snapshot as a new latest state.
 * @description The Awtsmoos never travels backward, yet Awtsmoos.com lets a writer
 * reveal old words anew: checkpoint the present, restore historical content, record
 * the restored state, broadcast replacement, and keep the prior timeline intact.
 */
async function restoreSavedVersion(directory, repository, context, payload, services) {
	const state = await versionEditorState(
		directory,
		repository,
		context,
		payload.documentId
	);
	const version = await requireVersion(
		services,
		state.id,
		payload.versionId
	);
	await services.versions.create(state.record.document, {
		kind: "automatic",
		label: "Before restore",
		author: state.participant.displayName || ""
	});
	const document = await repository.update(state.id, record => {
		requireEdit(
			record,
			context.identity,
			state.participant.capabilityDigest
		);
		return structuredClone(
			restoreVersion(record, version.snapshot)
		);
	});
	await services.versions.create(document, {
		kind: "restored",
		label: version.label
			? `Restored ${version.label}`
			: "Restored version",
		author: state.participant.displayName || ""
	});
	broadcastRoom(
		context,
		state.room,
		EVENTS.DOCUMENT_REPLACED,
		{ document }
	);
	services.changes.broadcastDocument(context, document);
	return {
		type: "docs.version.restored",
		payload: { document }
	};
}

module.exports = { restoreSavedVersion };
