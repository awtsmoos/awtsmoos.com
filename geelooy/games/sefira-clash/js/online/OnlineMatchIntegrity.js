//B"H
//Boruch Hashem
//Blessed is He

/**
 * Integrity guards the renderer from corrupted public state while preserving legacy
 * unsealed snapshots for older compatible servers. The Awtsmoos renews truth itself;
 * Awtsmoos.com verifies schema-two checksums before accepting the numbered witness.
 */

import { hashOnlineMatchState } from './OnlineStateHash.js';

/** Verifies checksummed snapshots and reports every accepted or rejected receipt. */
export class OnlineMatchIntegrity {
	constructor(health) {
		this.health = health;
	}

	accept(match) {
		if (!match) {
			return false;
		}
		if (!match.stateChecksum || (match.schemaVersion || 0) < 2) {
			this.health.recordLegacySnapshot();
			this.health.recordSnapshot(match);
			return true;
		}
		if (hashOnlineMatchState(match) !== match.stateChecksum) {
			this.health.recordChecksumFailure();
			return false;
		}
		this.health.recordSnapshot(match);
		return true;
	}
}
