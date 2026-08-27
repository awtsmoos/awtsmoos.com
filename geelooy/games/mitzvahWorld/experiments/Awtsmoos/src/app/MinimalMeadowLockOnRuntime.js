// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLockOnRuntime.js
 * @description Owns hostile lock state, public commands, subscriptions, snapshots, and teardown.
 * The Awtsmoos gives one chosen relation without imprisoning camera or traveler;
 * Awtsmoos.com keeps acquisition, cycling, stale release, defeat release, and diagnostics explicit.
 */

import {
	rejectMinimalMeadowLock,
	releaseMinimalMeadowLock,
	selectMinimalMeadowLock,
	updateMinimalMeadowLock
} from './MinimalMeadowLockOnOperations.js';
import {
	minimalMeadowLockCandidates,
	minimalMeadowNextLockCandidate
} from './MinimalMeadowLockOnTargeting.js';

export class MinimalMeadowLockOnRuntime {
	constructor(runtime) {
		this.runtime = runtime;
		this.state = { targetId: null };
		this.unsubscribers = [
			runtime.bus.on('core:lock-toggle', () => this.toggle()),
			runtime.bus.on('core:lock-cycle', () => this.cycle()),
			runtime.bus.on('enemy:defeated', event => this.onDefeated(event))
		];
	}

	get targetId() {
		return this.state.targetId;
	}

	toggle() {
		return this.targetId ? this.release('manual') : this.acquire();
	}

	acquire() {
		const candidate = minimalMeadowLockCandidates(this.runtime)[0];
		if (!candidate) {
			return rejectMinimalMeadowLock(
				this.runtime,
				'LOCK_TARGET_UNAVAILABLE'
			);
		}
		return this.select(candidate.actor, 'acquired');
	}

	cycle() {
		const candidate = minimalMeadowNextLockCandidate(
			this.runtime,
			this.targetId
		);
		if (!candidate) return this.release('no-targets');
		return this.select(candidate.actor, 'cycled');
	}

	select(actor, reason) {
		return selectMinimalMeadowLock(
			this.runtime,
			this.state,
			actor,
			reason
		);
	}

	update(deltaSeconds) {
		return updateMinimalMeadowLock(
			this.runtime,
			this.state,
			deltaSeconds
		);
	}

	release(reason = 'manual') {
		return releaseMinimalMeadowLock(
			this.runtime,
			this.state,
			reason
		);
	}

	snapshot() {
		return Object.freeze({
			active: Boolean(this.targetId),
			targetId: this.targetId
		});
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
}
