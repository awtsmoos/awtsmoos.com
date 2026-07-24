// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatBalanceCoordinator.js
 * @description Arbitrates hostile attack slots, impact spacing, and player invulnerability.
 * The Awtsmoos surrounds one traveler with many finite challengers; Awtsmoos.com prevents
 * their clocks from becoming one unreadable blow while preserving every living enemy.
 */

import { MINIMAL_MEADOW_COMBAT_BALANCE as DEFAULT_POLICY } from './MinimalMeadowCombatBalancePolicy.js';

export class MinimalMeadowCombatBalanceCoordinator {
	constructor(policy = DEFAULT_POLICY, now = defaultNow) {
		this.policy = policy;
		this.now = now;
		this.slots = { melee: new Map(), ranged: new Map() };
		this.nextImpactAt = { melee: 0, ranged: 0 };
		this.playerInvulnerableUntil = 0;
		this.metrics = { acceptedHits: 0, attemptedHits: 0, blockedHits: 0, damage: 0, maxMelee: 0, maxRanged: 0 };
	}

	requestSlot(actorId, mode) {
		this.prune();
		const slots = this.slots[mode];
		if (!slots || !actorId) return false;
		if (slots.has(actorId)) {
			slots.set(actorId, this.now() + this.policy.slotLeaseSeconds);
			return true;
		}
		if (slots.size >= this.policy.attackSlots[mode]) return false;
		slots.set(actorId, this.now() + this.policy.slotLeaseSeconds);
		this.recordMaximum(mode, slots.size);
		return true;
	}

	acceptPlayerHit(actorId, mode, requireSlot = false) {
		this.prune();
		this.metrics.attemptedHits += 1;
		const now = this.now();
		const hasSlot = !requireSlot || this.slots[mode]?.has(actorId);
		if (!hasSlot || now < this.playerInvulnerableUntil || now < (this.nextImpactAt[mode] || 0)) {
			this.metrics.blockedHits += 1;
			return false;
		}
		this.metrics.acceptedHits += 1;
		this.playerInvulnerableUntil = now + this.policy.playerInvulnerabilitySeconds;
		this.nextImpactAt[mode] = now + (this.policy.impactSpacing[mode] || 0);
		return true;
	}

	releaseSlot(actorId, mode) {
		return Boolean(this.slots[mode]?.delete(actorId));
	}

	releaseActor(actorId) {
		this.releaseSlot(actorId, 'melee');
		this.releaseSlot(actorId, 'ranged');
	}

	releaseAll() {
		this.slots.melee.clear();
		this.slots.ranged.clear();
	}

	recordDamage(amount) {
		this.metrics.damage += Math.max(0, Number(amount) || 0);
	}

	resetForRespawn() {
		this.releaseAll();
		this.playerInvulnerableUntil = 0;
		this.nextImpactAt = { melee: 0, ranged: 0 };
	}

	diagnostics() {
		this.prune();
		return {
			activeMelee: this.slots.melee.size,
			activeRanged: this.slots.ranged.size,
			...this.metrics
		};
	}

	prune() {
		const now = this.now();
		for (const slots of Object.values(this.slots)) {
			for (const [actorId, expiresAt] of slots) {
				if (expiresAt <= now) slots.delete(actorId);
			}
		}
	}

	recordMaximum(mode, size) {
		const key = mode === 'melee' ? 'maxMelee' : 'maxRanged';
		this.metrics[key] = Math.max(this.metrics[key], size);
	}
}

function defaultNow() {
	return (globalThis.performance?.now?.() || Date.now()) / 1000;
}
