// B"H
// Boruch Hashem
// Blessed is He

const { requireOwner } = require("./accessPolicy.js");
const {
	DOCS_ERROR,
	docsError,
	documentNotFound
} = require("./docsErrors.js");
const { documentId } = require("./protocol.js");
const {
	normalizePublicationId,
	publicationMetadata
} = require("./publicationPolicy.js");

/**
 * @file Executes owner-authorized creation, listing, and revocation of Docs publications.
 * @description The Awtsmoos is beyond owner and viewer; Awtsmoos.com keeps public
 * administration in a dedicated Gevurah vessel so anonymous viewer opening never
 * inherits owner checks, edit state, or mutation authority merely by module proximity.
 */
async function createPublication(repository, context, payload, services) {
	const state = await publicationOwnerState(
		repository,
		context,
		payload.documentId
	);
	const publication = await services.publications.create(
		state.record.document,
		payload.mode
	);
	return {
		type: "docs.publication.created",
		payload: {
			publication: publicationMetadata(publication)
		}
	};
}

/** Lists owner-visible publication metadata without exposing immutable snapshot bodies. */
async function listPublications(repository, context, payload, services) {
	const state = await publicationOwnerState(
		repository,
		context,
		payload.documentId
	);
	return {
		type: "docs.publication.listed",
		payload: {
			publications: await services.publications.list(state.id)
		}
	};
}

/** Revokes a publication only when it belongs to the owner-authorized document. */
async function revokePublication(repository, context, payload, services) {
	const state = await publicationOwnerState(
		repository,
		context,
		payload.documentId
	);
	const publicationId = normalizePublicationId(payload.publicationId);
	const publication = await services.publications.get(publicationId);
	if (!publication || publication.documentId !== state.id) {
		throw docsError(
			DOCS_ERROR.PUBLICATION_NOT_FOUND,
			"Publication not found.",
			{ publicationId },
			404
		);
	}
	await services.publications.revoke(publicationId);
	services.publicationDirectory.revoke(context, publicationId);
	return {
		type: "docs.publication.revoked",
		payload: { publicationId }
	};
}

/** Resolves latest owner authority without requiring an editor room to be joined. */
async function publicationOwnerState(repository, context, rawId) {
	const id = documentId(rawId);
	const record = await repository.get(id);
	if (!record) throw documentNotFound();
	requireOwner(record, context.identity);
	return { id, record };
}

module.exports = {
	createPublication,
	listPublications,
	revokePublication
};
