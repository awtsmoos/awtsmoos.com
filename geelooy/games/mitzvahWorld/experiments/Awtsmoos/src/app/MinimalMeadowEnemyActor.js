// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActor.js
 * @description Makes one profile-driven enemy live, fight, fall, persist, and expose chosen loot.
 * The Awtsmoos grants darkness no independent throne; Awtsmoos.com keeps one continuous body
 * while archetype proportions distinguish broad warden, lean skirmisher, and tall cantor.
 */

import { createMinimalShadowCreatureMesh } from './MinimalMeadowCreatureMesh.js';
import { MinimalMeadowEnemyCombat } from './MinimalMeadowEnemyCombat.js';
import {
	updateMinimalMeadowEnemyActor
} from './MinimalMeadowEnemyActorMotion.js';
import {
	createMinimalMeadowEnemyActorState
} from './MinimalMeadowEnemyActorState.js';
import {
	clearMinimalEnemy,
	damageMinimalEnemy,
	defeatMinimalEnemy,
	interactWithMinimalEnemy,
	minimalEnemyPointerHit,
	targetMinimalEnemy
} from './MinimalMeadowEnemyLifecycle.js';
import {
	lootAllMinimalEnemyCorpse,
	takeMinimalEnemyCorpseItem
} from './MinimalMeadowEnemyLoot.js';
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
		this.profile = minimalShadowEnemyProfile(options.compiled, options.profile);
		Object.assign(this, createMinimalMeadowEnemyActorState(options, this.profile));
		this.group = createMinimalShadowCreatureMesh(options.compiled, this.profile);
		this.waypoints = minimalShadowWaypoints(this.profile);
		this.health = this.profile.maxHealth;
		this.combat = new MinimalMeadowEnemyCombat(this, this.runtime);
		applyEnemyBodyScale(this.group, this.profile);
		this.group.position.set(
			this.profile.x,
			this.ground(this.profile.x, this.profile.z),
			this.profile.z
		);
	}
	update(deltaSeconds) {
		updateMinimalMeadowEnemyActor(this, deltaSeconds);
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
	lootPreview() {
		return this.lootState.snapshot();
	}
	takeLootItem(itemId) {
		return takeMinimalEnemyCorpseItem(this, itemId);
	}
	takeAllLoot() {
		return lootAllMinimalEnemyCorpse(this);
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

function applyEnemyBodyScale(group, profile) {
	const body = profile.bodyScale || [1, 1, 1];
	const visual = Number(profile.visualScale) || 1;
	group.scale.set(
		visual * body[0],
		visual * body[1],
		visual * body[2]
	);
}
