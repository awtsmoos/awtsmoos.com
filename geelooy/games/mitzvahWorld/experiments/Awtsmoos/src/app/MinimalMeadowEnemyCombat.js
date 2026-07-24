// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombat.js
 * @description Guards one persistent encounter and delegates finite action and motion flows.
 * The Awtsmoos renews pursuit without accidental patrol; Awtsmoos.com holds role, target,
 * leash, sight, cooldown, effects, and transitions behind the actor's stable combat API.
 */

import {
	advanceMinimalEnemyAction,
	advanceMinimalEnemyRecovery,
	beginMinimalEnemyAction
} from './MinimalMeadowEnemyActionFlow.js';
import {
	MINIMAL_ENEMY_LOSS_TIMEOUT,
	minimalEnemyCombatRanges
} from './MinimalMeadowEnemyCombatDecision.js';
import { minimalEnemyCombatDiagnostics } from './MinimalMeadowEnemyCombatDiagnostics.js';
import { updateEnemyCombatEffects } from './MinimalMeadowEnemyCombatEffects.js';
import { MinimalMeadowEnemyCombatSession } from './MinimalMeadowEnemyCombatSession.js';
import {
	advanceMinimalEnemyAlert,
	advanceMinimalEnemyLocomotion,
	advanceMinimalEnemyPursuit
} from './MinimalMeadowEnemyLocomotionFlow.js';
import {
	faceMinimalEnemyToPlayer,
	minimalEnemyPerception
} from './MinimalMeadowEnemyNavigation.js';

export class MinimalMeadowEnemyCombat {
	constructor(actor, runtime) {
		Object.assign(this, {
			action: null,
			actionTime: 0,
			actor,
			attackCount: 0,
			cooldown: 0,
			effects: [],
			launched: false,
			lineOfSight: true,
			lineOfSightSource: 'unmeasured',
			projectiles: [],
			runtime,
			struck: false,
			withinLeash: true
		});
		this.session = new MinimalMeadowEnemyCombatSession(actor);
	}

	update(deltaSeconds) {
		updateEnemyCombatEffects(this, deltaSeconds);
		this.cooldown = Math.max(0, this.cooldown - deltaSeconds);
		if (!this.actor.alive || this.runtime.playerStats.health <= 0) return this.stopInactive();
		const perception = minimalEnemyPerception(this);
		this.lineOfSight = perception.lineOfSight;
		this.lineOfSightSource = perception.lineOfSightSource;
		const ranges = minimalEnemyCombatRanges(this);
		if (!this.session.active && perception.distance <= ranges.aggro) this.engage('aggro-radius');
		if (!this.session.active) return false;
		const delta = this.session.tick(deltaSeconds);
		this.actionTime = this.session.stateTime;
		this.withinLeash = perception.homeDistance <= ranges.leash
			&& perception.distance <= ranges.leash * 1.3;
		this.session.observe(perception.lineOfSight, this.withinLeash, delta);
		if (this.session.lossTime >= MINIMAL_ENEMY_LOSS_TIMEOUT) return this.disengage();
		faceMinimalEnemyToPlayer(this);
		return this.advance(perception, delta);
	}

	engage(reason) {
		if (!this.session.engage(reason)) return;
		this.cooldown = Math.max(this.cooldown, this.session.openingDelay);
		this.actor.moving = false;
		this.runtime.bus.emit('enemy:alert', this.actor.payload());
	}

	advance(perception, deltaSeconds) {
		const state = this.session.state;
		if (state === 'alerted') return advanceMinimalEnemyAlert(this);
		if (isActionState(state)) return advanceMinimalEnemyAction(this);
		if (state === 'recovery') return advanceMinimalEnemyRecovery(this);
		if (!this.lineOfSight || !this.withinLeash) return advanceMinimalEnemyPursuit(this, deltaSeconds);
		return advanceMinimalEnemyLocomotion(
			this,
			perception.distance,
			deltaSeconds,
			beginMinimalEnemyAction
		);
	}

	disengage() {
		this.runtime.bus.emit('enemy:return', this.actor.payload());
		this.session.reset('target-genuinely-lost');
		this.action = null;
		this.actor.action = 'idle';
		this.actor.moving = false;
		return false;
	}

	stopInactive() {
		if (this.session.active) {
			this.session.reset(this.actor.alive ? 'player-defeated' : 'enemy-defeated');
		}
		return false;
	}

	diagnostics() {
		return minimalEnemyCombatDiagnostics(this);
	}
}

function isActionState(state) {
	return state === 'melee-windup'
		|| state === 'melee-impact'
		|| state === 'cast-windup';
}
