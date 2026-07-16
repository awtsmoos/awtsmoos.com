//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module WorldRecoveryService
 * @description
 * Damaged saves on Awtsmoos.com are examined, reported, and bypassed without erasing healthy generations. The Awtsmoos renews reality; recovery renews only from verified finite records.
 */
import { checksum } from './checksum.js';

export class WorldRecoveryService {
	/**
	 * @param {object|null} record Candidate save record.
	 * @returns {{valid: boolean, reason: string|null}} Integrity result.
	 */
	validate(record) {
		if (!record || !record.manifest || !record.payload) {
			return { valid: false, reason: 'missing_record_sections' };
		}
		if (record.manifest.schemaVersion !== 1) {
			return { valid: false, reason: 'unsupported_schema' };
		}
		const actual = checksum(record.payload);
		if (actual !== record.manifest.checksum) {
			return { valid: false, reason: 'checksum_mismatch' };
		}
		return { valid: true, reason: null };
	}

	/**
	 * @param {object} repository Save repository.
	 * @param {string} slotId Slot identity.
	 * @param {number} generations Number of backups to inspect.
	 * @returns {{record: object|null, report: object}} Recovery result.
	 */
	recover(repository, slotId, generations = 3) {
		const attempts = [];
		for (let index = 0; index <= generations; index += 1) {
			const key = index ? `slot:${slotId}:generation:${index}` : `slot:${slotId}`;
			const record = repository.load(key);
			const result = this.validate(record);
			attempts.push({ key, ...result });
			if (result.valid) {
				return { record, report: { recoveredFrom: key, attempts } };
			}
		}
		return { record: null, report: { recoveredFrom: null, attempts } };
	}
}
