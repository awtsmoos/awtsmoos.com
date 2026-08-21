// B"H
// Boruch Hashem
// Blessed is He

const { TYPES, boundedText } = require("./protocol.js");
const { restoreSavedVersion } = require("./versionRestoreHandler.js");
const {
	requireVersion,
	versionEditorState,
	versionWithoutSnapshot
} = require("./versionRequestState.js");

/**
 * @file Routes editor-only Awtsmoos version list, inspect, naming, and restore requests.
 * @description The Awtsmoos is beyond before and after; Awtsmoos.com leaves this
 * coordinator thin while authority and restore choreography live in focused vessels,
 * keeping history APIs readable as their capabilities grow rather than knot together.
 */
async function handleVersionRequest(directory, repository, context, request, services) {
	const payload = request.payload || {};
	if (request.type === TYPES.VERSION_LIST) {
		return listVersions(directory, repository, context, payload, services);
	}
	if (request.type === TYPES.VERSION_GET) {
		return getVersion(directory, repository, context, payload, services);
	}
	if (request.type === TYPES.VERSION_NAME) {
		return nameVersion(directory, repository, context, payload, services);
	}
	if (request.type === TYPES.VERSION_RESTORE) {
		return restoreSavedVersion(directory, repository, context, payload, services);
	}
	return null;
}

/** Lists lightweight version metadata after resolving current editor authority. */
async function listVersions(directory, repository, context, payload, services) {
	const state = await versionEditorState(
		directory,
		repository,
		context,
		payload.documentId
	);
	return {
		type: "docs.version.listed",
		payload: {
			documentId: state.id,
			versions: await services.versions.list(state.id)
		}
	};
}

/** Loads one full historical snapshot for version preview. */
async function getVersion(directory, repository, context, payload, services) {
	const state = await versionEditorState(
		directory,
		repository,
		context,
		payload.documentId
	);
	const version = await requireVersion(services, state.id, payload.versionId);
	return {
		type: "docs.version.loaded",
		payload: { version }
	};
}

/** Creates one owner/editor-visible named checkpoint from current document truth. */
async function nameVersion(directory, repository, context, payload, services) {
	const state = await versionEditorState(
		directory,
		repository,
		context,
		payload.documentId
	);
	const version = await services.versions.create(state.record.document, {
		kind: "named",
		label: boundedText(
			payload.label,
			"Version label",
			120,
			"Named version"
		) || "Named version",
		note: boundedText(payload.note, "Version note", 1000, ""),
		author: state.participant.displayName || ""
	});
	return {
		type: "docs.version.named",
		payload: {
			version: versionWithoutSnapshot(version)
		}
	};
}

module.exports = { handleVersionRequest };
