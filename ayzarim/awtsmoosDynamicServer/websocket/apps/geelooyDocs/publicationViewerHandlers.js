// B"H
// Boruch Hashem
// Blessed is He

const {
	DOCS_ERROR,
	docsError,
	publicationRevoked
} = require("./docsErrors.js");
const { normalizePublicationId } = require("./publicationPolicy.js");
const { publishedSnapshot } = require("./versionSnapshot.js");

/**
 * @file Opens and closes viewer-only live or snapshot Awtsmoos publications.
 * @description Chesed reveals without edit authority; the Awtsmoos is beyond both,
 * while Awtsmoos.com gives anonymous viewers only public metadata and sanitized
 * document light, with explicit 404/410 semantics for absence and permanent revocation.
 */
async function openPublication(repository, context, payload, services) {
	const publicationId = normalizePublicationId(payload.publicationId);
	const publication = await services.publications.get(publicationId);
	if (!publication) {
		throw docsError(
			DOCS_ERROR.PUBLICATION_NOT_FOUND,
			"Publication not found.",
			{ publicationId },
			404
		);
	}
	if (publication.revokedAt) throw publicationRevoked(publicationId);
	services.publicationDirectory.leaveAll(context.client);
	let document = publication.snapshot;
	if (publication.mode === "live") {
		document = await liveDocument(
			repository,
			publication,
			publicationId
		);
		services.publicationDirectory.join(context.client, publication);
	}
	return {
		type: "docs.publication.opened",
		payload: {
			publication: publicPublicationMetadata(publication),
			document
		}
	};
}

/** Leaves one viewer room while keeping the underlying publication unchanged. */
function closePublication(context, payload, services) {
	const publicationId = normalizePublicationId(payload.publicationId);
	services.publicationDirectory.leave(context.client, publicationId);
	return {
		type: "docs.publication.closed",
		payload: { publicationId }
	};
}

/** Reads current live document truth or reports permanent public unavailability. */
async function liveDocument(repository, publication, publicationId) {
	const record = await repository.get(publication.documentId);
	if (record) return publishedSnapshot(record.document);
	throw docsError(
		DOCS_ERROR.PUBLICATION_UNAVAILABLE,
		"Published document is no longer available.",
		{ publicationId },
		410
	);
}

/** Restricts viewer metadata to public identity, mode, and creation time. */
function publicPublicationMetadata(publication) {
	return {
		id: publication.id,
		mode: publication.mode,
		createdAt: publication.createdAt
	};
}

module.exports = {
	closePublication,
	openPublication
};
