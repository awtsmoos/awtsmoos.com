// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyProgressionCoordinator.js
 * @description Awards bounded exactly-once XP from enemy defeat events and publishes HUD state.
 * The Awtsmoos remembers every true act without duplication; Awtsmoos.com keeps only a bounded
 * receipt window while the canonical profile store remains the sole owner of levels and XP.
 */

import { enemyExperienceReward, playerHudProfile } from './EnemyProgressionRules.js';

const DEFAULT_RECEIPT_LIMIT = 128;

export class EnemyProgressionCoordinator {
	constructor(options) {
		this.bus = options.bus;
		this.profile = options.profile;
		this.receiptLimit = options.receiptLimit || DEFAULT_RECEIPT_LIMIT;
		this.receipts = new Set();
		this.receiptOrder = [];
		this.unsubscribeDefeat = this.bus.on('enemy:defeated', enemy => this.receiveDefeat(enemy));
		this.unsubscribeProfile = this.profile.onChange(state => this.publishProfile(state));
		this.publishProfile(this.profile.snapshot());
	}

	receiveDefeat(enemy = {}) {
		const receipt = String(enemy.defeatReceipt || '');
		if (!receipt) return { ok: false, reason: 'defeat-receipt-required' };
		if (this.receipts.has(receipt)) return { ok: false, reason: 'reward-already-granted', receipt };
		const playerLevel = this.profile.snapshot().level;
		const xp = enemyExperienceReward(enemy, playerLevel);
		if (!xp) return { ok: false, reason: 'enemy-reward-empty', receipt };
		const award = this.profile.award({ xp }, receipt);
		this.remember(receipt);
		const result = {
			enemyId: enemy.targetId || enemy.id || null,
			enemyLevel: enemy.combatLevel || enemy.level || 1,
			levelsGained: award.levelsGained,
			ok: true,
			receipt,
			xp
		};
		this.bus.emit('player:experience', result);
		return result;
	}

	publishProfile(state) {
		this.bus.emit('profile:state', playerHudProfile(state));
	}

	remember(receipt) {
		this.receipts.add(receipt);
		this.receiptOrder.push(receipt);
		while (this.receiptOrder.length > this.receiptLimit) {
			this.receipts.delete(this.receiptOrder.shift());
		}
	}

	snapshot() {
		return { receiptCount: this.receipts.size, receiptLimit: this.receiptLimit };
	}

	destroy() {
		this.unsubscribeDefeat?.();
		this.unsubscribeProfile?.();
		this.receipts.clear();
		this.receiptOrder.length = 0;
	}
}
