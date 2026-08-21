// B"H
// Boruch Hashem
// Blessed is He

const { requireEdit } = require("./accessPolicy.js");
const { broadcastRoom } = require("./broadcaster.js");
const {
	DOCS_ERROR,
	docsError,
	documentConflict,
	invalidInput
} = require("./docsErrors.js");
const { EVENTS, TYPES, boundedText, documentBlock, documentId } = require("./protocol.js");

/**
 * @file Applies conflict-aware block/title mutations, then feeds history and live publication.
 * @description The Awtsmoos renews all words without collision; Awtsmoos.com compares
 * finite block revisions first and reports machine-readable conflict evidence so a
 * client may rebase or reload deliberately instead of treating collaboration as failure.
 */
async function handleEditRequest(directory, repository, context, request, services) {
	if (request.type === TYPES.PATCH) {
		return patchBlocks(directory, repository, context, request.payload || {}, services);
	}
	if (request.type === TYPES.TITLE) {
		return changeTitle(directory, repository, context, request.payload || {}, services);
	}
	return null;
}

async function patchBlocks(directory, repository, context, payload, services) {
	const id = documentId(payload.documentId);
	const room = requireJoinedRoom(directory, context.client, id);
	const participant = room.participant(context.client);
	const baseRevision = nonNegativeRevision(payload.revision);
	const blocks = Array.isArray(payload.blocks)
		? payload.blocks.slice(0, 80).map(documentBlock)
		: [];
	if (!blocks.length) {
		throw invalidInput("blocks", "At least one changed block is required.");
	}
	const result = await repository.update(id, record => {
		requireEdit(record, context.identity, participant.capabilityDigest);
		assertNoBlockConflict(record, blocks, baseRevision);
		const byId = new Map(record.document.blocks.map(block => [block.id, block]));
		for (const block of blocks) byId.set(block.id, block);
		record.document.blocks = Array.from(byId.values());
		record.document.revision += 1;
		record.blockRevisions ||= {};
		for (const block of blocks) {
			record.blockRevisions[block.id] = record.document.revision;
		}
		return { revision: record.document.revision, blocks };
	});
	broadcastRoom(context, room, EVENTS.DOCUMENT, { documentId: id, ...result }, context.client);
	await services.changes.afterMutation(context, id, participant.displayName || "");
	return { type: "docs.document.patched", payload: { revision: result.revision } };
}

async function changeTitle(directory, repository, context, payload, services) {
	const id = documentId(payload.documentId);
	const room = requireJoinedRoom(directory, context.client, id);
	const participant = room.participant(context.client);
	const title = boundedText(
		payload.title,
		"Document title",
		160,
		"Untitled document"
	) || "Untitled document";
	const result = await repository.update(id, record => {
		requireEdit(record, context.identity, participant.capabilityDigest);
		record.document.title = title;
		record.document.revision += 1;
		return { revision: record.document.revision, title };
	});
	broadcastRoom(context, room, EVENTS.DOCUMENT, { documentId: id, ...result }, context.client);
	await services.changes.afterMutation(context, id, participant.displayName || "");
	return { type: "docs.document.titled", payload: result };
}

function requireJoinedRoom(directory, client, id) {
	const room = directory.findByClient(client);
	if (!room || room.documentId !== id) {
		throw docsError(
			DOCS_ERROR.JOIN_REQUIRED,
			"Join the document before editing.",
			{ documentId: id },
			409
		);
	}
	return room;
}

function nonNegativeRevision(value) {
	const revision = Number(value);
	if (!Number.isSafeInteger(revision) || revision < 0) {
		throw invalidInput("revision", "Invalid document revision.");
	}
	return revision;
}

function assertNoBlockConflict(record, blocks, baseRevision) {
	for (const block of blocks) {
		const serverRevision = record.blockRevisions?.[block.id] || 0;
		if (serverRevision <= baseRevision) continue;
		throw documentConflict({
			blockId: block.id,
			clientRevision: baseRevision,
			serverRevision
		});
	}
}

module.exports = { handleEditRequest, requireJoinedRoom };
