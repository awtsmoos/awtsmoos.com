//B"H
//Boruch Hashem
//Blessed is He

/**
 * The fixed simulation breath preserves the proven fighter, physics, item, stage,
 * Adventure, spectacle, and winner order while adding explicit Open World and resonance
 * vessels. The Awtsmoos renews each consequence through Awtsmoos.com without guessed imports.
 */

import { stepAdventureRun } from '../adventure/adventureRun.js';
import { driveBots } from '../ai/botBrain.js';
import { resolveAttacks } from '../combat/attackResolver.js';
import { updateGrabs } from '../combat/grabResolver.js';
import { stepOpenWorldState } from '../openworld/OpenWorldRuntime.js';
import { attachBlastEvents } from '../physics/blastZones.js';
import { stepRespawns } from '../physics/respawn.js';
import { resolveLandingShockwaves } from '../physics/special/landingShockwave.js';
import { resolveStomps } from '../physics/special/stomp.js';
import { stepPowerups } from '../powerups/powerupSystem.js';
import { recordResonanceEvents } from '../resonance/ResonanceRuntime.js';
import { stepSpectacleFromEvents } from '../spectacle/spectacleEvents.js';
import { stepSpectacleState } from '../spectacle/spectacleState.js';
import { stepStageDirector } from '../stage/events/stageDirector.js';
import {
	resolveWeaponPickups,
	syncHeldWeapons
} from '../weapons/weaponPickup.js';
import { inputForFighter } from './fighterInput.js';
import { stepAftermath } from './stepAftermath.js';
import { stepFighter } from './stepFighter.js';
import { stepHitstop } from './stepHitstop.js';
import { resolveWinner } from './winner.js';

/** Advances one exact simulation breath through combat, world, and consequence. */
export function stepState(state, frameInput) {
	if (state.mode === 'openworld') {
		stepOpenWorldState(state, frameInput);
		return;
	}
	state.frame += 1;
	attachBlastEvents(state.map, state.events);
	stepRespawns(state);
	if (stepHitstop(state)) return;
	driveBots(state);
	for (const fighter of state.fighters) {
		stepFighter(state, fighter, inputForFighter(frameInput, fighter));
	}
	updateGrabs(state.fighters);
	resolveLandingShockwaves(state);
	resolveStomps(state);
	const eventStart = state.events.length;
	resolveAttacks(state);
	recordResonanceEvents(state, eventStart);
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
