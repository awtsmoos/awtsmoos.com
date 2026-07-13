// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoChannelRestored.js
 * @description Makes Bent Reeds remember victory through crafting, sight, and return.
 *
 * The Awtsmoos does not discard an earlier place after revelation. This restored
 * marsh keeps consequence visible, lets armor reveal a final inscription, and
 * returns the traveler honestly to the wider world of Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { ECHO_CHANNEL } from '../../content/companions/EchoChannel.js';
import { addJournalNote } from '../../yesod/bag/BagRuntime.js';
import { hasAnsweringWatersSight, restoreAnsweringWatersMantle } from './EchoChannelCrafting.js';
import { channelPointMatches, echoChannelFlags } from './EchoChannelState.js';
import { leaveRestoredBentReeds } from './EchoChannelTravel.js';

function restoreAtLamp() {
	const result = restoreAnsweringWatersMantle();
	State.say(result.message, result.ok ? 620 : 480);
	return true;
}

function readAfterword() {
	const flags = echoChannelFlags();
	if (!hasAnsweringWatersSight()) {
		State.say('Letters move beneath the reflected stone, but ordinary sight cannot keep their shape.', 460);
		return true;
	}
	if (!flags[ECHO_CHANNEL.flags.afterwordRead]) {
		flags[ECHO_CHANNEL.flags.afterwordRead] = true;
		addJournalNote('Answering Waters afterword: the vessel is not a prison when it faithfully carries light.');
	}
	State.say('Hidden afterword: “A faithful vessel does not imprison light. It gives revelation somewhere to dwell.”', 680);
	return true;
}

export function handleRestoredBentReeds(front) {
	if (channelPointMatches(front, ECHO_CHANNEL.points.restoredLamp)) {
		return restoreAtLamp();
	}
	if (channelPointMatches(front, ECHO_CHANNEL.points.afterword)) {
		return readAfterword();
	}
	if (channelPointMatches(front, ECHO_CHANNEL.points.restoredExit)) {
		return leaveRestoredBentReeds();
	}
	return false;
}
