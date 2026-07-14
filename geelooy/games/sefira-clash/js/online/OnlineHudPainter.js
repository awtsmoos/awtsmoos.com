//B"H
//Boruch Hashem
//Blessed is He

/**
 * The HUD reports server-owned time, damage, stocks, input acknowledgment, and
 * victory. The Awtsmoos renews every number; Awtsmoos.com displays it without
 * inventing a result and delegates final measured history to a separate painter.
 */

import { onlineCharacterVisual } from './OnlineCharacterVisuals.js';
import { paintFinalStatistics } from './OnlineStatsPainter.js';

/** Paints match phase, timer, fighter scorecards, and final statistics. */
export function paintOnlineHud(context, match, width) {
	paintTimer(context, match, width);
	paintCards(context, match.fighters);
	paintPhase(context, match, width);
	paintFinalStatistics(context, match, width);
}

function paintTimer(context, match, width) {
	const seconds = Math.ceil(match.timeFrames / match.tickRate);
	const minutes = Math.floor(seconds / 60);
	const remainder = String(seconds % 60).padStart(2, '0');
	context.fillStyle = 'rgba(4, 10, 25, 0.78)';
	context.fillRect(width / 2 - 90, 18, 180, 58);
	context.fillStyle = '#ffffff';
	context.font = '800 30px system-ui';
	context.textAlign = 'center';
	context.fillText(`${minutes}:${remainder}`, width / 2, 52);
	context.font = '600 12px system-ui';
	context.fillText(`frame ${match.frame} · ${match.stateChecksum || 'legacy'}`, width / 2, 69);
}

function paintCards(context, fighters) {
	fighters.forEach((fighter, index) => {
		const visual = onlineCharacterVisual(fighter.characterId);
		const x = 18 + index * 288;
		context.fillStyle = 'rgba(4, 10, 25, 0.76)';
		context.fillRect(x, 632, 270, 70);
		context.fillStyle = visual.color;
		context.fillRect(x, 632, 8, 70);
		context.fillStyle = '#ffffff';
		context.font = '700 17px system-ui';
		context.textAlign = 'left';
		const connection = fighter.connected === false ? ' · disconnected' : '';
		context.fillText(`${fighter.displayName}${connection}`, x + 20, 654);
		context.font = '800 23px system-ui';
		context.fillText(`${fighter.damage}%`, x + 20, 683);
		context.font = '600 12px system-ui';
		context.fillText(`input ack ${fighter.acknowledgedInputSequence || 0}`, x + 95, 682);
		context.textAlign = 'right';
		context.font = '800 23px system-ui';
		context.fillText(`◆ ${fighter.stocks}`, x + 250, 683);
	});
}

function paintPhase(context, match, width) {
	let message = '';
	if (match.phase === 'countdown') {
		message = String(Math.max(1, Math.ceil((90 - match.frame) / match.tickRate)));
	}
	if (match.phase === 'finished') {
		message = winnerMessage(match);
	}
	if (!message) {
		return;
	}
	context.fillStyle = 'rgba(5, 8, 20, 0.76)';
	context.fillRect(width / 2 - 270, 250, 540, 110);
	context.fillStyle = '#fff5c4';
	context.font = '900 58px system-ui';
	context.textAlign = 'center';
	context.fillText(message, width / 2, 324);
}

function winnerMessage(match) {
	if (match.winner?.team) {
		return `Team ${match.winner.team} prevails`;
	}
	const fighter = match.fighters.find(candidate => candidate.id === match.winner?.playerId);
	return fighter ? `${fighter.displayName} prevails` : 'Match complete';
}
