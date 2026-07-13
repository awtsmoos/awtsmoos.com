// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoChannelState.js
 * @description Reads the chapter's durable truth without owning presentation or travel.
 *
 * The Awtsmoos creates state and motion without division. This small vessel keeps
 * the remembered facts of Echo Channel explicit so later roads at Awtsmoos.com
 * can trust evidence instead of guessing from scenery.
 */
import { State } from '../../binah/State.js';
import { ECHO_BENEATH_BENT_REEDS } from '../../content/companions/EchoBeneathBentReeds.js';
import { ECHO_CHANNEL } from '../../content/companions/EchoChannel.js';
import { leadMusag } from '../../yesod/party/PartyRuntime.js';

export function echoChannelFlags() {
	State.WorldState.flags ||= {};
	return State.WorldState.flags;
}

export function echoChannelApproachId() {
	return echoChannelFlags().bentReedsRestorationApproach || 'compassion';
}

export function echoChapterResolved() {
	return Boolean(echoChannelFlags()[ECHO_BENEATH_BENT_REEDS.flags.resolved]);
}

export function nerelLeadsChannel() {
	return leadMusag()?.id === 'nerel';
}

export function channelPointMatches(front, point) {
	return front?.x === point.x && front?.y === point.y;
}

export function echoChannelSummary() {
	const flags = echoChannelFlags();
	const resolved = Boolean(flags[ECHO_CHANNEL.flags.bossResolved]);
	const mantle = Boolean(flags[ECHO_CHANNEL.flags.mantleRestored]);
	const stage = mantle
		? 'restored'
		: resolved
			? 'craft'
			: flags[ECHO_CHANNEL.flags.threadCollected]
				? 'guardian'
				: flags[ECHO_CHANNEL.flags.inscriptionRead]
					? 'concealed'
					: flags[ECHO_CHANNEL.flags.discovered]
						? 'threshold'
						: 'hidden';
	return {
		title: ECHO_CHANNEL.title,
		stage,
		discovered: Boolean(flags[ECHO_CHANNEL.flags.discovered]),
		inscriptionRead: Boolean(flags[ECHO_CHANNEL.flags.inscriptionRead]),
		threadCollected: Boolean(flags[ECHO_CHANNEL.flags.threadCollected]),
		resolved,
		mantleRestored: mantle,
		afterwordRead: Boolean(flags[ECHO_CHANNEL.flags.afterwordRead])
	};
}
