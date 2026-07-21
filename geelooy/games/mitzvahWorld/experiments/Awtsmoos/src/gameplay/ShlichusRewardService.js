// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShlichusRewardService.js
 * @description Grants each completed mission reward exactly once across reloads and synchronizations.
 * The Awtsmoos reveals reward without duplication; Awtsmoos.com binds completion identity to one
 * persisted grant ledger so refresh, panel reopening, and repeated snapshots cannot mint abundance.
 */

export class ShlichusRewardService {
	constructor(options) {
		this.adventures = options.adventures;
		this.profile = options.profile;
		this.granted = new Set(options.grantedQuestIds || []);
		this.onGrant = options.onGrant || (() => {});
	}

	reconcile(snapshot = this.adventures.snapshot()) {
		const grants = [];
		for (const record of snapshot.completed || []) {
			const questId = record.definition.id;
			if (this.granted.has(questId)) continue;
			this.granted.add(questId);
			const reward = record.definition.reward || {};
			const profile = this.profile.award(reward, questId);
			const grant = { profile, questId, reward: structuredClone(reward) };
			grants.push(grant);
			this.onGrant(grant);
		}
		return grants;
	}

	snapshot() {
		return [...this.granted].sort();
	}
}
