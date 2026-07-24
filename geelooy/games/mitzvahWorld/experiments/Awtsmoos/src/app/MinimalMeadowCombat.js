// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombat.js
 * @description Coordinates target acquisition, charging, interruption, launch, impact, and XP.
 * The Awtsmoos measures every fictional strike before release; Awtsmoos.com exposes a real
 * cast state so button, progress bar, facing, range, projectile, explosion, health, and reward agree.
 */

import { MINIMAL_MEADOW_COMBAT_ACTIONS as ACTIONS } from './MinimalMeadowCombatActions.js?v=20260723-meadow-11';
import {
	faceMinimalCombatTarget,
	minimalCombatCastPayload,
	minimalCombatDistance,
	rewardMinimalCombatPlayer
} from './MinimalMeadowCombatSupport.js?v=20260723-meadow-11';
import { launchCombatProjectile, updateCombatWorldEffects } from './MinimalMeadowCombatWorldEffects.js?v=20260723-meadow-11';

export class MinimalMeadowCombat {
	constructor(runtime) {
		this.runtime = runtime;
		this.clock = 0;
		this.cooldowns = new Map();
		this.projectiles = [];
		this.effects = [];
		this.cast = null;
		this.unsubscribers = [
			runtime.bus.on('combat:activate', request => this.activate(request.actionId)),
			runtime.bus.on('target:cycle', () => runtime.enemies.cycleTarget())
		];
	}

	activate(actionId) {
		const action = ACTIONS[actionId];
		if (!action) return this.reject('UNKNOWN_ACTION');
		if (this.cast) return this.reject('ALREADY_CASTING');
		const target = this.runtime.enemies.selected || this.acquireTarget();
		if (!target?.alive) return this.reject('TARGET_REQUIRED');
		if ((this.cooldowns.get(actionId) || 0) > this.clock) return this.reject('COOLDOWN');
		if (this.distanceTo(target) > action.range) return this.reject('TARGET_OUT_OF_RANGE');
		this.cast = { action, actionId, elapsed: 0, progress: 0, target };
		this.faceTarget(target);
		this.runtime.bus.emit('combat:cast-start', this.castPayload());
		this.runtime.bus.emit('combat:cast-progress', this.castPayload());
		return { accepted: true, actionId };
	}

	update(deltaSeconds) {
		this.clock += deltaSeconds;
		if (this.cast) this.updateCast(deltaSeconds);
		updateCombatWorldEffects(this, deltaSeconds);
	}

	updateCast(deltaSeconds) {
		if (!this.cast.target.alive) return this.cancel('TARGET_LOST');
		if (this.distanceTo(this.cast.target) > this.cast.action.range + 1.5) {
			return this.cancel('CAST_INTERRUPTED_RANGE');
		}
		this.faceTarget(this.cast.target);
		this.cast.elapsed += deltaSeconds;
		this.cast.progress = Math.min(1, this.cast.elapsed / this.cast.action.castTime);
		this.runtime.bus.emit('combat:cast-progress', this.castPayload());
		if (this.cast.progress < 1) return;
		const completed = this.cast;
		this.cooldowns.set(completed.actionId, this.clock + completed.action.cooldown);
		launchCombatProjectile(this, completed);
		this.cast = null;
	}

	cancel(reason) {
		const payload = { ...this.castPayload(), reason };
		this.cast = null;
		this.runtime.bus.emit('combat:cast-cancel', payload);
		return this.reject(reason);
	}

	faceTarget(target) {
		return faceMinimalCombatTarget(this.runtime, target);
	}

	reward(amount) {
		return rewardMinimalCombatPlayer(this.runtime, amount);
	}

	distanceTo(target) {
		return minimalCombatDistance(this.runtime.state, target.group.position);
	}

	acquireTarget() {
		this.runtime.enemies.cycleTarget();
		return this.runtime.enemies.selected;
	}

	reject(reason) {
		this.runtime.bus.emit('combat:rejected', { reason });
		return { accepted: false, reason };
	}

	castPayload() {
		return minimalCombatCastPayload(this.cast);
	}

	diagnostics() {
		return {
			casting: this.cast?.actionId || null,
			effects: this.effects.length,
			progress: this.cast?.progress || 0,
			projectiles: this.projectiles.length
		};
	}
}
