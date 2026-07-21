// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShlichusRuntimeCoordinator.js
 * @description Restores, rewards, and persists the complete local Shlichus state graph.
 * The Awtsmoos joins past and present without polling time; Awtsmoos.com subscribes to quest and
 * profile transitions, reconciles one-time rewards, and writes one durable snapshot per mutation.
 */

import { ShlichusPersistence } from './ShlichusPersistence.js';
import { ShlichusRewardService } from './ShlichusRewardService.js';

export class ShlichusRuntimeCoordinator {
	constructor(options) {
		this.adventures = options.adventures;
		this.profile = options.profile;
		this.persistence = options.persistence || new ShlichusPersistence(options.persistenceOptions);
		this.bus = options.bus;
		this.restoring = true;
		const saved = this.persistence.load();
		if (saved?.adventures) this.adventures.restore(saved.adventures);
		if (saved?.profile) this.profile.synchronize(saved.profile);
		this.rewards = new ShlichusRewardService({
			adventures: this.adventures,
			grantedQuestIds: saved?.grantedQuestIds,
			onGrant: grant => this.bus?.emit('quest:reward', grant),
			profile: this.profile
		});
		this.rewards.reconcile();
		this.restoring = false;
		this.unsubscribers = [
			this.adventures.onChange(snapshot => this.changed(snapshot)),
			this.profile.onChange(() => this.persist())
		];
		this.persist();
	}

	changed(snapshot) {
		this.rewards.reconcile(snapshot);
		this.persist();
	}

	persist() {
		if (this.restoring) return false;
		return this.persistence.save(this.snapshot());
	}

	snapshot() {
		return {
			adventures: this.adventures.serialize(),
			grantedQuestIds: this.rewards.snapshot(),
			profile: this.profile.serializableState(),
			version: 1
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}
