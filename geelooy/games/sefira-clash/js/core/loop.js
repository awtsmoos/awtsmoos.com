//B"H
//Boruch Hashem
//Blessed is He

/**
 * The fixed simulation breath preserves the proven fighter, physics, item, stage,
 * Adventure, spectacle, and winner order while adding explicit Open World and resonance
 * vessels. The Awtsmoos renews each consequence through Awtsmoos.com without guessed imports.
 */

import { driveBots } from '../ai/botBrain.js';
import { resolveAttacks } from '../combat/attackResolver.js';
import { updateGrabs } from '../combat/grabResolver.js';
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

// Lazy mode steppers — loaded on first use to keep boot fast.
let _stepOpenWorldState = null;
let _stepAdventureRun = null;

async function getOpenWorldStepper() {
	if (!_stepOpenWorldState) {
		const mod = await import('../openworld/OpenWorldRuntime.js');
		_stepOpenWorldState = mod.stepOpenWorldState;
	}
	return _stepOpenWorldState;
}

async function getAdventureStepper() {
	if (!_stepAdventureRun) {
		const mod = await import('../adventure/adventureRun.js');
		_stepAdventureRun = mod.stepAdventureRun;
	}
	return _stepAdventureRun;
}

/**
 * Preloads the open-world stepper. Call when entering open-world mode so the
 * first frame does not stall on a dynamic import.
 */
export function preloadOpenWorldStepper() {
	return getOpenWorldStepper();
}

/**
 * Preloads the adventure stepper. Call when entering adventure mode.
 */
export function preloadAdventureStepper() {
	return getAdventureStepper();
}

/** Advances one exact simulation breath through combat, world, and consequence. */
export function stepState(state, frameInput) {
	if (state.mode === 'openworld') {
		if (_stepOpenWorldState) {
			_stepOpenWorldState(state, frameInput);
		} else {
			// Stepper not yet loaded; load async and skip this frame.
			void getOpenWorldStepper();
		}
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
	if (_stepAdventureRun) stepAdventureRun(state);
	else void getAdventureStepper();
	stepSpectacleFromEvents(state);
	stepAftermath(state);
	stepSpectacleState(state);
	resolveWinner(state);
}
