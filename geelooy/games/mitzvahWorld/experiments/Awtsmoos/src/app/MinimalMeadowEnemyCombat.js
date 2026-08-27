// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombat.js
 * @description Guards one persistent encounter and releases hostile ownership at safe-region borders.
 * The Awtsmoos renews pursuit without a mob becoming one blow; Awtsmoos.com keeps role, target,
 * leash, sight, slot, cooldown, safety, effect, and transition behind one stable combat API.
 */

import {
	advanceMinimalMeadowEnemyCombat
} from './MinimalMeadowEnemyCombatAdvance.js';
import {
	MINIMAL_ENEMY_LOSS_TIMEOUT,
	minimalEnemyCombatRanges
} from './MinimalMeadowEnemyCombatDecision.js';
import { minimalEnemyCombatDiagnostics } from './MinimalMeadowEnemyCombatDiagnostics.js';
import { updateEnemyCombatEffects } from './MinimalMeadowEnemyCombatEffects.js';
import {
	initializeMinimalMeadowEnemyCombat
} from './MinimalMeadowEnemyCombatState.js';
import {
	faceMinimalEnemyToPlayer,
	minimalEnemyPerception
} from './MinimalMeadowEnemyNavigation.js';

export class MinimalMeadowEnemyCombat {
	constructor(actor, runtime) {
		initializeMinimalMeadowEnemyCombat(this, actor, runtime);
	}

	update(deltaSeconds) {
		updateEnemyCombatEffects(this, deltaSeconds);
		this.cooldown = Math.max(0, this.cooldown - deltaSeconds);
		if (!this.actor.alive
			|| this.runtime.playerDefeat?.isDefeated?.()
			|| this.runtime.playerStats.health <= 0) {
			return this.stopInactive();
		}
		if (this.runtime.regions?.isSafe?.()) {
			return this.session.active
				? this.disengage('player-entered-safe-region')
				: false;
		}
		const perception = minimalEnemyPerception(this);
		this.lineOfSight = perception.lineOfSight;
		this.lineOfSightSource = perception.lineOfSightSource;
		const ranges = minimalEnemyCombatRanges(this);
		if (!this.session.active && perception.distance <= ranges.aggro) {
			this.engage('aggro-radius');
		}
		if (!this.session.active) return false;
		const delta = this.session.tick(deltaSeconds);
		this.actionTime = this.session.stateTime;
		this.withinLeash = perception.homeDistance <= ranges.leash
			&& perception.distance <= ranges.leash * 1.3;
		this.session.observe(perception.lineOfSight, this.withinLeash, delta);
		if (this.session.lossTime >= MINIMAL_ENEMY_LOSS_TIMEOUT) return this.disengage();
		faceMinimalEnemyToPlayer(this);
		return advanceMinimalMeadowEnemyCombat(this, perception, delta);
	}

	engage(reason) {
		if (!this.session.engage(reason)) return;
		this.cooldown = Math.max(this.cooldown, this.session.openingDelay);
		this.actor.moving = false;
		this.runtime.bus.emit('enemy:alert', this.actor.payload());
	}

	disengage(reason = 'target-genuinely-lost') {
		this.runtime.bus.emit('enemy:return', {
			...this.actor.payload(),
			reason
		});
		this.releaseAttackSlot();
		this.session.reset(reason);
		this.resetActorAction();
		return false;
	}

	stopInactive() {
		this.releaseAttackSlot();
		if (this.session.active) {
			this.session.reset(
				this.actor.alive ? 'player-defeated' : 'enemy-defeated'
			);
		}
		this.resetActorAction();
		return false;
	}

	resetActorAction() {
		this.action = null;
		this.actor.action = 'idle';
		this.actor.moving = false;
	}

	releaseAttackSlot() {
		this.runtime.combatBalance?.releaseActor?.(this.actor.profile.id);
	}

	diagnostics() {
		return {
			...minimalEnemyCombatDiagnostics(this),
			balance: this.runtime.combatBalance?.diagnostics?.() || null,
			safeRegion: this.runtime.regions?.isSafe?.() || false
		};
	}
}
