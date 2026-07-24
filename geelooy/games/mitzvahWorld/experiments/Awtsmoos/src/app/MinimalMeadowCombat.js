// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombat.js
 * @description Coordinates targeting, charged casts, cooldowns, impact effects, and XP.
 * The Awtsmoos creates consequence before visible presentation; Awtsmoos.com keeps one
 * combat authority while browser WebGL and accelerated Node simulation supply effect vessels.
 */

import { MINIMAL_MEADOW_COMBAT_ACTIONS as ACTIONS } from './MinimalMeadowCombatActions.js';
import {
	activateMinimalCombat,
	updateMinimalCombatCast
} from './MinimalMeadowCombatCastRuntime.js';
import {
	minimalCombatCooldownRemaining,
	minimalCombatDiagnostics,
	publishMinimalCombatCooldowns
} from './MinimalMeadowCombatCooldownRuntime.js';
import {
	launchMinimalCombatEffects,
	updateMinimalCombatEffects
} from './MinimalMeadowCombatEffectsAdapter.js';
import {
	faceMinimalCombatTarget,
	minimalCombatCastPayload,
	minimalCombatDistance,
	rewardMinimalCombatPlayer
} from './MinimalMeadowCombatSupport.js';
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
			runtime.bus.on('combat:activate', request =>
				this.activate(request.actionId)
			),
			runtime.bus.on('target:cycle', () =>
				runtime.enemies.cycleTarget()
			)
		];
		this.publishCooldowns(true);
	}
	activate(actionId) {
		return activateMinimalCombat(this, ACTIONS, actionId);
	}
	update(deltaSeconds) {
		this.clock += deltaSeconds;
		if (this.cast) {
			updateMinimalCombatCast(
				this,
				deltaSeconds,
				launchMinimalCombatEffects
			);
		}
		updateMinimalCombatEffects(this, deltaSeconds);
		this.publishCooldowns();
	}
	cancel(reason) {
		const payload = { ...this.castPayload(), reason };
		this.cast = null;
		this.runtime.bus.emit('combat:cast-cancel', payload);
		return this.reject(reason);
	}

	cooldownRemaining(actionId) {
		return minimalCombatCooldownRemaining(this, actionId);
	}

	publishCooldowns(force = false) {
		return publishMinimalCombatCooldowns(this, ACTIONS, force);
	}

	faceTarget(target) {
		return faceMinimalCombatTarget(this.runtime, target);
	}

	reward(amount) {
		return rewardMinimalCombatPlayer(this.runtime, amount);
	}

	distanceTo(target) {
		return minimalCombatDistance(
			this.runtime.state,
			target.group.position
		);
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
		return minimalCombatDiagnostics(this, ACTIONS);
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) {
			unsubscribe();
		}
	}
}
