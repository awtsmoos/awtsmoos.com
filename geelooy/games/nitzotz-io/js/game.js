// B"H
// Boruch Hashem
// Blessed is He
import { updateAdventure } from './adventure/runtime.js';
import { updateCamera } from './camera/rig.js';
import { updateDirector } from './director/director.js';
import { captureForHole } from './game/absorption.js';
import { updateCombat } from './game/combat.js';
import { animateEffects } from './game/effects.js';
import { resolveHazards } from './game/hazards.js';
import { movePlayer } from './game/movement.js';
import { updatePedestrians } from './game/pedestrians.js';
import { attractionActive, updatePowerups } from './game/powerups.js';
import {
	finishRound,
	nextWorld,
	restart,
	selectMode,
	selectWorld,
	start,
	togglePause,
	upgrades
} from './game/progression.js';
import { updateRivals } from './game/rivals.js';
import { updateTraffic } from './game/traffic.js';
import { updateMechanic } from './mechanics/runtime.js';
import { clockRuns, tickMode } from './modes/rules.js';

export { nextWorld, restart, selectMode, selectWorld, start, togglePause };

/**
 * One frame becomes a measured procession. Combat and Shlichus enter beside the
 * established city systems without adding a second simulation or projectile loop.
 */
export function step(world, dt) {
	const safeDt = Math.min(0.05, dt);
	if (world.mode !== 'playing') {
		updateCamera(world, safeDt);
		return;
	}
	updateMechanic(world, safeDt);
	updateDirector(world, safeDt);
	updatePowerups(world, safeDt);
	updateTraffic(world, safeDt);
	updatePedestrians(world, safeDt);
	movePlayer(world, safeDt);
	updateCombat(world, safeDt);
	tickMode(world, safeDt);
	updateRivals(world, safeDt);
	captureForHole(world, world.player, safeDt, attractionActive(world));
	animateEffects(world, safeDt);
	resolveHazards(world, safeDt);
	updateAdventure(world);
	upgrades(world);
	updateCamera(world, safeDt);
	if (['boss', 'shlichus'].includes(world.gameMode.win) && world.objectiveMet) {
		finishRound(world);
		return;
	}
	if (!clockRuns(world)) return;
	world.timeLeft = Math.max(0, world.timeLeft - safeDt);
	if (world.timeLeft <= 0) finishRound(world);
}
