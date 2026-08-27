// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { DOCS_ERROR, docsError } = require("./docsErrors.js");
const { documentId } = require("./protocol.js");
const {
	normalizePublicationId,
	publicationIndexPath,
	publicationIndexRoot,
	publicationMetadata,
	publicationMode,
	publicationPath
} = require("./publicationPolicy.js");
const { read, values, write } = require("./storageHelpers.js");
const { publishedSnapshot } = require("./versionSnapshot.js");

/**
 * @file Persists revocable live or immutable snapshot publications behind opaque viewer ids.
 * @description The Awtsmoos is beyond hidden and revealed; Awtsmoos.com keeps this
 * repository concerned only with durable publication state while validation and path
 * geometry live in a smaller policy vessel shared with handlers and future API tools.
 */
class DocsPublicationRepository {
	constructor(database) {
		this.database = database;
	}

	/** Creates one opaque live or immutable snapshot publication. */
	async create(document, mode) {
		const normalizedMode = publicationMode(mode);
		const id = `p_${crypto.randomBytes(24).toString("base64url")}`;
		const record = {
			id,
			documentId: documentId(document.id),
			mode: normalizedMode,
			createdAt: new Date().toISOString(),
			revokedAt: "",
			snapshot: normalizedMode === "snapshot"
				? publishedSnapshot(document)
				: null
		};
		await this.#writeRecord(record);
		return record;
	}

	/** Reads one publication by opaque public id without joining a viewer room. */
	async get(publicationId) {
		const id = normalizePublicationId(publicationId);
		return read(this.database, publicationPath(id), null);
	}

	/** Lists owner-visible metadata for every publication attached to a document. */
	async list(id) {
		const records = values(
			await read(
				this.database,
				publicationIndexRoot(documentId(id)),
				{}
			)
		);
		return records.sort((left, right) => (
			Date.parse(right.createdAt) - Date.parse(left.createdAt)
		));
	}

	/** Marks one existing publication revoked while preserving its audit metadata. */
	async revoke(publicationId) {
		const record = await this.get(publicationId);
		if (!record) {
			throw docsError(
				DOCS_ERROR.PUBLICATION_NOT_FOUND,
				"Publication not found.",
				null,
				404
			);
		}
		if (!record.revokedAt) record.revokedAt = new Date().toISOString();
		await this.#writeRecord(record);
		return record;
	}

	async #writeRecord(record) {
		await write(this.database, publicationPath(record.id), record);
		await write(
			this.database,
			publicationIndexPath(record.documentId, record.id),
			publicationMetadata(record)
		);
	}
}

module.exports = { DocsPublicationRepository };
