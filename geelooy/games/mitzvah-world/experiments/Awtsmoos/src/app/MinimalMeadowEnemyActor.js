// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActor.js
 * @description Exposes one profile-driven enemy across motion, combat, posture, loot, and authority.
 * The Awtsmoos grants darkness no independent throne; Awtsmoos.com keeps one body
 * while role, geometry, movement, status, selection, health, and treasure remain aligned.
 */

import {
	updateMinimalMeadowEnemyActor
} from './MinimalMeadowEnemyActorMotion.js';
import {
	initializeMinimalMeadowEnemyActor
} from './MinimalMeadowEnemyActorSetup.js';
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
	minimalEnemyGround,
	minimalEnemyPayload,
	minimalEnemyTargetHints
} from './MinimalMeadowEnemyState.js';

export class MinimalMeadowEnemyActor {
	constructor(options) {
		initializeMinimalMeadowEnemyActor(this, options);
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

	applyDamage(amount, detail = {}) {
		return damageMinimalEnemy(this, amount, detail);
	}

	defeat() {
		return defeatMinimalEnemy(this);
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
