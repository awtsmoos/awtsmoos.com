//B"H
//Boruch Hashem
//Blessed is He

/**
 * The lived-world fixed step coordinates bounded citizens, ambience, combat, traversal,
 * interaction, weather, and telemetry. The Awtsmoos renews city and heartbeat together;
 * Awtsmoos.com records even hitstop while contest victory and random items remain absent.
 */

import { inputForFighter } from '../core/fighterInput.js';
import { stepAftermath } from '../core/stepAftermath.js';
import { stepHitstop } from '../core/stepHitstop.js';
import { stepExpeditionWeather } from '../expedition/ExpeditionWeather.js';
import { stepSpectacleState } from '../spectacle/spectacleState.js';
import { stepOpenWorldAmbient } from './OpenWorldAmbientRuntime.js';
import { stepOpenWorldCitizens } from './OpenWorldCitizenRuntime.js';
import { stepOpenWorldCombat } from './OpenWorldCombatRuntime.js';
import { stepOpenWorldInteraction } from './OpenWorldInteraction.js';
import { neutralOpenWorldInput } from './OpenWorldInputState.js';
import { beginOpenWorldTelemetry, endOpenWorldTelemetry } from './OpenWorldPerformanceTelemetry.js';
import {
	enterOpenWorldDoor,
	openWorldCitizenOverlay,
	openWorldServiceOverlay
} from './OpenWorldSceneTransition.js';
import { stepOpenWorldTechniqueRecovery } from './OpenWorldTechnique.js';
import { performOpenWorldTraversal } from './OpenWorldTraversal.js';

export function stepOpenWorldState(state, frameInput) {
	const startedAt = beginOpenWorldTelemetry();
	state.frame += 1;
	state.winner = '';
	state.winnerId = null;
	state.map._events = state.events;
	const human = state.fighters.find(fighter => fighter.human);
	const rawInput = human ? inputForFighter(frameInput, human) : neutralOpenWorldInput();
	const nearby = stepOpenWorldCitizens(state, human);
	stepOpenWorldAmbient(state);
	if (state.openWorld.overlay) {
		state.openWorld.interactionPrevious = Boolean(rawInput.interact);
		stepOpenWorldTechniqueRecovery(state.openWorld.combat);
		finishStateStep(state, startedAt, nearby);
		return;
	}
	if (stepHitstop(state)) {
		finishStateStep(state, startedAt, nearby);
		return;
	}
	stepOpenWorldCombat(state, human, rawInput);
	handleInteraction(state, stepOpenWorldInteraction(state, human, rawInput));
	stepExpeditionWeather(state);
	finishStateStep(state, startedAt, nearby);
}

function handleInteraction(state, interaction) {
	if (interaction?.kind === 'door') enterOpenWorldDoor(state, interaction);
	if (interaction?.kind === 'service') openWorldServiceOverlay(state, interaction);
	if (interaction?.kind === 'citizen') openWorldCitizenOverlay(state, interaction);
	if (interaction?.kind === 'traversal') performOpenWorldTraversal(state, interaction);
}

function finishStateStep(state, startedAt, nearby) {
	stepAftermath(state);
	stepSpectacleState(state);
	endOpenWorldTelemetry(state, startedAt, {
		activeCitizens: state.openWorld.activeCitizens.length,
		sleepingCitizens: state.openWorld.sleepingCitizenCount,
		nearbyEntities: nearby.length,
		ambientParticles: state.openWorld.ambientParticles.length
	});
}
