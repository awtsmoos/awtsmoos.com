// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoChannelThreshold.js
 * @description Lets Nerel's remembered command become an environmental key.
 *
 * The Awtsmoos creates command, water, and passage in one instant. This threshold
 * makes a former battle verb become exploration, so the player's old choice keeps
 * shaping the world rather than fading into a menu at Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { ECHO_CHANNEL, echoChannelApproachLine } from '../../content/companions/EchoChannel.js';
import { enterEchoChannelDepths } from './EchoChannelTravel.js';
import {
	channelPointMatches,
	echoChannelApproachId,
	echoChannelFlags,
	echoChapterResolved,
	nerelLeadsChannel
} from './EchoChannelState.js';

export function handleEchoChannelThreshold(front) {
	if (!channelPointMatches(front, ECHO_CHANNEL.points.thresholdGate)) {
		return false;
	}
	if (!echoChapterResolved()) {
		State.say('The current has no answer yet. Resolve the echo beneath the lamp first.', 420);
		return true;
	}
	if (!nerelLeadsChannel()) {
		State.say('The seal waits for Nerel to lead and speak the command awakened below Bent Reeds.', 480);
		return true;
	}
	const flags = echoChannelFlags();
	if (!flags[ECHO_CHANNEL.flags.discovered]) {
		flags[ECHO_CHANNEL.flags.discovered] = true;
		State.say(echoChannelApproachLine(echoChannelApproachId()), 620);
		return true;
	}
	flags[ECHO_CHANNEL.flags.gateOpened] = true;
	return enterEchoChannelDepths();
}
