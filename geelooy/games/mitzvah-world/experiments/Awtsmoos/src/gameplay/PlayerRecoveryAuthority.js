// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerRecoveryAuthority.js
 * @description Owns bounded incoming damage, defeat, checkpoint return, and post-recovery healing.
 * The Awtsmoos renews the traveler even when every visible measure falls to zero;
 * Awtsmoos.com makes damage, silence, return, and renewed service explicit receipts in time.
 */

import { useHealingAmulet } from './HealingAmuletUse.js';

export class PlayerRecoveryAuthority {
	constructor(runtime, options = {}) {
		this.runtime = runtime;
		this.checkpoint = Object.freeze({
			x: Number(options.x) || 0,
			y: Number(options.y) || 0,
			z: Number(options.z) || 0
		});
		this.defeated = Number(runtime.playerStats?.health) <= 0;
		this.recoveries = 0;
		this.lastReceipt = null;
		this.runtime.state.defeated = this.defeated;
	}

	damage(event = {}, now = 0) {
		if (this.defeated) return rejected('PLAYER_ALREADY_DEFEATED');
		const incoming = normalizedDamage(event, now);
		const resolved = this.runtime.playerDefense?.resolveIncoming(incoming, now) || incoming;
		const stats = this.runtime.playerStats;
		const before = Math.max(0, Number(stats.health) || 0);
		const amount = Math.max(0, Number(resolved.amount) || 0);
		stats.health = Math.max(0, before - amount);
		const receipt = Object.freeze({
			...resolved,
			after: stats.health,
			before,
			defeated: stats.health <= 0
		});
		this.lastReceipt = receipt;
		this.runtime.bus?.emit?.('player:damaged', receipt);
		if (receipt.defeated) this.defeat(receipt);
		return receipt;
	}

	defeat(receipt) {
		this.defeated = true;
		this.runtime.state.defeated = true;
		this.runtime.state.action = 'defeated';
		this.runtime.state.moving = false;
		this.runtime.combat?.cancel?.('PLAYER_DEFEATED');
		this.runtime.bus?.emit?.('player:defeated', receipt);
	}

	recover(checkpoint = this.checkpoint) {
		if (!this.defeated) return rejected('PLAYER_NOT_DEFEATED');
		const stats = this.runtime.playerStats;
		stats.health = Math.max(1, Math.round(Number(stats.maxHealth || 1) * 0.55));
		this.runtime.state.x = Number(checkpoint.x) || 0;
		this.runtime.state.y = Number(checkpoint.y) || 0;
		this.runtime.state.z = Number(checkpoint.z) || 0;
		this.runtime.state.action = 'idle';
		this.runtime.state.defeated = false;
		this.defeated = false;
		this.recoveries += 1;
		const receipt = Object.freeze({
			checkpoint: { ...checkpoint },
			health: stats.health,
			recoveries: this.recoveries
		});
		this.lastReceipt = receipt;
		this.runtime.bus?.emit?.('player:recovered', receipt);
		return receipt;
	}

	heal(itemId) {
		if (this.defeated) throw new Error('A defeated traveler must recover before using an amulet.');
		const receipt = useHealingAmulet(this.runtime, itemId);
		this.lastReceipt = receipt;
		return receipt;
	}

	snapshot() {
		return Object.freeze({
			checkpoint: { ...this.checkpoint },
			defeated: this.defeated,
			lastReceipt: this.lastReceipt ? structuredClone(this.lastReceipt) : null,
			recoveries: this.recoveries
		});
	}
}

function normalizedDamage(event, now) {
	return {
		amount: Math.max(0, Number(event.amount) || 0),
		damageType: event.damageType || 'physical',
		hitDirection: event.hitDirection || {},
		sourceId: event.sourceId || 'unknown',
		staggerAmount: Math.max(0, Number(event.staggerAmount) || 0),
		timestamp: Number(event.timestamp ?? now) || 0
	};
}

function rejected(reason) {
	return Object.freeze({ accepted: false, reason });
}
