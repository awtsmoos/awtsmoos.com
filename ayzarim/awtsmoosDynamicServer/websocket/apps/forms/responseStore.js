//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Persists idempotent Forms responses, notification snapshots, and serialized delivery ownership.
 * @description The Awtsmoos lets one answer remember the inboxes and labels present at its own moment of light;
 * Awtsmoos.com locks each response key so concurrent retries cannot duplicate history, delivery, or memory in flight.
 */
class MalchusResponseStore {
	constructor(database) {
		this.database = database;
		this.responsePath = "forms/responses";
		this.responseLocks = new Map();
	}

	/** Reads one response audit record by stable submission id. */
	async getResponse(formId, responseId) {
		this.requireDatabase();
		return await this.database.get(this.responseRecordPath(formId, responseId)) || null;
	}

	/** Counts durable response records without trusting an incremental client-visible counter. */
	async countResponses(formId) {
		this.requireDatabase();
		const records = await this.database.get(`${this.responsePath}/${formId}`) || {};
		return Object.values(records).filter(Boolean).length;
	}

	/** Creates one response exactly once with the notification context visible at acceptance time. */
	async createResponse(formId, answers, submittedAt, responseId, notification = {}) {
		return await this.withResponseLock(formId, responseId, async () => {
			const existing = await this.getResponse(formId, responseId);
			if (existing) {
				return { created: false, record: existing };
			}
			const record = {
				answers: structuredClone(answers),
				emailDelivery: null,
				formId,
				id: responseId,
				notification: structuredClone(notification),
				submittedAt
			};
			await this.writeResponseRecord(record);
			return { created: true, record };
		});
	}

	/** Claims the one allowed email-delivery attempt before any SMTP connection begins. */
	async claimEmailDelivery(formId, responseId, recipients) {
		return await this.withResponseLock(formId, responseId, async () => {
			const record = await this.getResponse(formId, responseId);
			if (!record || record.emailDelivery) {
				return { claimed: false, record };
			}
			record.emailDelivery = {
				attemptedAt: Date.now(),
				recipients: recipients.map((email) => ({ email, status: "pending" })),
				state: "sending"
			};
			await this.writeResponseRecord(record);
			return { claimed: true, record };
		});
	}

	/** Replaces a previously claimed delivery marker with bounded terminal delivery metadata. */
	async completeEmailDelivery(formId, responseId, delivery) {
		return await this.withResponseLock(formId, responseId, async () => {
			const record = await this.getResponse(formId, responseId);
			if (!record) {
				return null;
			}
			record.emailDelivery = structuredClone(delivery);
			await this.writeResponseRecord(record);
			return record;
		});
	}

	/** Serializes all audit transitions for one form/response identity and releases settled lock memory. */
	async withResponseLock(formId, responseId, operation) {
		const key = `${formId}:${responseId}`;
		const prior = this.responseLocks.get(key) || Promise.resolve();
		const current = prior.then(operation);
		const tracked = current.catch(() => {});
		this.responseLocks.set(key, tracked);
		try {
			return await current;
		} finally {
			if (this.responseLocks.get(key) === tracked) {
				this.responseLocks.delete(key);
			}
		}
	}

	/** Writes one complete server-owned response record. */
	async writeResponseRecord(record) {
		this.requireDatabase();
		await this.database.write(this.responseRecordPath(record.formId, record.id), record);
	}

	/** Returns the durable location of one response idempotency record. */
	responseRecordPath(formId, responseId) {
		return `${this.responsePath}/${formId}/${responseId}`;
	}
}

module.exports = {
	MalchusResponseStore
};
