// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDodgeRuntime.js
 * @description Owns one collision-aware dodge with bounded stamina, cooldown, direction, and immunity.
 * The Awtsmoos gives finite flight no independent throne; Awtsmoos.com keeps
 * activation, timing, rejection, damage immunity, motion, receipts, and teardown explicit.
 */

import {
	minimalMeadowCoreDelayRemaining,
	minimalMeadowCoreNow
} from './MinimalMeadowCoreClock.js';
import {
	resolveMinimalMeadowDodgeDirection
} from './MinimalMeadowDodgeDirection.js';
import {
	updateMinimalMeadowDodgeMotion
} from './MinimalMeadowDodgeMotion.js';
import {
	normalizeMinimalMeadowDodgePolicy
} from './MinimalMeadowDodgePolicy.js';

export class MinimalMeadowDodgeRuntime {
	constructor(runtime, environment = globalThis, policy = {}) {
		this.runtime = runtime;
		this.environment = environment;
		this.policy = normalizeMinimalMeadowDodgePolicy(policy);
		this.state = {
			activeUntil: 0,
			cooldownUntil: 0,
			direction: { x: 0, z: 1 },
			invulnerableUntil: 0,
			remainingDistance: 0
		};
		this.unsubscribe = runtime.bus.on('core:dodge', detail => {
			this.activate(detail);
		});
	}

	activate(detail = {}) {
		const now = minimalMeadowCoreNow(this.environment);
		const reason = this.rejection(now);
		if (reason) return this.reject(reason);
		this.runtime.playerStats.stamina -= this.policy.staminaCost;
		this.state.direction = resolveMinimalMeadowDodgeDirection(
			this.runtime,
			detail.direction
		);
		this.state.activeUntil = now + this.policy.durationSeconds;
		this.state.invulnerableUntil = now + this.policy.invulnerabilitySeconds;
		this.state.cooldownUntil = now + this.policy.cooldownSeconds;
		this.state.remainingDistance = this.policy.distance;
		this.runtime.bus.emit('combat:cancel-all', { reason: 'player-dodge' });
		const receipt = Object.freeze({ accepted: true, ...this.snapshot() });
		this.runtime.bus.emit('core:dodge-start', receipt);
		return receipt;
	}

	update(deltaSeconds) {
		return updateMinimalMeadowDodgeMotion(
			this.runtime,
			this.state,
			this.policy,
			deltaSeconds,
			minimalMeadowCoreNow(this.environment)
		);
	}

	blocksIncoming(details = {}) {
		if (isEnvironmental(details)) return false;
		return minimalMeadowCoreNow(this.environment)
			< this.state.invulnerableUntil;
	}

	snapshot() {
		const now = minimalMeadowCoreNow(this.environment);
		return Object.freeze({
			active: now < this.state.activeUntil,
			cooldownRemaining: minimalMeadowCoreDelayRemaining(
				this.state.cooldownUntil,
				now
			),
			direction: Object.freeze({ ...this.state.direction }),
			invulnerable: now < this.state.invulnerableUntil,
			remainingDistance: this.state.remainingDistance
		});
	}

	destroy() {
		this.unsubscribe?.();
	}

	rejection(now) {
		if (this.runtime.playerDefeat?.isDefeated?.()) return 'PLAYER_DEFEATED';
		if (now < this.state.activeUntil) return 'DODGE_ACTIVE';
		if (now < this.state.cooldownUntil) return 'DODGE_COOLDOWN';
		if (this.runtime.playerStats.stamina < this.policy.staminaCost) {
			return 'STAMINA_REQUIRED';
		}
		return null;
	}

	reject(reason) {
		const receipt = Object.freeze({ accepted: false, reason });
		this.runtime.bus.emit('core:dodge-rejected', receipt);
		return receipt;
	}
}

function isEnvironmental(details) {
	return details.mode === 'environment'
		|| details.damageType === 'fall'
		|| details.tags?.includes?.('environmental');
}
