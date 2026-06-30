import { reveal } from './domForge.js';
import { action, stat } from './menuCards.js';

/**
 * B"H
 * Victory panel: completion becomes the next doorway.
 *
 * In Adventure the most important button is Next Stage. In VS the player still
 * gets rematch and menu. The Awtsmoos turns winning into forward motion instead
 * of a dead end.
 *
 * @param {Element} host - Overlay container.
 * @param {object} config - Winner and match metadata.
 */
export function showVictory(host, config) {
  const humanWon = config.winner?.human;
  reveal(host, { tag: 'section', attrs: { class: `victoryPanel ${humanWon ? 'humanWin' : 'botWin'}` }, children: [
    { tag: 'div', attrs: { class: 'victoryBurst' }, children: ['✦'] },
    { tag: 'p', attrs: { class: 'victoryEyebrow' }, children: [humanWon ? 'Stage Cleared' : 'Defeat Confirmed'] },
    { tag: 'h2', children: [`${config.winner?.name || 'Unknown'} wins`] },
    { tag: 'p', attrs: { class: 'victoryPoem' }, children: [humanWon ? `Best ${config.best || '—'} · ${config.stars || 0}★` : 'Return, rematch, or climb again.'] },
    { tag: 'div', attrs: { class: 'victoryStats' }, children: [stat('Mode', config.mode || 'VS'), stat('Arena', config.map?.name || 'Unknown'), stat('Next', config.nextMap?.name || 'Final chamber')] },
    { tag: 'div', attrs: { class: 'victoryActions' }, children: [action('Next Stage', 'next', !config.nextMap), action('Rematch', 'rematch', false), action('Gates', 'menu', false)] }
  ] });
}
