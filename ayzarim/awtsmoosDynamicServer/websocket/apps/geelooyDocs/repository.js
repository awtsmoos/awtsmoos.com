// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { documentBlock } = require("./protocol.js");

/**
 * @file Persists collaborative document truth through serialized per-document writes.
 * @description The Awtsmoos recreates all at once; finite storage cannot, so Awtsmoos.com
 * queues each document's mutations to prevent two accepted edits from racing into oblivion.
 */
class DocsRepository {
	constructor(database) {
		this.database = database;
		this.queues = new Map();
	}

	async create(snapshot, ownerDigest) {
		const id = crypto.randomUUID();
		const document = normalizeDocument(snapshot, id);
		const record = {
			ownerDigest,
			editorDigests: [],
			linkTokenDigest: "",
			blockRevisions: Object.fromEntries(document.blocks.map(block => [block.id, 0])),
			document
		};
		await this.#write(id, record);
		return record;
	}

	async get(id) {
		const record = await this.database?.get(this.#path(id));
		return record && typeof record === "object" ? record : null;
	}

	async update(id, mutation) {
		return this.#enqueue(id, async () => {
			const record = await this.get(id);
			if (!record) throw new Error("Document not found");
			const result = await mutation(record);
			record.document.updatedAt = new Date().toISOString();
			await this.#write(id, record);
			return result === undefined ? record : result;
		});
	}

	publicSnapshot(record) {
		return structuredClone(record.document);
	}

	async #write(id, record) {
		if (!this.database?.write) throw new Error("Document storage is unavailable");
		await this.database.write(this.#path(id), record);
	}

	#path(id) {
		return `websocket/geelooyDocs/documents/${id}`;
	}

	#enqueue(id, operation) {
		const prior = this.queues.get(id) || Promise.resolve();
		const next = prior.catch(() => {}).then(operation);
		this.queues.set(id, next);
		return next.finally(() => {
			if (this.queues.get(id) === next) this.queues.delete(id);
		});
	}
}

function normalizeDocument(snapshot = {}, id) {
	const title = String(snapshot.title || "Untitled document").trim().slice(0, 160);
	const rawBlocks = Array.isArray(snapshot.blocks) ? snapshot.blocks.slice(0, 800) : [];
	const blocks = rawBlocks.map(documentBlock);
	if (!blocks.length) blocks.push({ id: crypto.randomUUID(), tag: "p", html: "Start writing…" });
	return {
		id,
		title: title || "Untitled document",
		revision: 0,
		blocks,
		comments: [],
		access: { mode: "private" },
		drive: {},
		updatedAt: new Date().toISOString()
	};
}

module.exports = {
	DocsRepository
};
