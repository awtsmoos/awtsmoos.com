// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoChannelDepths.js
 * @description Routes Torah clue, concealed material, and authored guardian battle.
 *
 * A teaching becomes alive when it changes the next step. The Awtsmoos recreates
 * inscription, hidden bend, and opposition as one connected lesson; this module
 * lets that lesson become playable throughout Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { ECHO_CHANNEL, createEchoChannelGuardian } from '../../content/companions/EchoChannel.js';
import { startDebate } from '../../yesod/OhrDebate.js';
import { addItem, addJournalNote } from '../../yesod/bag/BagRuntime.js';
import {
	channelPointMatches,
	echoChannelApproachId,
	echoChannelFlags
} from './EchoChannelState.js';
import {
	enterConcealedBend,
	enterRestoredBentReeds,
	returnToEchoDepths
} from './EchoChannelTravel.js';

function readInscription(flags) {
	flags[ECHO_CHANNEL.flags.inscriptionRead] = true;
	addJournalNote('Echo Channel teaching: water receives the form of its vessel; humility answers distortion without surrendering truth.');
	State.say('Inscription: “Water receives its vessel. Humility is not surrender; a true answer fits the vessel without bending truth.”', 760);
	return true;
}

function openConcealedBend(flags) {
	if (!flags[ECHO_CHANNEL.flags.inscriptionRead]) {
		State.say('Reflected stone hides the bend. The western inscription may teach how to read this water.', 520);
		return true;
	}
	return enterConcealedBend();
}

function faceGuardian(flags) {
	if (!flags[ECHO_CHANNEL.flags.threadCollected]) {
		State.say('The current gathers around an unfinished vessel. Find what the concealed bend preserves first.', 520);
		return true;
	}
	if (flags[ECHO_CHANNEL.flags.bossResolved]) {
		return enterRestoredBentReeds();
	}
	const guardian = createEchoChannelGuardian();
	startDebate(guardian);
	State.Debate.log.unshift(`Nerel's ${echoChannelApproachId()} command can interrupt the gathering current.`);
	return true;
}

export function handleEchoChannelDepths(front) {
	const flags = echoChannelFlags();
	if (channelPointMatches(front, ECHO_CHANNEL.points.inscription)) {
		return readInscription(flags);
	}
	if (channelPointMatches(front, ECHO_CHANNEL.points.concealedGate)) {
		return openConcealedBend(flags);
	}
	if (channelPointMatches(front, ECHO_CHANNEL.points.guardian)) {
		return faceGuardian(flags);
	}
	return false;
}

export function handleEchoChannelConcealedBend(front) {
	const flags = echoChannelFlags();
	if (channelPointMatches(front, ECHO_CHANNEL.points.thread)) {
		if (!flags[ECHO_CHANNEL.flags.threadCollected]) {
			flags[ECHO_CHANNEL.flags.threadCollected] = true;
			addItem(ECHO_CHANNEL.items.thread, 1);
			addJournalNote('River-thread recovered from the concealed bend of Echo Channel.');
			State.say('River-thread gathered. It carries the shape of water without losing the strength of a vessel.', 620);
		} else {
			State.say('The concealed niche is empty; its river-thread already rests in your Bag.', 360);
		}
		return true;
	}
	if (channelPointMatches(front, ECHO_CHANNEL.points.concealedReturn)) {
		return returnToEchoDepths();
	}
	return false;
}
