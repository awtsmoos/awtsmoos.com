// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShlichusRuntimeCoordinator.js
 * @description Restores, rewards, persists, and publishes durable Shlichus world state.
 */

import { ShlichusPersistence } from './ShlichusPersistence.js';
import { ShlichusRewardService } from './ShlichusRewardService.js';

export class ShlichusRuntimeCoordinator {
	constructor(options) {
		this.adventures = options.adventures;
		this.profile = options.profile;
		this.inventory = options.inventory || null;
		this.persistence = options.persistence || new ShlichusPersistence(options.persistenceOptions);
		this.bus = options.bus;
		this.mutating = true;
		this.persistedSignature = '';
		const saved = this.persistence.load();
		if (saved?.adventures) this.adventures.restore(saved.adventures);
		if (saved?.inventory) this.inventory?.restore?.(saved.inventory);
		if (saved?.profile) this.profile.synchronize(saved.profile);
		const restoredGrantIds = new Set(saved?.grantedQuestIds || []);
		this.rewards = new ShlichusRewardService({
			adventures: this.adventures,
			grantedQuestIds: saved?.grantedQuestIds,
			inventory: this.inventory,
			onGrant: grant => this.publishGrant(grant),
			profile: this.profile
		});
		this.rewards.reconcile();
		this.restoreWorldEffects(restoredGrantIds);
		this.mutating = false;
		this.unsubscribers = [
			this.adventures.onChange(snapshot => this.changed(snapshot)),
			this.inventory?.onChange?.(() => this.persist()),
			this.profile.onChange(() => this.persist())
		].filter(Boolean);
		this.persist();
	}

	changed(snapshot) {
		this.mutating = true;
		try {
			this.rewards.reconcile(snapshot);
		} finally {
			this.mutating = false;
		}
		this.persist();
	}

	persist() {
		if (this.mutating) return false;
		const state = this.serializableState();
		const signature = JSON.stringify(state);
		if (signature === this.persistedSignature) return false;
		const saved = this.persistence.save(state);
		if (saved) this.persistedSignature = signature;
		return saved;
	}

	publishGrant(grant) {
		this.bus?.emit('quest:reward', grant);
		this.publishWorldEffects(grant.questId, grant.worldEffects, 'completion');
	}

	publishWorldEffects(questId, effects, source) {
		for (const effect of effects || []) {
			this.bus?.emit('quest:world-state', { ...effect, questId, source });
			this.bus?.emit(effect.type, { questId, source, state: effect.state, target: effect.target });
		}
	}

	restoreWorldEffects(grantedQuestIds) {
		for (const record of this.adventures.snapshot().completed || []) {
			const questId = record.definition.id;
			if (!grantedQuestIds.has(questId)) continue;
			this.publishWorldEffects(questId, record.definition.worldEffects, 'restore');
		}
	}

	serializableState() {
		return {
			adventures: this.adventures.serialize(),
			grantedQuestIds: this.rewards.snapshot(),
			inventory: this.inventory?.serializableState?.() || null,
			profile: this.profile.serializableState(),
			version: 2
		};
	}

	snapshot() {
		return { ...this.serializableState(), persistence: this.persistence.snapshot() };
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}
