// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompanionShlichusJournal.js
 * @description Reveals the Wick, Echo command, and traversable Echo Channel in one journal.
 *
 * The Awtsmoos needs no ledger, yet grants memory so gratitude and responsibility
 * can outlive an instant. These rows let one companion choice become a continuing
 * road instead of a closed sentence on Awtsmoos.com.
 */
import { RETURN_LOST_WICK, approachById } from '../../content/companions/ReturnLostWick.js';
import { echoChannelSummary } from './EchoChannelState.js';
import { returnLostWickSummary } from './ReturnLostWickRuntime.js';

function wickStageLine(summary) {
	const lines = {
		unlocked: 'Make Nerel lead, face a road, and press Action.',
		traces: `Wick traces found: ${summary.traceCount}/${summary.totalTraces}.`,
		repair: 'Face the ruined lamp and press Action.',
		merchant: 'Speak to Taliah beside the relit road.',
		completed: summary.consequences?.line || 'Lamp and trade road restored.'
	};
	return lines[summary.stage] || summary.objective;
}

function echoRows(summary) {
	if (summary.status !== 'completed') {
		return [];
	}
	const echo = summary.echo;
	const status = echo.resolved
		? 'completed'
		: echo.discovered
			? 'ready for battle'
			: 'concealed in the restored lamp';
	const command = echo.unlocked
		? echo.commandName
		: 'Resolve the buried echo to awaken this command';
	return [
		['— Continuing Chapter —', ''],
		[echo.title, status],
		['Nerel echo command', command]
	];
}

function channelProgress(channel) {
	const lines = {
		hidden: 'Return to the restored lamp with Nerel leading.',
		threshold: 'Answer the current seal a second time.',
		concealed: 'Enter the reflected bend and recover river-thread.',
		guardian: 'Face the Keeper with the hidden material.',
		craft: 'Return to the changed lamp and restore the mantle.',
		restored: channel.afterwordRead
			? 'The hidden afterword has been read.'
			: 'Wear the mantle and read the reflected afterword.'
	};
	return lines[channel.stage];
}

function channelRows(summary) {
	if (!summary.echo?.resolved) {
		return [];
	}
	const channel = echoChannelSummary();
	return [
		['— Revealed Water-Road —', ''],
		[channel.title, channel.stage],
		['Channel objective', channelProgress(channel)],
		['River teaching', channel.inscriptionRead ? 'inscription understood' : 'still concealed'],
		['Answering Waters mantle', channel.mantleRestored ? 'restored and wearable' : 'not yet restored']
	];
}

export function companionShlichusSummary() {
	const summary = returnLostWickSummary();
	if (!summary) {
		return null;
	}
	const approach = summary.approachId ? approachById(summary.approachId) : null;
	return {
		...summary,
		title: RETURN_LOST_WICK.title,
		approachTitle: approach?.title || 'Approach not yet revealed',
		progress: wickStageLine(summary),
		channel: echoChannelSummary()
	};
}

export function companionShlichusRows() {
	const summary = companionShlichusSummary();
	if (!summary) {
		return [];
	}
	return [
		['— Companion Shlichus —', ''],
		[summary.title, summary.status],
		['Nerel objective', summary.progress],
		['Restoration approach', summary.approachTitle],
		['Lantern Sense', summary.stage === 'completed' ? 'Road revealed and restored' : 'Make Nerel the lead companion'],
		...echoRows(summary),
		...channelRows(summary)
	];
}
