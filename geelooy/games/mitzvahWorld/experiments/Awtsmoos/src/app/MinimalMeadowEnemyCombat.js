// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombat.js
 * @description Gives each demon pack-aware chase, melee, ranged Hebrew cast, and cooldown.
 * The Awtsmoos bounds opposition by warning and distance; Awtsmoos.com lets temperament,
 * nearby alarm, elbow strike, red projectile, damage, and recovery drive one named animation.
 */

import {
	beginEnemyMeleeStrike,
	executeEnemyMeleeImpact,
	finishEnemyAttack,
	launchEnemyRangedAttack
} from './MinimalMeadowEnemyAttackExecution.js?v=20260724-meadow-13';
import {
	chaseEnemyTowardPlayer,
	enemyActionDuration,
	enemyAggroRange,
	enemyDistanceToPlayer,
	enemyPrefersRanged,
	faceEnemyTowardPlayer
} from './MinimalMeadowEnemyCombatDecision.js?v=20260724-meadow-17';
import { updateEnemyCombatEffects } from './MinimalMeadowEnemyCombatEffects.js?v=20260724-meadow-13';

export class MinimalMeadowEnemyCombat {
	constructor(actor, runtime) {
		Object.assign(this, {
			action: null,
			actionTime: 0,
			actor,
			attackCount: 0,
			cooldown: Math.random() * 0.8,
			effects: [],
			projectiles: [],
			runtime,
			struck: false
		});
	}

	update(deltaSeconds) {
		updateEnemyCombatEffects(this, deltaSeconds);
		this.cooldown = Math.max(0, this.cooldown - deltaSeconds);
		if (!this.actor.alive || this.runtime.playerStats.health <= 0) return false;
		if (this.action) return this.updateAction(deltaSeconds);
		const distance = enemyDistanceToPlayer(this);
		if (distance > enemyAggroRange(this)) return false;
		faceEnemyTowardPlayer(this);
		if (distance <= 2.35 && this.cooldown === 0) return this.begin('melee-windup');
		if (distance <= 12 && enemyPrefersRanged(this, distance) && this.cooldown === 0) return this.begin('ranged-cast');
		chaseEnemyTowardPlayer(this, deltaSeconds);
		return true;
	}

	updateAction(deltaSeconds) {
		this.actionTime += deltaSeconds;
		this.actor.actionProgress = this.progress();
		this.actor.action = this.action;
		faceEnemyTowardPlayer(this);
		if (this.action === 'melee-windup' && this.actionTime >= 0.48) return beginEnemyMeleeStrike(this);
		if (this.action === 'melee-strike' && this.actionTime >= 0.16 && !this.struck) executeEnemyMeleeImpact(this);
		if (this.action === 'melee-strike' && this.actionTime >= 0.55) finishEnemyAttack(this, 1.15);
		if (this.action === 'ranged-cast' && this.actionTime >= 1.05) launchEnemyRangedAttack(this);
		return true;
	}

	begin(action) {
		this.action = action;
		this.actionTime = 0;
		this.struck = false;
		this.actor.action = action;
		this.actor.actionProgress = 0;
		this.runtime.bus.emit('enemy:cast', {
			action,
			duration: enemyActionDuration(action),
			enemyId: this.actor.profile.id,
			letters: action === 'ranged-cast' ? 'דין' : 'מכה'
		});
		return true;
	}

	progress() {
		return Math.min(1, this.actionTime / enemyActionDuration(this.action));
	}

	diagnostics() {
		return { action: this.action, attacks: this.attackCount, effects: this.effects.length, projectiles: this.projectiles.length };
	}
}
