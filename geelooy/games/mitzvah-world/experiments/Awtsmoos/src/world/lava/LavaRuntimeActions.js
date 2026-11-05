//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file LavaRuntimeActions.js
 * @description Owns enter, leave, collection, lethal-surface, and reset transitions for one LavaLevel state owner.
 * Simulation remains plain native JavaScript and never allocates renderer objects.
 */

import { LAVA_Y } from './LavaCourseDefinitions.js';
import {
	collectNearbyLavaCoins,
	resetLavaCoins
} from './LavaCoinProgress.js';
import {
	resetLavaPlayer,
	returnPlayerToEretz
} from './LavaPlayerState.js';

/** Activates challenge collision, visibility, notice, level identity, and start placement. */
export function enterLavaLevel(level, state, ground, mover, footOffset) {
	level.active = true;
	level.group.visible = true;
	level.notice = 'Long lava course: collect every coin; lava resets the count.';
	state.level = 'lava-coin-course';
	resetLavaPlayer(state, ground, footOffset);

	if (mover) {
		mover.octree = level.octree;
	}
}

/** Deactivates the challenge and restores canonical Eretz movement authority and placement. */
export function leaveLavaLevel(
	level,
	state,
	ground,
	mover,
	mainOctree,
	footOffset
) {
	level.active = false;
	level.group.visible = false;
	level.notice = '';
	state.level = 'eretz';
	returnPlayerToEretz(state, ground, footOffset);

	if (mover) {
		mover.octree = mainOctree;
	}
}

/** Applies one active-frame lethal-surface check and collectible update. */
export function updateLavaLevel(level, state, ground, footOffset) {
	if (!level.active) {
		return;
	}
	if (lavaTouched(state, footOffset)) {
		failLavaLevel(level, state, ground, footOffset);
		return;
	}
	const collected = collectNearbyLavaCoins(
		level.coins,
		state,
		footOffset
	);
	if (collected <= 0) {
		return;
	}
	level.collected += collected;
	level.notice = `Coin collected: ${level.collected}/${level.coins.length}`;
}

/** Tests whether the player's foot level has entered the lethal lava surface. */
export function lavaTouched(state, footOffset) {
	return state.y - footOffset <= LAVA_Y + 0.30;
}

/** Resets challenge progress after lava contact and returns the traveler to the start. */
export function failLavaLevel(level, state, ground, footOffset) {
	level.failures += 1;
	level.notice = `Lava reset ${level.failures}; coins 0/${level.coins.length}.`;
	resetLavaCoins(level.coins);
	level.collected = 0;
	resetLavaPlayer(state, ground, footOffset);
}
