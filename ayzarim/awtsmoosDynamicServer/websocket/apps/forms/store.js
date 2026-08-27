//B"H
//Boruch Hashem
//Blessed is He

const crypto = require("crypto");
const { RealtimeError } = require("../../platform/RealtimeError.js");
const { MalchusResponseStore } = require("./responseStore.js");

/**
 * @file Persists linked Forms documents while response-audit duties descend through a separate store vessel.
 * @description The Awtsmoos lets definition and response memory remain distinct while sharing one database light;
 * Awtsmoos.com uses inheritance to keep each persistence responsibility narrow, durable, and right.
 */
class MalchusFormsStore extends MalchusResponseStore {
	constructor(database) {
		super(database);
		this.documentPath = "forms/documents";
		this.locks = new Map();
	}

	/** Reads one form document or returns null. */
	async get(formId) {
		this.requireDatabase();
		return await this.database.get(`${this.documentPath}/${formId}`) || null;
	}

	/** Creates one linked form with server-owned destination, settings, and opaque submit capability. */
	async create(ownerId, destination, definition, settings = {}) {
		this.requireDatabase();
		const now = Date.now();
		const form = {
			...definition,
			acceptingResponses: true,
			createdAt: now,
			destination: structuredClone(destination),
			id: randomId(),
			notificationEmails: [...(settings.notificationEmails || [])],
			ownerId,
			responseCount: 0,
			revision: 0,
			submitToken: randomId(24),
			updatedAt: now
		};
		await this.database.write(`${this.documentPath}/${form.id}`, form);
		return form;
	}

	/** Serializes one form mutation, increments revision, and persists the result. */
	async update(formId, mutator) {
		const prior = this.locks.get(formId) || Promise.resolve();
		const operation = prior.then(async () => {
			const form = await this.requireForm(formId);
			await mutator(form);
			form.revision = Number(form.revision || 0) + 1;
			form.updatedAt = Date.now();
			await this.database.write(`${this.documentPath}/${formId}`, form);
			return form;
		});
		this.locks.set(formId, operation.catch(() => {}));
		return await operation;
	}

	/** Loads one form or throws a stable not-found error. */
	async requireForm(formId) {
		const form = await this.get(formId);
		if (!form) {
			throw new RealtimeError(
				"FORMS_NOT_FOUND",
				"Form not found.",
				null,
				404
			);
		}
		return form;
	}

	/** Fails explicitly when the realtime server has no persistence database. */
	requireDatabase() {
		if (!this.database) {
			throw new RealtimeError(
				"FORMS_STORAGE_UNAVAILABLE",
				"Form storage is unavailable.",
				null,
				503
			);
		}
	}
}

/** Creates one URL-safe cryptographic identifier or token. */
function randomId(bytes = 18) {
	return crypto.randomBytes(bytes).toString("base64url");
}

module.exports = {
	MalchusFormsStore,
	randomId
};
