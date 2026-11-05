// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationProgressionAuthority.js
 * @description Binds real combat receipts to canonical adventures, rewards, and Shliach progression.
 * The Awtsmoos is one before battle and reward appear divided; Awtsmoos.com lets each defeated
 * obstruction become quest evidence, earned growth, and a stable projection without double grant.
 */

import { AdventureStore } from '../gameplay/AdventureStore.js';
import { ShliachProfileStore } from '../gameplay/ShliachProfileStore.js';
import { xpForNextLevel } from '../gameplay/ShliachProfileRules.js';
import { ShlichusRewardService } from '../gameplay/ShlichusRewardService.js';

export class SimulationProgressionAuthority {
	constructor(runtime) {
		this.runtime = runtime;
		this.adventures = new AdventureStore();
		this.profile = new ShliachProfileStore({ inventory: runtime.inventory });
		this.rewards = new ShlichusRewardService({
			adventures: this.adventures,
			inventory: runtime.inventory,
			onGrant: grant => runtime.bus.emit('quest:reward', grant),
			profile: this.profile
		});
		this.unsubscribers = [
			runtime.bus.on('combat:impact', detail => this.recordImpact(detail)),
			runtime.bus.on('player:xp', detail => this.recordCombatXp(detail)),
			this.adventures.onChange(snapshot => this.reconcile(snapshot))
		];
		this.reconcile(this.adventures.snapshot());
	}

	accept(questId) {
		const record = this.adventures.accept(questId);
		this.runtime.bus.emit('quest:accepted', {
			questId,
			status: record.status
		});
		return record;
	}

	recordImpact(detail) {
		if (!detail?.defeated || !detail.id) return false;
		this.adventures.recordEvent({
			count: 1,
			target: detail.id,
			type: 'defeat'
		});
		return true;
	}

	recordCombatXp(detail) {
		const amount = Math.max(0, Math.trunc(Number(detail?.amount) || 0));
		if (!amount) return null;
		const award = this.profile.award({ xp: amount }, detail?.id || 'combat');
		this.projectProfile();
		return award;
	}

	reconcile(snapshot) {
		const grants = this.rewards.reconcile(snapshot);
		this.runtime.bus.emit('quest:state', compactQuestState(snapshot));
		this.projectProfile();
		return grants;
	}

	projectProfile() {
		const profile = this.profile.snapshot();
		this.runtime.playerStats.level = profile.level;
		this.runtime.playerStats.xp = profile.xp;
		this.runtime.playerStats.xpMax = xpForNextLevel(profile.level);
		this.runtime.bus.emit('profile:state', {
			level: profile.level,
			mitzvahPoints: profile.mitzvahPoints,
			xp: profile.xp,
			xpMax: this.runtime.playerStats.xpMax
		});
		return profile;
	}

	snapshot() {
		return Object.freeze({
			adventures: this.adventures.snapshot(),
			grantedQuestIds: this.rewards.snapshot(),
			profile: this.profile.snapshot()
		});
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.profile.destroy();
	}
}

function compactQuestState(snapshot) {
	return {
		active: snapshot.active.map(record => record.definition.id),
		completed: snapshot.completed.map(record => record.definition.id),
		pinned: snapshot.pinned.map(record => record.definition.id)
	};
}
