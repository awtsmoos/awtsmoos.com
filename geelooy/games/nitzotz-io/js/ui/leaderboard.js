// B"H
import { rankings } from '../game/scoring.js';

/** Render a compact live ranking without rebuilding unrelated interface nodes. */
export function renderLeaderboard(world, element) {
	const entries = rankings(world);
	element.innerHTML = entries
		.slice(0, 6)
		.map((entry, index) => row(entry, index + 1))
		.join('');
}

function row(entry, rank) {
	const classes = entry.player ? 'leader-row you' : 'leader-row';
	return `<div class="${classes}"><b>${rank}</b><span>${entry.name}</span><strong>${Math.round(entry.mass)}</strong></div>`;
}
