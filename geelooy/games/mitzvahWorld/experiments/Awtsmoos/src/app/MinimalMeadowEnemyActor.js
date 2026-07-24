// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActor.js
 * @description Makes one profile-driven skinned demon live, fight, fall, persist, and become lootable.
 * The Awtsmoos grants darkness no independent throne; Awtsmoos.com keeps one continuous body
 * through patrol, pack pursuit, attack, recoil, corpse pose, selection, and one-time inventory loot.
 */

import { animateMinimalShadowCreature } from './MinimalMeadowCreatureAnimation.js';
import { createMinimalShadowCreatureMesh } from './MinimalMeadowCreatureMesh.js';
import { MinimalMeadowEnemyCombat } from './MinimalMeadowEnemyCombat.js';
import {
	clearMinimalEnemy,
	damageMinimalEnemy,
	defeatMinimalEnemy,
	interactWithMinimalEnemy,
	minimalEnemyPointerHit,
	targetMinimalEnemy
} from './MinimalMeadowEnemyLifecycle.js';
import {
	minimalShadowEnemyProfile,
	minimalShadowWaypoints
} from './MinimalMeadowEnemyProfile.js';
import {
	minimalEnemyGround,
	minimalEnemyPayload,
	minimalEnemyTargetHints
} from './MinimalMeadowEnemyState.js';

export class MinimalMeadowEnemyActor {
	constructor(options) {
		Object.assign(this, initialState(options));
		this.profile = minimalShadowEnemyProfile(options.compiled, options.profile);
		this.group = createMinimalShadowCreatureMesh(options.compiled, this.profile);
		this.waypoints = minimalShadowWaypoints(this.profile);
		this.health = this.profile.maxHealth;
		this.combat = new MinimalMeadowEnemyCombat(this, this.runtime);
		this.group.scale.set(
			this.profile.visualScale,
			this.profile.visualScale,
			this.profile.visualScale
		);
		this.group.position.set(
			this.profile.x,
			this.ground(this.profile.x, this.profile.z),
			this.profile.z
		);
	}

	update(deltaSeconds) {
		if (!this.alive) {
			this.updateCorpse(deltaSeconds);
			return;
		}
		if (!this.combat.update(deltaSeconds)) {
			this.wander(deltaSeconds);
		}
		this.group.position.y = this.ground(
			this.group.position.x,
			this.group.position.z
		);
		animateMinimalShadowCreature(this, deltaSeconds);
	}

	wander(deltaSeconds) {
		const target = this.waypoints[this.waypointIndex];
		const deltaX = target.x - this.group.position.x;
		const deltaZ = target.z - this.group.position.z;
		const distance = Math.hypot(deltaX, deltaZ);
		this.moving = distance >= 0.65;
		this.action = this.moving ? 'walk' : 'idle';
		if (!this.moving) {
			this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
			return;
		}
		this.move(deltaX, deltaZ, distance, deltaSeconds);
	}

	updateCorpse(deltaSeconds) {
		this.deathTime += deltaSeconds;
		this.action = this.deathTime < 1.2 ? 'death' : 'corpse';
		animateMinimalShadowCreature(this, deltaSeconds);
		this.group.position.y = this.ground(
			this.group.position.x,
			this.group.position.z
		);
	}

	move(deltaX, deltaZ, distance, deltaSeconds) {
		if (distance <= 0.0001) {
			return;
		}
		const step = Math.min(distance, this.profile.speed * deltaSeconds);
		this.group.position.x += deltaX / distance * step;
		this.group.position.z += deltaZ / distance * step;
		const yaw = Math.atan2(deltaX, deltaZ);
		this.group.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
	}

	hitPointer(event) {
		return minimalEnemyPointerHit(this, event);
	}

	target() {
		return targetMinimalEnemy(this);
	}

	interact() {
		return interactWithMinimalEnemy(this);
	}

	clear(silent = false) {
		clearMinimalEnemy(this, silent);
	}

	applyDamage(amount) {
		return damageMinimalEnemy(this, amount);
	}

	defeat() {
		defeatMinimalEnemy(this);
	}

	payload() {
		return minimalEnemyPayload(this);
	}

	targetHint() {
		return this.targetHints()[1];
	}

	targetHints() {
		return minimalEnemyTargetHints(this);
	}

	ground(x, z) {
		return minimalEnemyGround(this, x, z);
	}
}

function initialState(options) {
	return {
		action: 'idle',
		actionProgress: 0,
		alive: true,
		bus: options.bus,
		camera: options.camera,
		canvas: options.canvas,
		deathTime: 0,
		hitTime: 0,
		looted: false,
		moving: false,
		pack: options.pack,
		runtime: options.runtime,
		selected: false,
		terrain: options.terrain,
		visualClock: 0,
		waypointIndex: 0
	};
}
