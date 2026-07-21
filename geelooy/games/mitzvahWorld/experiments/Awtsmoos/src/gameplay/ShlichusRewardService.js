// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShlichusRewardService.js
 * @description Grants profile, inventory, passage, and world rewards exactly once.
 */

import { inventoryDefinition } from './InventoryCatalog.js';
import { torahPassage } from './TorahPassageCatalog.js';

export class ShlichusRewardService {
	constructor(options) {
		this.adventures = options.adventures;
		this.inventory = options.inventory || null;
		this.profile = options.profile;
		this.granted = new Set(options.grantedQuestIds || []);
		this.onGrant = options.onGrant || (() => {});
	}

	reconcile(snapshot = this.adventures.snapshot()) {
		const grants = [];
		for (const record of snapshot.completed || []) {
			const questId = record.definition.id;
			if (this.granted.has(questId)) continue;
			const reward = record.definition.reward || {};
			this.validateInventoryReward(reward);
			const profile = this.profile.award(reward, questId);
			this.grantInventoryReward(reward);
			this.granted.add(questId);
			const grant = {
				profile,
				questId,
				reward: structuredClone(reward),
				worldEffects: structuredClone(record.definition.worldEffects || [])
			};
			grants.push(grant);
			this.onGrant(grant);
		}
		return grants;
	}

	snapshot() {
		return [...this.granted].sort();
	}

	validateInventoryReward(reward) {
		if (!this.inventory) return;
		for (const item of reward.items || []) {
			if (!inventoryDefinition(item.itemId)) throw new Error(`Unknown reward item: ${item.itemId}`);
		}
		for (const passageId of reward.passages || []) {
			if (!torahPassage(passageId)) throw new Error(`Unknown reward passage: ${passageId}`);
		}
	}

	grantInventoryReward(reward) {
		if (!this.inventory) return;
		const perutas = nonNegativeInteger(reward.perutas);
		if (perutas) this.inventory.add('perutas', perutas);
		for (const item of reward.items || []) {
			this.inventory.add(item.itemId, nonNegativeInteger(item.quantity) || 1);
		}
		for (const passageId of reward.passages || []) this.inventory.learn(passageId);
	}
}

function nonNegativeInteger(value) {
	return Math.max(0, Math.trunc(Number(value) || 0));
}
