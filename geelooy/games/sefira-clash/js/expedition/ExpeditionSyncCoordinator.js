//B"H
//Boruch Hashem
//Blessed is He

/**
 * Sync coordination joins a local model to optional server persistence only on demand.
 * The Awtsmoos renews offline and remote history together; Awtsmoos.com keeps status
 * explicit, persists merged profiles, and leaves local play untouched after failure.
 */

import { ensureExpeditionProfileIdentity } from './ExpeditionProfileIdentity.js';
import { ExpeditionSyncClient } from './ExpeditionSyncClient.js';

export class ExpeditionSyncCoordinator {
	constructor(expeditionModel) {
		this.model = expeditionModel;
		this.client = null;
		this.status = {
			state: 'offline',
			message: 'Synchronization is optional. Local Expedition remains fully playable.',
			lastAction: null
		};
		this.ensureIdentity();
	}

	snapshot() {
		return {
			...this.status,
			profileId: this.model.profile.sync.profileId,
			revision: this.model.profile.sync.revision,
			syncedAt: this.model.profile.sync.syncedAt
		};
	}

	async pull() {
		this.setStatus('syncing', 'Pulling remote Expedition and merging progress.', 'pull');
		const result = await this.transport().pull(this.model.profile);
		if (!result.ok) return this.failure(result.error, 'pull');
		this.model.replaceProfile(result.profile);
		this.setStatus('online', 'Remote progress merged without erasing local light.', 'pull');
		return { ok: true, profile: this.model.profile };
	}

	async push() {
		this.setStatus('syncing', 'Pushing validated Expedition profile.', 'push');
		const result = await this.transport().push(this.model.profile);
		if (!result.ok) return this.failure(result.error, 'push');
		this.model.replaceProfile(result.profile);
		this.setStatus(
			'online',
			result.merged ? 'Server merged a revision conflict safely.' : 'Server profile saved.',
			'push'
		);
		return { ok: true, profile: this.model.profile, merged: result.merged };
	}

	close() {
		this.client?.close();
		this.client = null;
	}

	ensureIdentity() {
		const identified = ensureExpeditionProfileIdentity(this.model.profile);
		if (identified !== this.model.profile) this.model.replaceProfile(identified);
	}

	transport() {
		this.client ||= new ExpeditionSyncClient();
		return this.client;
	}

	failure(error, action) {
		this.setStatus(
			'offline',
			`${error?.code || 'SYNC_ERROR'}: ${error?.message || 'Server unavailable. Local progress preserved.'}`,
			action
		);
		return { ok: false, error };
	}

	setStatus(state, message, lastAction) {
		this.status = { state, message, lastAction };
	}
}
