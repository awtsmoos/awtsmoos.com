// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatController.js
 * @description Owns the singular defeat transition, one timer, checkpoint, and recovery request.
 * The Awtsmoos renews the finite traveler without divided authority; Awtsmoos.com permits
 * one fall, one announced state, one appointed return, and never two competing respawns.
 */

import {
	playMinimalMeadowDefeatAnimation,
	selectMinimalMeadowDefeatAnimation
} from './MinimalMeadowPlayerDefeatAnimation.js';
import {
	installMinimalMeadowDefeatGuards,
	lockMinimalMeadowPlayer
} from './MinimalMeadowPlayerDefeatLocks.js';
import { MINIMAL_MEADOW_PLAYER_DEFEAT_POLICY as POLICY } from './MinimalMeadowPlayerDefeatPolicy.js';
import { recoverMinimalMeadowPlayer } from './MinimalMeadowPlayerDefeatRecovery.js';
import {
	createMinimalMeadowPlayerDefeatState,
	updateMinimalMeadowCheckpoint
} from './MinimalMeadowPlayerDefeatState.js';

export class MinimalMeadowPlayerDefeatController {
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.environment = environment;
		this.state = runtime.playerDefeatState || createMinimalMeadowPlayerDefeatState(
			runtime.state,
			runtime.playerStats.maxHealth
		);
		runtime.playerDefeatState = this.state;
		this.timer = null;
		this.unsubscribers = [
			runtime.bus.on('player:respawn-request', payload =>
				this.respawn(payload?.reason || 'explicit')
			),
			runtime.bus.on('player:checkpoint', payload => this.setCheckpoint(payload)),
			runtime.bus.on('world:combat-ready', () => this.installGuards())
		];
		this.installGuards();
	}

	isDefeated() {
		return this.state.phase === 'defeated';
	}

	defeat(cause = {}) {
		if (this.isDefeated()) return false;
		this.state.phase = 'defeated';
		this.state.cycle += 1;
		this.state.defeatedAt = this.now();
		this.runtime.playerStats.health = 0;
		lockMinimalMeadowPlayer(this.runtime);
		const animation = playMinimalMeadowDefeatAnimation(
			this.runtime,
			selectMinimalMeadowDefeatAnimation(this.runtime)
		);
		const payload = this.payload({ animation, cause });
		this.emitDefeatOnce(payload);
		this.runtime.bus.emit('player:defeat-state', payload);
		this.scheduleRespawn();
		return true;
	}

	respawn(reason = 'timer') {
		return recoverMinimalMeadowPlayer(this, reason);
	}

	setCheckpoint(source = this.runtime.state) {
		return updateMinimalMeadowCheckpoint(this.state, source);
	}

	installGuards() {
		installMinimalMeadowDefeatGuards(this.runtime, () => this.isDefeated());
	}

	scheduleRespawn() {
		if (this.timer !== null) return false;
		const cycle = this.state.cycle;
		this.timer = this.setTimer(() => {
			this.timer = null;
			if (this.state.cycle === cycle) this.respawn('timer');
		}, POLICY.respawnDelaySeconds * 1000);
		return true;
	}

	emitDefeatOnce(payload) {
		if (this.state.defeatEmittedCycle === this.state.cycle) return false;
		this.state.defeatEmittedCycle = this.state.cycle;
		this.runtime.bus.emit('player:defeated', payload);
		return true;
	}

	payload(extra = {}) {
		return {
			cycle: this.state.cycle,
			delaySeconds: POLICY.respawnDelaySeconds,
			health: this.runtime.playerStats.health,
			maxHealth: this.runtime.playerStats.maxHealth,
			phase: this.state.phase,
			...extra
		};
	}

	now() {
		return (this.environment.performance?.now?.() || Date.now()) / 1000;
	}

	setTimer(callback, milliseconds) {
		const setter = this.environment.setTimeout?.bind(this.environment)
			|| globalThis.setTimeout;
		return setter(callback, milliseconds);
	}

	clearTimer() {
		if (this.timer === null) return;
		const clearer = this.environment.clearTimeout?.bind(this.environment)
			|| globalThis.clearTimeout;
		clearer(this.timer);
		this.timer = null;
	}

	destroy() {
		this.clearTimer();
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}
