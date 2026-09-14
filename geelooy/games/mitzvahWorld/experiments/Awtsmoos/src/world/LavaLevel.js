//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file LavaLevel.js
 * @description Coordinates the deferred lava challenge while focused modules own route, coins, collision, player placement, runtime actions, and diagnostics.
 * The class preserves the historical public API without compressed statements, external libraries, or private renderer construction.
 */

import { createNativeWorldGroup } from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import {
	createPrimitiveMesh,
	primitiveColliders
} from './Box3D.js';
import {
	ERETZ_RETURN,
	LAVA_START,
	LAVA_Y,
	lavaWorldDefs
} from './lava/LavaCourseDefinitions.js';
import { createLavaCoins } from './lava/LavaCoinFactory.js';
import { buildLavaOctree } from './lava/LavaOctree.js';
import { resetLavaPlayer } from './lava/LavaPlayerState.js';
import {
	enterLavaLevel,
	failLavaLevel,
	lavaTouched,
	leaveLavaLevel,
	updateLavaLevel
} from './lava/LavaRuntimeActions.js';
import { createLavaStats } from './lava/LavaStats.js';

export {
	ERETZ_RETURN,
	LAVA_START,
	lavaWorldDefs
};

/** Coordinates one deferred lava challenge instance without owning low-level renderer primitives. */
export class LavaLevel {
	/**
	 * Creates one hidden challenge, its colliders, collectible records, and isolated collision octree.
	 * @param {object} scene Scene root exposing add().
	 * @param {object} [assets={}] Optional already-hydrated visual assets.
	 */
	constructor(scene, assets = {}) {
		this.group = createNativeWorldGroup({
			name: 'Awtsmoos_long_lava_coin_world_easy_extended'
		});
		this.group.visible = false;
		this.assets = assets;
		this.defs = lavaWorldDefs(assets);
		this.coins = createLavaCoins(assets);
		this.collected = 0;
		this.failures = 0;
		this.active = false;
		this.notice = '';
		this.build();
		this.octree = buildLavaOctree(this.colliders);
		scene.add(this.group);
	}

	/** Materializes semantic course descriptors and collectible groups into the challenge root. */
	build() {
		this.colliders = this.defs.flatMap(primitiveColliders);
		for (const definition of this.defs) {
			this.group.add(createPrimitiveMesh(definition));
		}
		for (const coin of this.coins) {
			this.group.add(coin.group);
		}
	}

	/** Returns the lethal lava-surface height used by collision and failure checks. */
	heightAt() {
		return LAVA_Y + 0.09;
	}

	/** Activates the challenge and transfers movement collision authority into its octree. */
	enter(state, ground, mover, footOffset) {
		enterLavaLevel(this, state, ground, mover, footOffset);
	}

	/** Deactivates lava and restores the canonical Eretz movement octree and spawn. */
	leave(state, ground, mover, mainOctree, footOffset) {
		leaveLavaLevel(this, state, ground, mover, mainOctree, footOffset);
	}

	/** Applies lethal-surface and coin-collection simulation for one active frame. */
	update(state, ground, footOffset) {
		updateLavaLevel(this, state, ground, footOffset);
	}

	/** Tests whether the player's feet have reached the lethal lava surface. */
	touchedLava(state, footOffset) {
		return lavaTouched(state, footOffset);
	}

	/** Resets all collectible progress and returns the player to the course start. */
	fail(state, ground, footOffset) {
		failLavaLevel(this, state, ground, footOffset);
	}

	/** Preserves the historical public reset helper while delegating placement logic. */
	resetPlayer(state, ground, footOffset) {
		resetLavaPlayer(state, ground, footOffset);
	}

	/** Returns the stable historical diagnostics contract for this challenge instance. */
	stats() {
		return createLavaStats(this);
	}
}
