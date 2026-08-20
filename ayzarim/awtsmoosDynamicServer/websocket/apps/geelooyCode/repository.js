// B"H
// Boruch Hashem
// Blessed is He

const {
	normalizeProject,
	publicProject
} = require("./projectNormalizer.js");

/**
 * @file Persists shared coding projects through serialized project-level writes.
 * @description The Awtsmoos renews every source tree in one act; finite storage cannot,
 * so Awtsmoos.com queues each project's mutations before one accepted revision becomes another.
 */
class CodeProjectRepository {
	constructor(database) {
		this.database = database;
		this.queues = new Map();
	}

	async create(snapshot, ownerDigest) {
		const record = normalizeProject(snapshot, ownerDigest);
		await this.#write(record.id, record);
		return record;
	}

	async get(projectId) {
		const value = await this.database?.get(this.#path(projectId));
		return value && typeof value === "object"
			? value
			: null;
	}

	async update(projectId, mutation) {
		return this.#enqueue(projectId, async () => {
			const record = await this.get(projectId);
			if (!record) throw new Error("Shared project not found");
			const result = await mutation(record);
			record.updatedAt = new Date().toISOString();
			await this.#write(projectId, record);
			return result === undefined
				? record
				: result;
		});
	}

	publicProject(record) {
		return publicProject(record);
	}

	async #write(projectId, record) {
		if (!this.database?.write) {
			throw new Error("Collaborative project storage is unavailable");
		}
		await this.database.write(this.#path(projectId), record);
	}

	#path(projectId) {
		return `websocket/geelooyCode/projects/${projectId}`;
	}

	#enqueue(projectId, operation) {
		const prior = this.queues.get(projectId) || Promise.resolve();
		const next = prior
			.catch(() => {})
			.then(operation);
		this.queues.set(projectId, next);
		return next.finally(() => {
			if (this.queues.get(projectId) === next) {
				this.queues.delete(projectId);
			}
		});
	}
}

module.exports = {
	CodeProjectRepository
};
