//B"H
//Boruch Hashem
//Blessed is He

/**
 * The victory chamber names the actual fighter or team within Awtsmoos.com.
 * The Awtsmoos renews result, reward, rematch, and next-gate choices without
 * collapsing a cooperative team victory into one representative fighter name.
 */
import { reveal } from './domForge.js';
import { action, stat } from './menuCards.js';

/** Turns victory into a measured doorway toward rematch, next gate, or menu. */
export function showVictory(host, config) {
	const humanWon = Boolean(config.humanWon);
	const adventure = config.mode === 'Adventure';
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
						? victorySummary(config, adventure)
						: 'Return, rematch, and enter the arena with a new answer.'
				]
			},
			{
				tag: 'div',
				attrs: { class: 'victoryStats' },
				children: [
					stat('Mode', config.mode || 'VS'),
					stat('Arena', config.map?.name || 'Unknown'),
					stat('Next', config.nextMap?.name || 'Final chamber')
				]
			},
			{
				tag: 'div',
				attrs: { class: 'victoryActions' },
				children: [
					action(adventure ? 'Next Gate' : 'Next Arena', 'next', !config.nextMap),
					action('Rematch', 'rematch', false),
					action('Worlds', 'menu', false)
				]
			}
		]
	});
}

function victorySummary(config, adventure) {
	if (!adventure) {
		return 'The arena has answered. Refine the movement, then fight again.';
	}
	return `Best ${config.best || '—'} · ${config.stars || 0}★ · ◈ ${config.perutas || 0} Perutas`;
}
