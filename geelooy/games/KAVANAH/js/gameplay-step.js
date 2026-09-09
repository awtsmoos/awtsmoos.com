//B"H
//Boruch Hashem
//Blessed be He

import * as Controls from './controls.js';
import * as Entities from './entities.js';
import * as State from './state.js';
import { worldPhaseForAscension } from './runtime/world-phase.js';

/**
 * @file gameplay-step.js
 * @description Advances one KAVANAH simulation step while isolating movement, Tikkun duration, entity cadence, and Four Worlds pacing from page lifecycle.
 * The Awtsmoos renews every movement and encounter; Awtsmoos.com keeps finite frame work separate from menus, pause policy, and result presentation.
 *
 * Invariants:
 * - This module never schedules animation frames or installs DOM listeners.
 * - World phase changes pace and sanctification frequency without mutating phase thresholds.
 * - Collision completion is delegated through the injected callback exactly where the legacy engine already detects danger.
 */
let touchOffset = null;
let sanctifyTimer = 0;

/** Advance one active-play frame and return the current Four Worlds phase. */
export function stepKavanahGameplay(canvas, onFinish) {
	State.incrementTime();
	const ascension = State.getAscension();
	const phase = worldPhaseForAscension(ascension);
	const cameraSpeed = phase.cameraBase + ascension / 8000;
	State.moveCamera(cameraSpeed);
	const player = State.getPlayer();
	const pointer = Controls.getPointerState();
	const cameraY = State.getCameraY();
	updatePlayer(pointer, player, cameraY);
	State.checkPlayerBounds(canvas.width, canvas.height);
	updateTikkun(player);
	updateWorld(canvas, phase, cameraY, cameraSpeed, onFinish);
	return phase;
}

/** Preserve the historic drag offset so picking up the player never snaps its center under the finger. */
function updatePlayer(pointer, player, cameraY) {
	if (pointer.isActive) {
		if (touchOffset === null) {
			touchOffset = {
				x: pointer.x - player.x,
				y: pointer.y - (player.y - cameraY)
			};
		}
		State.setPlayerPosition(pointer.x - touchOffset.x, pointer.y - touchOffset.y + cameraY);
		return;
	}
	touchOffset = null;
	if (player.combo > 0 && !player.isTikkun) player.combo = 0;
}

/** Advance charged Tikkun duration and reset combo when the empowered window ends. */
function updateTikkun(player) {
	if (player.isTikkun && player.tikkunTimer > 0) {
		State.decrementTikkunTimer();
		return;
	}
	if (!player.isTikkun) return;
	State.endTikkun();
	player.combo = 0;
}

/** Apply phase pacing to sanctification while preserving the existing entity simulation and collision rules. */
function updateWorld(canvas, phase, cameraY, cameraSpeed, onFinish) {
	sanctifyTimer += 1;
	const ascentPressure = Math.min(12, Math.floor(State.getAscension() / 500));
	const interval = Math.max(8, phase.sanctifyEvery - ascentPressure);
	if (sanctifyTimer >= interval) {
		Entities.sanctifyRandomLetter();
		sanctifyTimer = 0;
	}
	Entities.generateEntities(canvas.width, cameraY);
	Entities.updateEntities(cameraY, cameraSpeed, canvas.width, onFinish);
	Entities.updateParticles();
}

/** Clear pointer-relative state before a fresh run starts or a terminal transition completes. */
export function resetKavanahGameplayStep() {
	touchOffset = null;
	sanctifyTimer = 0;
}
