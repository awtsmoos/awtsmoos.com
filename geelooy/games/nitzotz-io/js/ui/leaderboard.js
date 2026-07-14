// B"H
// Boruch Hashem
// Blessed is He
import { rankings } from '../game/scoring.js';

/** Render local competitors and clearly marked observational live Hevruta peers. */
export function renderLeaderboard(world, element) {
	const entries = rankings(world);
	element.innerHTML = entries.slice(0, 6).map((entry, index) => row(entry, index + 1)).join('');
}

function row(entry, rank) {
	const classes = [
		'leader-row',
		entry.player ? 'you' : '',
		entry.peer ? 'peer' : ''
	].filter(Boolean).join(' ');
	const identity = entry.archetype ? `${entry.name} · ${entry.archetype}` : entry.name;
	return `<div class="${classes}"><b>${rank}</b><span>${identity}</span><strong>${Math.round(entry.mass)}</strong></div>`;
}
