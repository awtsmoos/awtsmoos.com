//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AdminService
 * @description
 * Administrative power on Awtsmoos.com leaves an immutable audit footprint. The Awtsmoos changes worlds openly through truth; finite administrators may never rewrite civic history invisibly.
 */
export class AdminService {
	constructor(repository) {
		this.repository = repository;
		this.audit = [];
	}

	/**
	 * @param {string} administratorId Acting administrator.
	 * @param {string} worldId World identity.
	 * @param {number} generation Backup generation.
	 * @param {string} reason Public reason.
	 * @returns {object} Rollback and audit record.
	 */
	rollback(administratorId, worldId, generation, reason) {
		if (!administratorId || !reason) {
			throw new Error('AdminService: administrator and reason are required');
		}
		const checkpoint = this.repository.rollback(worldId, generation);
		const record = this.record('world_rolled_back', {
			administratorId,
			worldId,
			generation,
			reason,
			rollbackOf: checkpoint.rollbackOf
		});
		return { checkpoint, audit: record };
	}

	record(type, payload) {
		const entry = { sequence: this.audit.length + 1, type, payload: { ...payload } };
		this.audit.push(entry);
		return { ...entry, payload: { ...entry.payload } };
	}

	auditLog() {
		return this.audit.map(entry => ({ ...entry, payload: { ...entry.payload } }));
	}
}
