// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonActor.js
 * @description Coordinates one targetable shadow through state, motion, combat, and cadence.
 * The Awtsmoos recreates every finite trial without division; Awtsmoos.com joins explicit
 * contracts while visual form, terrain law, targeting, and damage remain separate vessels.
 */

import { npcPointerHits } from '../npc/NpcPointerRay.js';
import { chooseEnemyAttack } from './EnemyAttackCatalog.js';
import {
	advanceEnemyAttack,
	beginEnemyAttack,
	enemyAttackCooldownEnds
} from './EnemyAttackTimeline.js';
import { enemyTargetContract } from './EnemyTargetContract.js';
import { EnemyUpdateCadence } from './EnemyUpdateCadence.js';
import { applyTorahLight, attackPlayerFromShadow, updateShadowRespawn } from './ShadowDemonCombat.js';
import { resolveEnemyState } from './EnemyStatePolicy.js';
import { ENEMY_STATE } from './EnemyStates.js';
import { compileEnemyWanderPath } from './EnemyWanderPath.js';
import { planarDistance, updateShadowDemonMotion } from './ShadowDemonMotion.js';
import { animateShadowDemonVisual, createShadowDemonVisual } from './ShadowDemonVisual.js';
import { pointInsideVillageSanctuary } from './VillageSanctuaryPolicy.js';

export class ShadowDemonActor {
	constructor(options) {
		Object.assign(this, options);
		this.health = this.profile.maxHealth;
		this.state = ENEMY_STATE.SPAWN;
		this.stateElapsed = 0;
		this.selected = false;
		this.engaged = false;
		this.nextAttackAt = 0;
		this.respawnAt = 0;
		this.stagger = 0;
		this.staggerUntil = 0;
		this.statusEffects = [];
		this.attackIndex = 0;
		this.attackTimeline = null;
		this.currentAttack = null;
		this.visualClock = 0;
		this.lastTerritoryDecision = null;
		this.cadence = new EnemyUpdateCadence();
		this.waypoints = compileEnemyWanderPath(this.profile);
		this.waypointIndex = 0;
		Object.assign(this, createShadowDemonVisual(this.profile, this.ground));
	}

	update(deltaTime, playerState, now = performance.now() / 1000) {
		if (this.state === ENEMY_STATE.DEFEATED) {
			updateShadowRespawn(this, now);
			return;
		}
		const distance = planarDistance(this.group.position, playerState);
		const released = this.cadence.advance(deltaTime, {
			distance,
			selected: this.selected,
			state: this.state
		});
		animateShadowDemonVisual(this, deltaTime);
		if (!released) return;
		this.statusEffects = this.statusEffects.filter(effect => effect.until > now);
		this.stateElapsed += released;
		const attackState = this.advanceAttack(playerState, now);
		const previousState = this.state;
		this.state = resolveEnemyState(this.stateContext(playerState, now, attackState));
		if (this.state !== previousState) this.stateElapsed = 0;
		if (this.state === ENEMY_STATE.ALERT && !this.engaged) {
			this.engaged = true;
			this.bus.emit('enemy:alert', this.payload());
		}
		if (this.state === ENEMY_STATE.ATTACK_ANTICIPATION && !this.attackTimeline) {
			this.beginAttack(distance, now);
		}
		updateShadowDemonMotion(this, released, playerState);
	}

	advanceAttack(playerState, now) {
		if (!this.attackTimeline) return null;
		const phase = advanceEnemyAttack(this.attackTimeline, now);
		if (phase.damageWindowOpened) attackPlayerFromShadow(this, playerState, now);
		if (!phase.complete) return phase.state;
		this.nextAttackAt = enemyAttackCooldownEnds(this.attackTimeline);
		this.attackTimeline = null;
		this.currentAttack = null;
		this.attackIndex += 1;
		return null;
	}

	beginAttack(distance, now) {
		this.currentAttack = chooseEnemyAttack(this.profile.creatureType, this.attackIndex, distance);
		this.attackTimeline = beginEnemyAttack(this.currentAttack, now);
		this.bus.emit('enemy:telegraph', { attack: this.currentAttack, enemy: this.payload() });
	}

	stateContext(playerState, now, attackState) {
		return {
			aggroRange: this.profile.aggroRange,
			attackRange: this.currentAttack?.range || this.profile.attackRange,
			attackState,
			currentState: this.state,
			engaged: this.engaged,
			enemyInSanctuary: pointInsideVillageSanctuary(this.group.position),
			health: this.health,
			homeArrivalRange: this.profile.homeArrivalRange,
			homeDistance: planarDistance(this.group.position, this.profile),
			leashRange: this.profile.leashRange,
			nextAttackAt: this.nextAttackAt,
			noticeSeconds: this.profile.noticeSeconds,
			now,
			playerDistance: planarDistance(this.group.position, playerState),
			playerInSanctuary: pointInsideVillageSanctuary(playerState),
			returnReason: this.forcedReturnReason,
			spawnSeconds: this.profile.spawnSeconds,
			staggerUntil: this.staggerUntil,
			stateElapsed: this.stateElapsed
		};
	}

	hitPointer(event) {
		return this.state !== ENEMY_STATE.DEFEATED
		&& npcPointerHits(event, this.camera, this.canvas, this.targetHint());
	}

	target() {
		this.selected = true;
		this.bus.emit('npc:target', this.payload());
	}

	clear(silent = false) {
		this.selected = false;
		if (!silent) this.bus.emit('npc:clear', this.payload());
	}

	applyTorahPassage(passage, playerState, now = performance.now() / 1000) {
		return applyTorahLight(this, passage, playerState, now);
	}

	payload() {
		return {
			...enemyTargetContract(this),
			attackable: true,
			attackId: this.currentAttack?.id || null,
			creatureType: this.profile.creatureType,
			level: 'Hostile shadow',
			territory: this.lastTerritoryDecision
		};
	}

	targetHint() {
		return { x: this.group.position.x, y: this.group.position.y + 1.3, z: this.group.position.z };
	}
}
