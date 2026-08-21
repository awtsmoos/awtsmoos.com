// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { DOCS_ERROR, docsError } = require("./docsErrors.js");
const { boundedText, documentId } = require("./protocol.js");
const { read, remove, values, write } = require("./storageHelpers.js");
const {
	AUTO_INTERVAL_MS,
	MAX_AUTOMATIC,
	MAX_NAMED,
	newestVersionFirst,
	normalizeVersionId,
	normalizeVersionKind,
	versionMetadata,
	versionRootPath
} = require("./versionPolicy.js");
const { versionSnapshot } = require("./versionSnapshot.js");

/**
 * @file Persists bounded append-only Awtsmoos document history apart from live revisions.
 * @description The Awtsmoos is beyond before and after; Awtsmoos.com leaves this
 * repository only persistence and pruning work while identity, limits, and ordering
 * live in a dedicated policy vessel that can evolve without hiding storage behavior.
 */
class DocsVersionRepository {
	constructor(database) {
		this.database = database;
		this.lastAutomaticAt = new Map();
	}

	/** Coalesces automatic checkpoints so keystrokes do not become unbounded history rows. */
	async checkpointAutomatic(document, author = "") {
		const now = Date.now();
		const last = this.lastAutomaticAt.get(document.id) || 0;
		if (now - last < AUTO_INTERVAL_MS) return null;
		this.lastAutomaticAt.set(document.id, now);
		return this.create(document, { kind: "automatic", author });
	}

	/** Creates one immutable historical snapshot with bounded metadata. */
	async create(document, metadata = {}) {
		const id = `v_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
		const kind = normalizeVersionKind(metadata.kind);
		if (kind === "named") await this.#requireNamedCapacity(document.id);
		const record = {
			id,
			documentId: documentId(document.id),
			revision: Number(document.revision) || 0,
			kind,
			label: boundedText(metadata.label, "Version label", 120, ""),
			note: boundedText(metadata.note, "Version note", 1000, ""),
			author: boundedText(metadata.author, "Version author", 48, ""),
			createdAt: new Date().toISOString(),
			snapshot: versionSnapshot(document)
		};
		await write(this.database, `${versionRootPath(document.id)}/${id}`, record);
		if (kind === "automatic") await this.#pruneAutomatic(document.id);
		return record;
	}

	/** Lists lightweight history metadata without copying every full snapshot. */
	async list(id) {
		const records = values(
			await read(this.database, versionRootPath(documentId(id)), {})
		);
		return records.sort(newestVersionFirst).map(versionMetadata);
	}

	/** Reads one full version snapshot for inspection or restore. */
	async get(id, versionId) {
		const key = normalizeVersionId(versionId);
		return read(
			this.database,
			`${versionRootPath(documentId(id))}/${key}`,
			null
		);
	}

	async #requireNamedCapacity(id) {
		const count = (await this.list(id))
			.filter(item => item.kind === "named")
			.length;
		if (count < MAX_NAMED) return;
		throw docsError(
			DOCS_ERROR.VERSION_LIMIT,
			"This document reached the named-version limit.",
			{ maximum: MAX_NAMED, count },
			409
		);
	}

	async #pruneAutomatic(id) {
		const records = values(
			await read(this.database, versionRootPath(documentId(id)), {})
		)
			.filter(item => item.kind === "automatic")
			.sort(newestVersionFirst);
		for (const record of records.slice(MAX_AUTOMATIC)) {
			await remove(this.database, `${versionRootPath(id)}/${record.id}`);
		}
	}
}

module.exports = { DocsVersionRepository };
