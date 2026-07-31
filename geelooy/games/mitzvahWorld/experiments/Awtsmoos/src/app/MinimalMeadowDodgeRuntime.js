// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDodgeRuntime.js
 * @description Owns one directional dodge, bounded stamina, cooldown, immunity, receipts, and teardown.
 * The Awtsmoos gives finite flight no independent throne; Awtsmoos.com keeps
 * activation, measured immunity, collision motion, completion, and diagnostics explicit.
 */

import {
	minimalMeadowCoreDelayRemaining,
	minimalMeadowCoreNow
} from './MinimalMeadowCoreClock.js';
import {
	minimalMeadowDodgeBlocksDetails,
	minimalMeadowDodgeDirection
} from './MinimalMeadowDodgeDirection.js';
import {
	applyMinimalMeadowDodgeMotion
} from './MinimalMeadowDodgeMotion.js';
import {
	normalizeMinimalMeadowDodgePolicy
} from './MinimalMeadowDodgePolicy.js';
import {
	createMinimalMeadowDodgeState,
	minimalMeadowDodgeRejection,
	rejectMinimalMeadowDodge
} from './MinimalMeadowDodgeState.js';

export class MinimalMeadowDodgeRuntime {
	constructor(runtime, environment = globalThis, policy = {}) {
		this.runtime = runtime;
		this.environment = environment;
		this.policy = normalizeMinimalMeadowDodgePolicy(policy);
		this.state = createMinimalMeadowDodgeState();
		this.unsubscribe = runtime.bus.on('core:dodge', detail => {
			this.activate(detail);
		});
	}

	activate(detail = {}) {
		const now = minimalMeadowCoreNow(this.environment);
		const reason = minimalMeadowDodgeRejection(this, now);
		if (reason) return rejectMinimalMeadowDodge(this, reason);
		this.runtime.playerStats.stamina -= this.policy.staminaCost;
		this.state.direction = minimalMeadowDodgeDirection(
			this.runtime,
			detail.direction
		);
		this.state.activeUntil = now + this.policy.durationSeconds;
		this.state.invulnerableUntil = now + this.policy.invulnerabilitySeconds;
		this.state.cooldownUntil = now + this.policy.cooldownSeconds;
		this.state.remainingDistance = this.policy.distance;
		this.runtime.bus.emit('combat:cancel-all', { reason: 'player-dodge' });
		this.runtime.bus.emit('core:dodge-start', this.snapshot());
		return Object.freeze({ accepted: true, ...this.snapshot() });
	}

	update(deltaSeconds) {
		const now = minimalMeadowCoreNow(this.environment);
		if (now >= this.state.activeUntil
			|| this.state.remainingDistance <= 0) {
			return this.finish(now);
		}
		applyMinimalMeadowDodgeMotion(
			this.runtime,
			this.state,
			this.policy,
			deltaSeconds
		);
		return true;
	}

	blocksIncoming(details = {}) {
		return minimalMeadowDodgeBlocksDetails(details)
			&& minimalMeadowCoreNow(this.environment)
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
			direction: this.state.direction,
			invulnerable: now < this.state.invulnerableUntil,
			remainingDistance: this.state.remainingDistance
		});
	}

	destroy() {
		this.unsubscribe?.();
	}

	finish(now) {
		if (!this.state.activeUntil) return false;
		if (now < this.state.activeUntil
			&& this.state.remainingDistance > 0) return false;
		this.state.activeUntil = 0;
		this.state.remainingDistance = 0;
		this.runtime.bus.emit('core:dodge-complete', this.snapshot());
		return false;
	}
}
