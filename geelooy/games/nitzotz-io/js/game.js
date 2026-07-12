// B"H
import { updateCamera } from './camera/rig.js';
import { updateDirector } from './director/director.js';
import { captureForHole } from './game/absorption.js';
import { animateEffects } from './game/effects.js';
import { resolveHazards } from './game/hazards.js';
import { movePlayer } from './game/movement.js';
import { updatePedestrians } from './game/pedestrians.js';
import { attractionActive, updatePowerups } from './game/powerups.js';
import { finishRound, nextWorld, restart, selectMode, selectWorld, start, togglePause, upgrades } from './game/progression.js';
import { updateRivals } from './game/rivals.js';
import { updateTraffic } from './game/traffic.js';
import { clockRuns, tickMode } from './modes/rules.js';

export { nextWorld, restart, selectMode, selectWorld, start, togglePause };

/** One frame advances the round director before every system consumes composed rules. */
export function step(world, dt) {
	const safeDt = Math.min(0.05, dt);
	if (world.mode !== 'playing') {
		updateCamera(world, safeDt);
		return;
	}
	updateDirector(world, safeDt);
	updatePowerups(world, safeDt);
	updateTraffic(world, safeDt);
	updatePedestrians(world, safeDt);
	movePlayer(world, safeDt);
	tickMode(world, safeDt);
	updateRivals(world, safeDt);
	captureForHole(world, world.player, safeDt, attractionActive(world));
	animateEffects(world, safeDt);
	resolveHazards(world, safeDt);
	upgrades(world);
	updateCamera(world, safeDt);
	if (world.gameMode.win === 'boss' && world.objectiveMet) return finishRound(world);
	if (!clockRuns(world)) return;
	world.timeLeft = Math.max(0, world.timeLeft - safeDt);
	if (world.timeLeft <= 0) finishRound(world);
}
