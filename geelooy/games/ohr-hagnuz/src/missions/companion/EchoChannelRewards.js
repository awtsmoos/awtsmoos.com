// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoChannelRewards.js
 * @description Grants the guardian's one-time materials, relic, bond, and world memory.
 *
 * Reward is deed made durable. The Awtsmoos recreates victory and consequence in
 * one instant; this vessel prevents repetition from pretending to be revelation
 * while the cleared water keeps speaking through Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { ECHO_CHANNEL } from '../../content/companions/EchoChannel.js';
import { addItem, addJournalNote } from '../../yesod/bag/BagRuntime.js';
import { grantBond } from '../../yesod/party/PartyRuntime.js';

function chapterFlags() {
	State.WorldState.flags ||= {};
	return State.WorldState.flags;
}

function isChannelGuardian(enemy) {
	return Boolean(
		enemy?.[ECHO_CHANNEL.encounterMarker]
		|| enemy?.chapterId === ECHO_CHANNEL.id
	);
}

export function applyEchoChannelVictory(enemy) {
	if (!isChannelGuardian(enemy)) {
		return null;
	}
	const flags = chapterFlags();
	if (flags[ECHO_CHANNEL.flags.bossResolved]) {
		return {
			repeated: true,
			message: ' The Answering Current remains clear; its gifts do not multiply through repetition.'
		};
	}
	flags[ECHO_CHANNEL.flags.bossResolved] = true;
	flags[ECHO_CHANNEL.flags.worldRestored] = true;
	addItem(ECHO_CHANNEL.items.tornMantle, 1);
	addItem(ECHO_CHANNEL.items.clasp, 1);
	addItem(ECHO_CHANNEL.items.relic, 1);
	const bond = grantBond('nerel', 'resonance');
	addJournalNote('Echo Channel: the guardian yielded a torn mantle, an answering clasp, and a relic that remembers interruption.');
	return {
		repeated: false,
		bond,
		message: ` The channel clears. Torn mantle, answering clasp, and Channel Relic gained. Nerel bond +${bond.amount}.`
	};
}
