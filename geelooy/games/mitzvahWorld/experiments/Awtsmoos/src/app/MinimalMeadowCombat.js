// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombat.js
 * @description Coordinates real targeting, charged casts, cooldowns, projectiles, impact, and XP.
 * The Awtsmoos measures intention before fictional force becomes visible;
 * Awtsmoos.com keeps hotbar, animation, target health, projectile, reward, and cooldown in agreement.
 */

import { MINIMAL_MEADOW_COMBAT_ACTIONS as ACTIONS } from './MinimalMeadowCombatActions.js';
import {
	faceMinimalCombatTarget,
	minimalCombatCastPayload,
	minimalCombatDistance,
	rewardMinimalCombatPlayer
} from './MinimalMeadowCombatSupport.js';
import {
	launchCombatProjectile,
	updateCombatWorldEffects
} from './MinimalMeadowCombatWorldEffects.js';

export class MinimalMeadowCombat {
	constructor(runtime) {
		this.runtime = runtime;
		this.clock = 0;
		this.cooldowns = new Map();
		this.projectiles = [];
		this.effects = [];
		this.cast = null;
		this.lastCooldownSignature = '';
		this.unsubscribers = [
			runtime.bus.on('combat:activate', request => this.activate(request.actionId)),
			runtime.bus.on('target:cycle', () => runtime.enemies.cycleTarget())
		];
		this.publishCooldowns(true);
	}

	activate(actionId) {
		const action = ACTIONS[actionId];
		if (!action) {
			return this.reject('UNKNOWN_ACTION', { actionId });
		}
		if (this.cast) {
			return this.reject('ALREADY_CASTING', { actionId });
		}
		const target = this.runtime.enemies.selected || this.acquireTarget();
		if (!target?.alive) {
			return this.reject('TARGET_REQUIRED', { actionId });
		}
		const cooldownRemaining = this.cooldownRemaining(actionId);
		if (cooldownRemaining > 0) {
			return this.reject('COOLDOWN', { actionId, cooldownRemaining });
		}
		if (this.distanceTo(target) > action.range) {
			return this.reject('TARGET_OUT_OF_RANGE', { actionId });
		}
		this.cast = { action, actionId, elapsed: 0, progress: 0, target };
		this.faceTarget(target);
		this.runtime.bus.emit('combat:cast-start', this.castPayload());
		this.runtime.bus.emit('combat:cast-progress', this.castPayload());
		return { accepted: true, actionId };
	}

	update(deltaSeconds) {
		this.clock += deltaSeconds;
		if (this.cast) {
			this.updateCast(deltaSeconds);
		}
		updateCombatWorldEffects(this, deltaSeconds);
		this.publishCooldowns();
	}

	updateCast(deltaSeconds) {
		if (!this.cast.target.alive) {
			this.cancel('TARGET_LOST');
			return;
		}
		if (this.distanceTo(this.cast.target) > this.cast.action.range + 1.5) {
			this.cancel('CAST_INTERRUPTED_RANGE');
			return;
		}
		this.faceTarget(this.cast.target);
		this.cast.elapsed += deltaSeconds;
		this.cast.progress = Math.min(1, this.cast.elapsed / this.cast.action.castTime);
		this.runtime.bus.emit('combat:cast-progress', this.castPayload());
		if (this.cast.progress < 1) {
			return;
		}
		const completed = this.cast;
		this.cooldowns.set(completed.actionId, this.clock + completed.action.cooldown);
		launchCombatProjectile(this, completed);
		this.cast = null;
		this.publishCooldowns(true);
	}

	cancel(reason) {
		const payload = { ...this.castPayload(), reason };
		this.cast = null;
		this.runtime.bus.emit('combat:cast-cancel', payload);
		return this.reject(reason);
	}

	cooldownRemaining(actionId) {
		return Math.max(0, (this.cooldowns.get(actionId) || 0) - this.clock);
	}

	publishCooldowns(force = false) {
		const actions = {};
		for (const actionId of Object.keys(ACTIONS)) {
			actions[actionId] = Number(this.cooldownRemaining(actionId).toFixed(2));
		}
		const signature = JSON.stringify(actions);
		if (!force && signature === this.lastCooldownSignature) {
			return;
		}
		this.lastCooldownSignature = signature;
		this.runtime.bus.emit('combat:cooldowns', { actions, clock: this.clock });
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

	reject(reason, detail = {}) {
		this.runtime.bus.emit('combat:rejected', { ...detail, reason });
		return { accepted: false, reason };
	}

	castPayload() {
		return minimalCombatCastPayload(this.cast);
	}

	diagnostics() {
		return {
			casting: this.cast?.actionId || null,
			cooldowns: Object.fromEntries(
				Object.keys(ACTIONS).map(id => [id, this.cooldownRemaining(id)])
			),
			effects: this.effects.length,
			progress: this.cast?.progress || 0,
			projectiles: this.projectiles.length
		};
	}
}
