//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DedicatedWorldRepository
 * @description
 * Long-lived worlds on Awtsmoos.com receive checksummed checkpoints, bounded backups, and explicit rollback records. The Awtsmoos is never corrupted; finite disks must prove what they restore.
 */
import { checksum } from '../../js/persistence/checksum.js';

export class DedicatedWorldRepository {
	/**
	 * @param {object} adapter Key-value persistence adapter.
	 * @param {number} backupLimit Retained checkpoint generations.
	 */
	constructor(adapter, backupLimit = 5) {
		this.adapter = adapter;
		this.backupLimit = backupLimit;
	}

	/**
	 * @param {string} worldId World identity.
	 * @param {object} payload Canonical snapshot and event tail.
	 * @returns {object} Persisted checkpoint.
	 */
	save(worldId, payload) {
		const existing = this.adapter.load(this.key(worldId));
		if (existing) {
			this.rotate(worldId, existing);
		}
		const checkpoint = {
			worldId,
			createdAt: payload.state.revision,
			payload,
			checksum: checksum(payload),
			rollbackOf: null
		};
		this.adapter.save(this.key(worldId), checkpoint);
		return checkpoint;
	}

	/**
	 * @param {string} worldId World identity.
	 * @returns {object|null} Valid checkpoint.
	 */
	load(worldId) {
		const checkpoint = this.adapter.load(this.key(worldId));
		if (!checkpoint || checksum(checkpoint.payload) !== checkpoint.checksum) {
			return null;
		}
		return checkpoint;
	}

	/**
	 * @param {string} worldId World identity.
	 * @param {number} generation Backup generation.
	 * @returns {object} Explicit rollback checkpoint.
	 */
	rollback(worldId, generation) {
		const backup = this.adapter.load(`${this.key(worldId)}:backup:${generation}`);
		if (!backup || checksum(backup.payload) !== backup.checksum) {
			throw new Error('DedicatedWorldRepository: backup is missing or corrupt');
		}
		const restored = {
			...backup,
			rollbackOf: this.load(worldId)?.checksum || null
		};
		this.adapter.save(this.key(worldId), restored);
		return restored;
	}

	rotate(worldId, current) {
		for (let index = this.backupLimit; index > 1; index -= 1) {
			const prior = this.adapter.load(`${this.key(worldId)}:backup:${index - 1}`);
			if (prior) {
				this.adapter.save(`${this.key(worldId)}:backup:${index}`, prior);
			}
		}
		this.adapter.save(`${this.key(worldId)}:backup:1`, current);
	}

	key(worldId) {
		return `dedicated-world:${worldId}`;
	}
}
