// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActor.js
 * @description Makes one profile-driven skinned demon live, fight, fall, persist, and become lootable.
 * The Awtsmoos grants darkness no independent throne; Awtsmoos.com keeps one continuous body
 * through patrol, pack pursuit, attack, recoil, corpse pose, selection, and one-time inventory loot.
 */

import { animateMinimalShadowCreature } from './MinimalMeadowCreatureAnimation.js?v=20260724-meadow-13';
import { createMinimalShadowCreatureMesh } from './MinimalMeadowCreatureMesh.js?v=20260724-meadow-17';
import { MinimalMeadowEnemyCombat } from './MinimalMeadowEnemyCombat.js?v=20260724-meadow-17';
import {
	clearMinimalEnemy,
	damageMinimalEnemy,
	defeatMinimalEnemy,
	interactWithMinimalEnemy,
	minimalEnemyPointerHit,
	targetMinimalEnemy
} from './MinimalMeadowEnemyLifecycle.js?v=20260724-meadow-17';
import { minimalShadowEnemyProfile, minimalShadowWaypoints } from './MinimalMeadowEnemyProfile.js?v=20260724-meadow-17';
import { minimalEnemyGround, minimalEnemyPayload, minimalEnemyTargetHints } from './MinimalMeadowEnemyState.js?v=20260724-meadow-17';

export class MinimalMeadowEnemyActor {
	constructor(options) {
		Object.assign(this, initialState(options));
		this.profile = minimalShadowEnemyProfile(options.compiled, options.profile);
		this.group = createMinimalShadowCreatureMesh(options.compiled, this.profile);
		this.waypoints = minimalShadowWaypoints(this.profile);
		this.health = this.profile.maxHealth;
		this.combat = new MinimalMeadowEnemyCombat(this, this.runtime);
		this.group.scale.set(this.profile.visualScale, this.profile.visualScale, this.profile.visualScale);
		this.group.position.set(this.profile.x, this.ground(this.profile.x, this.profile.z), this.profile.z);
	}

	update(deltaSeconds) {
		if (!this.alive) return this.updateCorpse(deltaSeconds);
		if (!this.combat.update(deltaSeconds)) this.wander(deltaSeconds);
		this.group.position.y = this.ground(this.group.position.x, this.group.position.z);
		animateMinimalShadowCreature(this, deltaSeconds);
	}

	wander(deltaSeconds) {
		const target = this.waypoints[this.waypointIndex];
		const dx = target.x - this.group.position.x;
		const dz = target.z - this.group.position.z;
		const distance = Math.hypot(dx, dz);
		this.moving = distance >= 0.65;
		this.action = this.moving ? 'walk' : 'idle';
		if (!this.moving) this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
		else this.move(dx, dz, distance, deltaSeconds);
	}

	updateCorpse(deltaSeconds) {
		this.deathTime += deltaSeconds;
		this.action = this.deathTime < 1.2 ? 'death' : 'corpse';
		animateMinimalShadowCreature(this, deltaSeconds);
		this.group.position.y = this.ground(this.group.position.x, this.group.position.z);
	}

	move(dx, dz, distance, deltaSeconds) {
		if (distance <= 0.0001) return;
		const step = Math.min(distance, this.profile.speed * deltaSeconds);
		this.group.position.x += dx / distance * step;
		this.group.position.z += dz / distance * step;
		const yaw = Math.atan2(dx, dz);
		this.group.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
	}

	hitPointer(event) { return minimalEnemyPointerHit(this, event); }
	target() { return targetMinimalEnemy(this); }
	interact() { return interactWithMinimalEnemy(this); }
	clear(silent = false) { clearMinimalEnemy(this, silent); }
	applyDamage(amount) { return damageMinimalEnemy(this, amount); }
	defeat() { defeatMinimalEnemy(this); }
	payload() { return minimalEnemyPayload(this); }
	targetHint() { return this.targetHints()[1]; }
	targetHints() { return minimalEnemyTargetHints(this); }
	ground(x, z) { return minimalEnemyGround(this, x, z); }
}

function initialState(options) {
	return {
		alive: true,
		action: 'idle',
		actionProgress: 0,
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
