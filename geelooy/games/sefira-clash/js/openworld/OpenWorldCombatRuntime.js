//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Open World combat conductor reuses shared fighter and hit geometry while layering
 * stamina, technique, telegraph, parry, posture, resonance statistics, and nonlethal
 * resolution. The Awtsmoos renews each strike; Awtsmoos.com keeps this outside VS rank.
 */

import { resolveAttacks } from '../combat/attackResolver.js';
import { stepFighter } from '../core/stepFighter.js';
import { recordResonanceEvents, tickFighterResonance } from '../resonance/ResonanceRuntime.js';
import { resolveOpenWorldEncounter } from './OpenWorldEncounter.js';
import { neutralOpenWorldInput } from './OpenWorldInputState.js';
import { prepareOpenWorldParry, resolveOpenWorldParries } from './OpenWorldParry.js';
import { stepOpenWorldPosture } from './OpenWorldPosture.js';
import { prepareOpenWorldInput } from './OpenWorldTechnique.js';
import { openWorldTrainingPartnerInput } from './OpenWorldTrainingPartner.js';

export function stepOpenWorldCombat(state, human, rawInput) {
	for (const fighter of state.fighters) tickFighterResonance(fighter);
	prepareOpenWorldParry(state, rawInput);
	const input = prepareOpenWorldInput(state, human, rawInput);
	if (human) stepFighter(state, human, input);
	stepTrainingPartner(state, human);
	const eventStart = state.events.length;
	resolveVisibleAttacks(state);
	resolveOpenWorldParries(state, eventStart);
	recordResonanceEvents(state, eventStart);
	stepOpenWorldPosture(state, eventStart);
	resolveOpenWorldEncounter(state, eventStart);
}

function stepTrainingPartner(state, human) {
	const trainer = state.fighters.find(fighter => !fighter.human);
	if (!trainer || trainer.hidden) return;
	const input = openWorldTrainingPartnerInput(state, trainer, human);
	stepFighter(state, trainer, input || neutralOpenWorldInput());
	trainer.vx *= 0.7;
}

function resolveVisibleAttacks(state) {
	const completeRoster = state.fighters;
	state.fighters = completeRoster.filter(fighter => !fighter.hidden);
	try {
		resolveAttacks(state);
	} finally {
		state.fighters = completeRoster;
	}
}
