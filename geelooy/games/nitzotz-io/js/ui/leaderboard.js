// B"H
import { rankings } from '../game/scoring.js';

/** Render identity and strategic archetype for each live competitor. */
export function renderLeaderboard(world, element) {
	const entries = rankings(world);
	element.innerHTML = entries.slice(0, 6).map((entry, index) => row(entry, index + 1)).join('');
}

function row(entry, rank) {
	const classes = entry.player ? 'leader-row you' : 'leader-row';
	const identity = entry.archetype ? `${entry.name} · ${entry.archetype}` : entry.name;
	return `<div class="${classes}"><b>${rank}</b><span>${identity}</span><strong>${Math.round(entry.mass)}</strong></div>`;
}
