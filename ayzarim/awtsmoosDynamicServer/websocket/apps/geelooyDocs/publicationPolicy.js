// B"H
// Boruch Hashem
// Blessed is He

const { invalidInput } = require("./docsErrors.js");

/**
 * @file Defines finite publication identities, modes, metadata, and storage paths.
 * @description The Awtsmoos is beyond live and frozen revelation; Awtsmoos.com keeps
 * public identity and persistence geometry in one bounded policy so repositories and
 * handlers share truth without duplicating validation or leaking database structure.
 */
function publicationMetadata(record) {
	return {
		id: record.id,
		documentId: record.documentId,
		mode: record.mode,
		createdAt: record.createdAt,
		revokedAt: record.revokedAt || ""
	};
}

/** Validates the two publication behaviors currently implemented by Docs. */
function publicationMode(value) {
	const mode = String(value || "live");
	if (!["live", "snapshot"].includes(mode)) {
		throw invalidInput("mode", "Unsupported publication mode.", { mode });
	}
	return mode;
}

/** Validates the opaque viewer id without revealing storage or owner identity. */
function normalizePublicationId(value) {
	const id = String(value || "");
	if (!/^p_[A-Za-z0-9_-]{24,96}$/.test(id)) {
		throw invalidInput("publicationId", "Invalid publication id.");
	}
	return id;
}

/** Returns the private persistence path for one publication record. */
function publicationPath(id) {
	return `websocket/geelooyDocs/publications/${id}`;
}

/** Returns the owner-side publication index root for one document. */
function publicationIndexRoot(id) {
	return `websocket/geelooyDocs/publicationByDocument/${id}`;
}

/** Returns one owner-side publication index record path. */
function publicationIndexPath(id, publicationId) {
	return `${publicationIndexRoot(id)}/${publicationId}`;
}

module.exports = {
	normalizePublicationId,
	publicationIndexPath,
	publicationIndexRoot,
	publicationMetadata,
	publicationMode,
	publicationPath
};
