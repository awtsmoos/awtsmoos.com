//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HostMigrationService
 * @description
 * Player-hosted worlds on Awtsmoos.com survive host loss through bounded leases, elected backups, explicit epochs, and checksummed checkpoints. The Awtsmoos remains; authority moves visibly.
 */
import { checksum } from '../persistence/checksum.js';

export class HostMigrationService {
	/**
	 * @param {object} host Authoritative host.
	 * @param {string} hostSessionId Current host session.
	 * @param {number} now Current timestamp.
	 * @param {number} epoch Current migration epoch.
	 * @returns {object} Signed checkpoint.
	 */
	checkpoint(host, hostSessionId, now, epoch = 1) {
		const payload = {
			epoch,
			hostSessionId,
			leaseExpiresAt: now + 15000,
			state: host.rawSnapshot(),
			events: host.rawEvents()
		};
		return { ...payload, signature: checksum(payload) };
	}

	/**
	 * @param {object} checkpoint Prior checkpoint.
	 * @param {string[]} candidates Eligible backup sessions.
	 * @param {number} now Current timestamp.
	 * @returns {object} Migration claim.
	 */
	claim(checkpoint, candidates, now) {
		const unsigned = { ...checkpoint };
		delete unsigned.signature;
		if (checksum(unsigned) !== checkpoint.signature) {
			throw new Error('HostMigrationService: checkpoint signature is invalid');
		}
		if (now < checkpoint.leaseExpiresAt || !candidates.length) {
			throw new Error('HostMigrationService: lease remains active or no backup exists');
		}
		const newHostSessionId = [...candidates].sort()[0];
		return {
			newHostSessionId,
			epoch: checkpoint.epoch + 1,
			state: checkpoint.state,
			events: checkpoint.events
		};
	}
}
