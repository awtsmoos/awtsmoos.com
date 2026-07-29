// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombat.js
 * @description Coordinates lawful casting, melee, defense, resources, and cancellation.
 * The Awtsmoos creates intention before consequence; Awtsmoos.com tests equipment,
 * stamina, combo, timing, geometry, cooldown, transition, and authority in one flow.
 */
import { MINIMAL_MEADOW_COMBAT_ACTIONS as ACTIONS } from './MinimalMeadowCombatActions.js';
import { activateMinimalCombat, updateMinimalCombatCast } from './MinimalMeadowCombatCastRuntime.js';
import { minimalCombatCooldownRemaining, minimalCombatDiagnostics, publishMinimalCombatCooldowns } from './MinimalMeadowCombatCooldownRuntime.js';
import { launchMinimalCombatEffects, updateMinimalCombatEffects } from './MinimalMeadowCombatEffectsAdapter.js';
import { faceMinimalCombatTarget, minimalCombatCastPayload, minimalCombatDistance, rewardMinimalCombatPlayer } from './MinimalMeadowCombatSupport.js';
import { combatActionRejection, completeCombatAction, regenerateCombatStamina, spendCombatActionCost } from './combat/CombatActionEligibility.js';
import { cancelMeleeAction, startMeleeAction, updateMeleeAction } from './combat/MeleeActionRuntime.js';

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
		this.unsubscribers = [
			runtime.bus.on('combat:activate', request => this.activate(request.actionId)),
			runtime.bus.on('combat:cancel-all', request => this.cancel(request?.reason)),
			runtime.bus.on('target:cycle', () => runtime.enemies.cycleTarget())
		];
		this.publishCooldowns(true);
	}
	activate(actionId) {
		const action = ACTIONS[actionId];
		if (!action) return this.reject('UNKNOWN_ACTION', { actionId });
		const rejection = combatActionRejection(this, action);
		if (rejection) return this.reject(rejection, { actionId });
		spendCombatActionCost(this, action);
		if (action.type === 'cast') return activateMinimalCombat(this, ACTIONS, actionId);
		if (action.type === 'melee') return startMeleeAction(this, action, actionId);
		this.runtime.bus.emit('combat:defense-intent', { action, actionId });
		this.cooldowns.set(actionId, this.clock + action.cooldown);
		completeCombatAction(this, action);
		this.publishCooldowns(true);
		return { accepted: true, actionId };
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
		const castPayload = { ...this.castPayload(), reason };
		const cancelledMelee = cancelMeleeAction(this, reason);
		if (this.cast) {
			this.cast = null;
			this.runtime.bus.emit('combat:cast-cancel', castPayload);
		}
		this.runtime.playerDefense?.endGuard(this.clock, 0.15);
		return { accepted: cancelledMelee || Boolean(castPayload.actionId), reason };
	}
	complete(action) { completeCombatAction(this, action); }
	cooldownRemaining(actionId) { return minimalCombatCooldownRemaining(this, actionId); }
	publishCooldowns(force = false) { return publishMinimalCombatCooldowns(this, ACTIONS, force); }
	faceTarget(target) { return faceMinimalCombatTarget(this.runtime, target); }
	reward(amount) { return rewardMinimalCombatPlayer(this.runtime, amount); }
	distanceTo(target) { return minimalCombatDistance(this.runtime.state, target.group.position); }
	acquireTarget() { this.runtime.enemies.cycleTarget(); return this.runtime.enemies.selected; }
	reject(reason, detail = {}) {
		this.runtime.bus.emit('combat:rejected', { ...detail, reason });
		return { accepted: false, reason };
	}
	castPayload() { return minimalCombatCastPayload(this.cast); }
	diagnostics() {
		return {
			...minimalCombatDiagnostics(this, ACTIONS),
			defense: this.runtime.playerDefense?.snapshot(this.clock) || null,
			lastCompletedAction: this.lastCompletedAction,
			melee: this.melee ? { actionId: this.melee.actionId, elapsed: this.melee.elapsed, hits: this.melee.hitIds.size } : null,
			stamina: this.runtime.playerStats.stamina
		};
	}
	destroy() {
		this.cancel('DESTROYED');
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}
