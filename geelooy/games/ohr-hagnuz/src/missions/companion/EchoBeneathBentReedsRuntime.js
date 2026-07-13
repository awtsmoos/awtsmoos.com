// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoBeneathBentReedsRuntime.js
 * @description Discovers the buried echo, begins its battle, and opens the later water-road.
 *
 * The Awtsmoos creates conclusion and continuation together. The restored lamp
 * does not become a dead trophy after victory; it becomes the threshold through
 * which Nerel's remembered command enters the living world of Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import {
	ECHO_BENEATH_BENT_REEDS,
	echoCommandByApproach
} from '../../content/companions/EchoBeneathBentReeds.js';
import { encounterById } from '../../data/EncounterIndex.js';
import { startDebate } from '../../yesod/OhrDebate.js';
import { leadMusag } from '../../yesod/party/PartyRuntime.js';
import { enterEchoChannel } from './EchoChannelTravel.js';

function restorationApproachId() {
	return State.WorldState.flags?.bentReedsRestorationApproach || 'compassion';
}

export function echoBeneathBentReedsSummary() {
	const flags = State.WorldState.flags || {};
	const command = echoCommandByApproach(restorationApproachId());
	return {
		title: ECHO_BENEATH_BENT_REEDS.title,
		discovered: Boolean(flags[ECHO_BENEATH_BENT_REEDS.flags.discovered]),
		resolved: Boolean(flags[ECHO_BENEATH_BENT_REEDS.flags.resolved]),
		unlocked: Boolean(State.Party.abilities?.[ECHO_BENEATH_BENT_REEDS.abilityId]),
		commandName: command.name
	};
}

function beginEchoEncounter() {
	const approachId = restorationApproachId();
	const encounter = {
		...encounterById(ECHO_BENEATH_BENT_REEDS.encounterId),
		chapterId: ECHO_BENEATH_BENT_REEDS.id,
		[ECHO_BENEATH_BENT_REEDS.encounterMarker]: true
	};
	startDebate(encounter);
	State.Debate.log.unshift(`Nerel carries the ${approachId} restoration approach into this echo.`);
	return true;
}

export function handleEchoBeneathBentReedsAction(lead = {}) {
	if (lead.status !== 'completed') {
		return false;
	}
	const flags = State.WorldState.flags || {};
	const nerel = leadMusag();
	if (nerel?.id !== 'nerel') {
		State.say('The restored lamp keeps a lower echo. Make Nerel the lead companion to hear its direction.', 480);
		return true;
	}
	if (flags[ECHO_BENEATH_BENT_REEDS.flags.resolved]) {
		return enterEchoChannel();
	}
	if (!flags[ECHO_BENEATH_BENT_REEDS.flags.discovered]) {
		flags[ECHO_BENEATH_BENT_REEDS.flags.discovered] = true;
		State.say('Nerel kneels beside the restored flame. Beneath the reeds, a second voice answers. Press Action again to descend.', 620);
		return true;
	}
	return beginEchoEncounter();
}
