// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatController.js
 * @description Owns one defeat cycle, guarded input, one timer, checkpoint payloads, and exact recovery.
 * The Awtsmoos renews the fallen traveler without making failure a hidden punishment;
 * Awtsmoos.com keeps cycle, timer, lock, animation, checkpoint, authority, and teardown coherent.
 */

import {
	defaultMinimalMeadowDefeatPolicy,
	normalizeMinimalMeadowDefeatPolicy
} from './MinimalMeadowPlayerDefeatPolicy.js';
import {
	clearMinimalMeadowPlayerDefeatTimer,
	recoverMinimalMeadowPlayerDefeat,
	respawnMinimalMeadowPlayerDefeat,
	scheduleMinimalMeadowPlayerDefeat,
	triggerMinimalMeadowPlayerDefeat,
	updateMinimalMeadowPlayerDefeat
} from './MinimalMeadowPlayerDefeatOperations.js';
import {
	installMinimalMeadowDefeatGuards
} from './MinimalMeadowPlayerDefeatLocks.js';
import {
	createMinimalMeadowPlayerDefeatState,
	minimalMeadowPlayerDefeatSnapshot
} from './MinimalMeadowPlayerDefeatState.js';

export class MinimalMeadowPlayerDefeatController {
	constructor(runtime, environment = globalThis, policy = {}) {
		this.runtime = runtime;
		this.environment = environment;
		this.policy = normalizeMinimalMeadowDefeatPolicy(
			policy,
			defaultMinimalMeadowDefeatPolicy(runtime)
		);
		this.state = runtime.playerDefeatState
			|| createMinimalMeadowPlayerDefeatState(
				runtime.state,
				this.policy.maxHealth
			);
		runtime.playerDefeatState = this.state;
		this.timer = null;
		installMinimalMeadowDefeatGuards(
			runtime,
			() => this.isDefeated()
		);
		this.unsubscribers = [
			runtime.bus.on('player:defeated', detail => this.trigger(detail)),
			runtime.bus.on('player:recover', detail => {
				this.recover(detail?.mode || 'landmark');
			}),
			runtime.bus.on('combat:revive-authority', detail => {
				if (detail?.accepted) this.recover('ally-revive');
			})
		];
	}

	isDefeated() {
		return this.state.phase === 'defeated'
			|| this.state.phase === 'recovering';
	}

	defeat(detail = {}) {
		return this.trigger(detail);
	}

	trigger(detail = {}) {
		return triggerMinimalMeadowPlayerDefeat(this, detail);
	}

	recover(reason = 'landmark') {
		return recoverMinimalMeadowPlayerDefeat(this, reason);
	}

	respawn(reason = 'timer') {
		return respawnMinimalMeadowPlayerDefeat(this, reason);
	}

	update() {
		updateMinimalMeadowPlayerDefeat(this);
	}

	scheduleRespawn() {
		return scheduleMinimalMeadowPlayerDefeat(this);
	}

	clearTimer() {
		clearMinimalMeadowPlayerDefeatTimer(this);
	}

	payload(detail = {}) {
		return Object.freeze({
			...this.snapshot(),
			...detail,
			health: Number(this.runtime.playerStats?.health || 0)
		});
	}

	snapshot() {
		return minimalMeadowPlayerDefeatSnapshot(this.state);
	}

	diagnostics() {
		return Object.freeze({
			...this.snapshot(),
			policy: { ...this.policy },
			timerActive: this.timer !== null
		});
	}

	destroy() {
		this.clearTimer();
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
	}
}
