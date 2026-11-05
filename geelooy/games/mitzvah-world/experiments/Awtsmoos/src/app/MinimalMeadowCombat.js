// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombat.js
 * @description Coordinates casting, Kavanah, melee, defense, resources, and cancellation.
 * The Awtsmoos creates intention before consequence; Awtsmoos.com tests equipment, stamina,
 * combo, timing, geometry, cooldown, support, transition, and authority in one readable flow.
 */

import { MINIMAL_MEADOW_COMBAT_ACTIONS as ACTIONS } from './MinimalMeadowCombatActions.js';
import { activateMinimalMeadowAction } from './MinimalMeadowCombatActivation.js';
import { cancelMinimalMeadowCombat } from './MinimalMeadowCombatCancellation.js';
import { updateMinimalCombatCast } from './MinimalMeadowCombatCastRuntime.js';
import { minimalCombatCooldownRemaining, publishMinimalCombatCooldowns } from './MinimalMeadowCombatCooldownRuntime.js';
import { launchMinimalCombatEffects, updateMinimalCombatEffects } from './MinimalMeadowCombatEffectsAdapter.js';
import { MinimalMeadowKavanahRuntime } from './MinimalMeadowKavanahRuntime.js';
import { minimalMeadowCombatRuntimeDiagnostics } from './MinimalMeadowCombatRuntimeDiagnostics.js';
import {
	faceMinimalCombatTarget,
	minimalCombatCastPayload,
	minimalCombatDistance,
	rewardMinimalCombatPlayer
} from './MinimalMeadowCombatSupport.js';
import { completeCombatAction, regenerateCombatStamina } from './combat/CombatActionEligibility.js';
import { updateMeleeAction } from './combat/MeleeActionRuntime.js';

export class MinimalMeadowCombat {
	constructor(runtime) {
		this.runtime = runtime;
		this.clock = 0;
		this.cooldowns = new Map();
		this.projectiles = [];
		this.effects = [];
		this.cast = null;
		this.melee = null;
		this.lastCompletedAction = null;
		this.lastCooldownSignature = '';
		this.kavanah = new MinimalMeadowKavanahRuntime(runtime);
		this.unsubscribers = [
			runtime.bus.on('combat:activate', request => this.activate(request.actionId)),
			runtime.bus.on('combat:cancel-all', request => this.cancel(request?.reason)),
			runtime.bus.on('target:cycle', () => runtime.enemies.cycleTarget())
		];
		this.publishCooldowns(true);
	}

	activate(actionId) {
		return activateMinimalMeadowAction(this, ACTIONS, actionId);
	}

	update(deltaSeconds) {
		const delta = Math.max(0, Number(deltaSeconds) || 0);
		this.clock += delta;
		regenerateCombatStamina(this, delta);
		this.runtime.playerDefense?.update(delta, this.clock);
		if (this.cast) updateMinimalCombatCast(this, delta, launchMinimalCombatEffects);
		if (this.melee) updateMeleeAction(this, delta);
		updateMinimalCombatEffects(this, delta);
		this.publishCooldowns();
	}

	cancel(reason = 'CANCELLED') {
		return cancelMinimalMeadowCombat(this, reason);
	}

	complete(action) {
		completeCombatAction(this, action);
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
		return minimalMeadowCombatRuntimeDiagnostics(this, ACTIONS);
	}

	destroy() {
		this.cancel('DESTROYED');
		this.kavanah.destroy();
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}
