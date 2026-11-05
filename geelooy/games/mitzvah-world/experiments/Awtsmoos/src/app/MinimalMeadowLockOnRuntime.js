// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLockOnRuntime.js
 * @description Owns hostile lock acquisition, deterministic cycling, facing guidance, and stale release.
 * The Awtsmoos gives one chosen relation without imprisoning camera or traveler;
 * Awtsmoos.com keeps target identity, selection, range, death, cycling, and release truthful.
 */

import { updateMinimalMeadowLockOnFacing } from './MinimalMeadowLockOnFacing.js';
import {
	minimalMeadowLockActor,
	minimalMeadowLockActorId,
	minimalMeadowLockCandidates,
	minimalMeadowLockTargetValid,
	minimalMeadowNextLockCandidate
} from './MinimalMeadowLockOnTargeting.js';

export class MinimalMeadowLockOnRuntime {
	constructor(runtime) {
		this.runtime = runtime;
		this.targetId = null;
		this.unsubscribers = [
			runtime.bus.on('core:lock-toggle', () => this.toggle()),
			runtime.bus.on('core:lock-cycle', () => this.cycle()),
			runtime.bus.on('enemy:defeated', event => this.onDefeated(event))
		];
	}

	toggle() {
		return this.targetId ? this.release('manual') : this.acquire();
	}

	acquire() {
		const candidate = minimalMeadowLockCandidates(this.runtime)[0];
		if (!candidate) return this.reject('LOCK_TARGET_UNAVAILABLE');
		return this.select(candidate.actor, 'acquired');
	}

	cycle() {
		const candidate = minimalMeadowNextLockCandidate(this.runtime, this.targetId);
		if (!candidate) return this.release('no-targets');
		return this.select(candidate.actor, 'cycled');
	}

	select(actor, reason) {
		if (!minimalMeadowLockTargetValid(this.runtime, actor)) {
			return this.reject('LOCK_TARGET_INVALID');
		}
		this.targetId = minimalMeadowLockActorId(actor);
		this.runtime.enemies?.selectActor?.(actor);
		this.runtime.state.lockOnTargetId = this.targetId;
		const receipt = Object.freeze({
			accepted: true,
			reason,
			target: actor.payload?.() || { id: this.targetId },
			targetId: this.targetId
		});
		this.runtime.bus.emit('core:lock-changed', receipt);
		return receipt;
	}

	update(deltaSeconds) {
		if (!this.targetId) return null;
		const actor = minimalMeadowLockActor(this.runtime, this.targetId);
		if (!minimalMeadowLockTargetValid(this.runtime, actor)) {
			this.release('stale-target');
			return null;
		}
		return updateMinimalMeadowLockOnFacing(this.runtime, actor, deltaSeconds);
	}

	release(reason = 'manual') {
		const previousTargetId = this.targetId;
		this.targetId = null;
		delete this.runtime.state.lockOnTargetId;
		this.runtime.enemies?.clearAll?.();
		this.runtime.cameraRig?.setCombatTarget?.(null);
		const receipt = Object.freeze({
			accepted: Boolean(previousTargetId),
			previousTargetId,
			reason,
			targetId: null
		});
		this.runtime.bus.emit('core:lock-changed', receipt);
		return receipt;
	}

	snapshot() {
		return Object.freeze({ active: Boolean(this.targetId), targetId: this.targetId });
	}

	destroy() {
		this.release('destroy');
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
	}

	onDefeated(event = {}) {
		if ((event.id || event.enemyId) === this.targetId) {
			this.release('target-defeated');
		}
	}

	reject(reason) {
		const receipt = Object.freeze({ accepted: false, reason });
		this.runtime.bus.emit('core:lock-rejected', receipt);
		return receipt;
	}
}
