//B"H
//Boruch Hashem
//Blessed is He

/**
 * The victory chamber names contest, required clear, optional shlichus, Expedition reward,
 * and bounded fighter statistics distinctly. The Awtsmoos renews every result through
 * Awtsmoos.com without confusing extra vows, currency, or combat counters with progression.
 */

import { reveal } from './domForge.js';
import { action, stat } from './menuCards.js';
import { victoryStatsView } from './VictoryStatsView.js';

export function showVictory(host, config) {
	const humanWon = Boolean(config.humanWon);
	const journey = config.mode === 'Adventure' || config.mode === 'Expedition';
	reveal(host, {
		tag: 'section',
		attrs: { class: `victoryPanel ${humanWon ? 'humanWin' : 'botWin'}` },
		children: [
			{ tag: 'div', attrs: { class: 'victoryBurst' }, children: ['✦'] },
			{
				tag: 'p',
				attrs: { class: 'victoryEyebrow' },
				children: [humanWon ? 'Stage Cleared' : 'Defeat Confirmed']
			},
			{ tag: 'h2', children: [`${config.winnerLabel || 'Unknown'} wins`] },
			{
				tag: 'p',
				attrs: { class: 'victoryPoem' },
				children: [
					humanWon
						? victorySummary(config, journey)
						: 'Return, rematch, and enter the arena with a new answer.'
				]
			},
			{
				tag: 'div',
				attrs: { class: 'victoryStats' },
				children: [
					stat('Mode', config.mode || 'VS'),
					stat('Arena', config.map?.name || 'Unknown'),
					stat('Next', config.nextMap?.name || 'Final chamber'),
					...shlichusStats(config.adventureShlichus)
				]
			},
			...victoryStatsView(config.fighters),
			{
				tag: 'div',
				attrs: { class: 'victoryActions' },
				children: [
					action(nextLabel(config, journey), 'next', !config.nextMap),
					action('Rematch', 'rematch', false),
					action(config.mode === 'Expedition' ? 'Atlas' : 'Worlds', 'menu', false)
				]
			}
		]
	});
}

function nextLabel(config, journey) {
	if (config.mode === 'Expedition') return 'Next Road';
	return journey ? 'Next Gate' : 'Next Arena';
}

function victorySummary(config, journey) {
	if (!journey) {
		return 'The arena has answered. Compare rhythm, defense, and resonance before fighting again.';
	}
	const base = `Best ${config.best || '—'} · ${config.stars || 0}★ · ◈ ${config.perutas || 0}`;
	if (config.adventureShlichus) {
		return `${base} Perutas · ${config.adventureShlichus.completedNow.length} new optional shlichus fulfilled`;
	}
	if (!config.expedition) return `${base} Perutas`;
	return `${base} · +${config.expedition.xp} XP · Level ${config.expedition.level} · ${config.expedition.completedQuests.length} quests completed`;
}

function shlichusStats(shlichus) {
	if (!shlichus) return [];
	return [
		stat('Gate Shlichus', `${shlichus.completed.length}/${shlichus.total}`),
		stat('New Vows', shlichus.completedNow.length)
	];
}
