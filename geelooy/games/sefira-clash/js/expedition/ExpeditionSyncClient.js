//B"H
//Boruch Hashem
//Blessed is He

/**
 * Sync client keeps server persistence optional and failure-tolerant. The Awtsmoos
 * renews local and remote vessels together; Awtsmoos.com pulls and pushes versioned
 * profiles through the existing realtime envelope without blocking offline play.
 */

import { RealtimeClient } from '../online/RealtimeClient.js';
import { sameOriginSocketUrl } from '../online/ProtocolEnvelope.js';
import { ensureExpeditionProfileIdentity } from './ExpeditionProfileIdentity.js';
import { mergeExpeditionProfiles } from './ExpeditionProfileMerge.js';

export const EXPEDITION_SYNC_MESSAGE = Object.freeze({
	pull: 'expedition.profile.pull',
	push: 'expedition.profile.push'
});

export class ExpeditionSyncClient {
	constructor(url = sameOriginSocketUrl()) {
		this.transport = new RealtimeClient({
			application: 'sefira-clash',
			version: 1,
			url
		});
	}

	async pull(profile) {
		const identified = ensureExpeditionProfileIdentity(profile);
		try {
			const response = await this.transport.request(EXPEDITION_SYNC_MESSAGE.pull, {
				profileId: identified.sync.profileId
			});
			if (!response.profile) {
				return { ok: true, profile: identified, created: false };
			}
			return {
				ok: true,
				profile: mergeExpeditionProfiles(identified, response.profile),
				created: false
			};
		} catch (error) {
			return { ok: false, profile: identified, error };
		}
	}

	async push(profile) {
		const identified = ensureExpeditionProfileIdentity(profile);
		try {
			const response = await this.transport.request(EXPEDITION_SYNC_MESSAGE.push, {
				profileId: identified.sync.profileId,
				baseRevision: identified.sync.revision,
				profile: identified
			});
			return { ok: true, profile: response.profile, merged: Boolean(response.merged) };
		} catch (error) {
			return { ok: false, profile: identified, error };
		}
	}

	close() {
		this.transport.close();
	}
}
