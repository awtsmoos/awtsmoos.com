//B"H
//Boruch Hashem
//Blessed is He

/**
 * The fixed simulation breath now honors every local player seat independently.
 * The Awtsmoos renews intention, motion, impact, and consequence in Awtsmoos.com
 * while keeping the proven combat and Adventure order unchanged.
 */
import { stepAdventureRun } from '../adventure/adventureRun.js';
import { driveBots } from '../ai/botBrain.js';
import { resolveAttacks } from '../combat/attackResolver.js';
import { updateGrabs } from '../combat/grabResolver.js';
import { attachBlastEvents } from '../physics/blastZones.js';
import { stepRespawns } from '../physics/respawn.js';
import { resolveLandingShockwaves } from '../physics/special/landingShockwave.js';
import { resolveStomps } from '../physics/special/stomp.js';
import { stepPowerups } from '../powerups/powerupSystem.js';
import { stepSpectacleFromEvents } from '../spectacle/spectacleEvents.js';
import { stepSpectacleState } from '../spectacle/spectacleState.js';
import { stepStageDirector } from '../stage/events/stageDirector.js';
import { resolveWeaponPickups, syncHeldWeapons } from '../weapons/weaponPickup.js';
import { inputForFighter } from './fighterInput.js';
import { stepAftermath } from './stepAftermath.js';
import { stepFighter } from './stepFighter.js';
import { stepHitstop } from './stepHitstop.js';
import { resolveWinner } from './winner.js';

/** Advances one exact simulation breath through combat, world, and consequence. */
export function stepState(state, frameInput) {
	state.frame += 1;
	attachBlastEvents(state.map, state.events);
	stepRespawns(state);
	if (stepHitstop(state)) {
		return;
	}
	driveBots(state);
	for (const fighter of state.fighters) {
		stepFighter(state, fighter, inputForFighter(frameInput, fighter));
	}
	updateGrabs(state.fighters);
	resolveLandingShockwaves(state);
	resolveStomps(state);
	resolveAttacks(state);
	resolveWeaponPickups(state);
	stepPowerups(state);
	syncHeldWeapons(state);
	stepStageDirector(state);
	stepAdventureRun(state);
	stepSpectacleFromEvents(state);
	stepAftermath(state);
	stepSpectacleState(state);
	resolveWinner(state);
}
