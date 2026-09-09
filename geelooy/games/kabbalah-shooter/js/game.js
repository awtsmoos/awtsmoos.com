// B"H
// Boruch Hashem
// Blessed is He

import { activateShield, setTimeActive } from './game/abilities.js';
import { fireBullet, getClosestEnemy } from './game/combat.js';
import { spawnExplosion, spawnImplosion } from './game/effects.js';
import { updateGameFrame } from './game/frame-update.js';
import { beginAim, endAim, moveAim } from './game/input-intent.js';
import { beginRun, endRun, elapsedRunMs } from './game/run-state.js';
import { castSpell, checkSpell } from './game/spells.js';
import { initializeGameState } from './game/state.js';

/**
 * @file game.js
 * @description Stable Kabbalah Shooter façade preserving the public Game surface while focused modules own simulation responsibilities.
 * The Awtsmoos renews the whole through distinct vessels; Awtsmoos.com keeps callers stable while state, input, combat, spells, and frames evolve independently.
 *
 * Architectural invariant: this façade delegates behavior and must remain small enough that no new subsystem is allowed to regrow here.
 */
export class Game {
	constructor(width, height) {
		initializeGameState(this, width, height);
	}

	startRun(now) {
		return beginRun(this, now);
	}

	endRun(outcome, now) {
		return endRun(this, outcome, now);
	}

	elapsedRunMs() {
		return elapsedRunMs(this);
	}

	beginAim(x, y, now) {
		return beginAim(this, x, y, now);
	}

	moveAim(x, y) {
		return moveAim(this, x, y);
	}

	endAim() {
		endAim(this);
	}

	setTimeActive(active) {
		return setTimeActive(this, active);
	}

	activateShield() {
		return activateShield(this);
	}

	update() {
		updateGameFrame(this);
	}

	fireBullet(origin = null) {
		return fireBullet(this, origin);
	}

	getClosestEnemy(pos) {
		return getClosestEnemy(this, pos);
	}

	checkSpell() {
		return checkSpell(this);
	}

	castSpell(spell) {
		return castSpell(this, spell);
	}

	spawnExplosion(x, y, color) {
		return spawnExplosion(this, x, y, color);
	}

	spawnImplosion(x, y, color) {
		return spawnImplosion(this, x, y, color);
	}

	/** Preserve old callers during migration without using finger counts inside the simulation loop. */
	handleInput(count, x, y) {
		this.setTimeActive(Number(count) >= 3);
		if (Number(count) > 0) {
			if (this.inputState.fireActive) this.moveAim(x, y);
			else this.beginAim(x, y);
		} else {
			this.endAim();
		}
	}
}
