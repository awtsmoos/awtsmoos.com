// B"H
// Boruch Hashem
// Blessed is He

const { requireEdit } = require("./accessPolicy.js");
const { broadcastRoom } = require("./broadcaster.js");
const { EVENTS, TYPES, boundedText, documentBlock, documentId } = require("./protocol.js");

/**
 * @file Applies block and title mutations with conflict-aware revision rules.
 * @description The Awtsmoos renews all words without collision; Awtsmoos.com must
 * compare finite revisions so separate blocks may merge while the same stale block cannot overwrite truth.
 */
async function handleEditRequest(directory, repository, context, request) {
	if (request.type === TYPES.PATCH) {
		return patchBlocks(directory, repository, context, request.payload);
	}
	if (request.type === TYPES.TITLE) {
		return changeTitle(directory, repository, context, request.payload);
	}
	return null;
}

async function patchBlocks(directory, repository, context, payload) {
	const id = documentId(payload.documentId);
	const room = requireJoinedRoom(directory, context.client, id);
	const participant = room.participant(context.client);
	const baseRevision = nonNegativeRevision(payload.revision);
	const blocks = Array.isArray(payload.blocks) ? payload.blocks.slice(0, 80).map(documentBlock) : [];
	if (!blocks.length) throw new Error("At least one changed block is required");
	const result = await repository.update(id, record => {
		requireEdit(record, context.identity, participant.capabilityDigest);
		for (const block of blocks) {
			if ((record.blockRevisions?.[block.id] || 0) > baseRevision) {
				throw new Error(`Document conflict on block ${block.id}`);
			}
		}
		const byId = new Map(record.document.blocks.map(block => [block.id, block]));
		for (const block of blocks) byId.set(block.id, block);
		record.document.blocks = Array.from(byId.values());
		record.document.revision += 1;
		record.blockRevisions ||= {};
		for (const block of blocks) record.blockRevisions[block.id] = record.document.revision;
		return { revision: record.document.revision, blocks };
	});
	broadcastRoom(context, room, EVENTS.DOCUMENT, { documentId: id, ...result }, context.client);
	return { type: "docs.document.patched", payload: { revision: result.revision } };
}

async function changeTitle(directory, repository, context, payload) {
	const id = documentId(payload.documentId);
	const room = requireJoinedRoom(directory, context.client, id);
	const participant = room.participant(context.client);
	const title = boundedText(payload.title, "Document title", 160, "Untitled document") || "Untitled document";
	const result = await repository.update(id, record => {
		requireEdit(record, context.identity, participant.capabilityDigest);
		record.document.title = title;
		record.document.revision += 1;
		return { revision: record.document.revision, title };
	});
	broadcastRoom(context, room, EVENTS.DOCUMENT, { documentId: id, ...result }, context.client);
	return { type: "docs.document.titled", payload: result };
}

function requireJoinedRoom(directory, client, id) {
	const room = directory.findByClient(client);
	if (!room || room.documentId !== id) throw new Error("Join the document before editing");
	return room;
}

function nonNegativeRevision(value) {
	const revision = Number(value);
	if (!Number.isSafeInteger(revision) || revision < 0) throw new Error("Invalid document revision");
	return revision;
}

module.exports = {
	handleEditRequest,
	requireJoinedRoom
};
