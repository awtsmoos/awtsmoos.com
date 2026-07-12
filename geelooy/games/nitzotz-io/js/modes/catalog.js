// B"H

/** Data-only arena modes let one persistent city carry many kinds of tension. */
export const MODES = [
	mode('classic', 'Classic Revelation', 'Reach the mass goal before the clock closes.'),
	mode('last', 'Last Vessel Standing', 'Take first place while rival pressure accelerates.', {
		timeScale: 0.92, rivalSpeed: 1.28, win: 'last'
	}),
	mode('endless', 'Endless Ascent', 'No clock. Escalating events and bosses mark milestones.', {
		untimed: true, eventCadence: 19, bossAt: 0.72, win: 'endless'
	}),
	mode('conquest', 'Four-Corner Conquest', 'Reveal every district and reach the conquest mass.', {
		timeScale: 1.12, targetScale: 0.82, win: 'conquest'
	}),
	mode('bossRush', 'Palace Breaker', 'Begin enlarged and dismantle a shielded landmark boss.', {
		timeScale: 1.18, targetScale: 0.76, startMassScale: 4.2, bossImmediate: true, win: 'boss'
	}),
	mode('zen', 'Quiet Garden', 'Untimed exploration with no rivals or disruptive events.', {
		untimed: true, events: false, rivalLimit: 0, pedestrianSpeed: 0.72, win: 'zen'
	}),
	mode('daily', 'Daily Tikkun', 'One shared seed and mutator for the local calendar day.', {
		timeScale: 0.9, targetScale: 1.08, daily: true
	}),
	mode('timeAttack', 'Lightning Gate', 'A short clock, faster traffic, and richer chains.', {
		timeScale: 0.58, targetScale: 0.72, trafficSpeed: 1.35, scoreScale: 1.2
	}),
	mode('reverse', 'Reverse Descent', 'Begin vast, slowly contract, and consume three landmarks.', {
		timeScale: 1.08, startMassScale: 8, targetScale: 0.62, reverse: true, win: 'reverse'
	}),
	mode('fragile', 'Fragile City', 'Structures yield extra mass during recurring fracture hours.', {
		fragile: true, captureMass: 1.16, eventCadence: 22
	}),
	mode('trafficChaos', 'Traffic Chaos', 'The avenues surge at double speed.', {
		trafficSpeed: 2, pedestrianSpeed: 1.3, timeScale: 0.94
	}),
	mode('celestial', 'Celestial Storm', 'Faster events, earlier bosses, brighter score windows.', {
		celestial: true, eventCadence: 16, bossAt: 0.48, scoreScale: 1.18
	})
];

export function modeAt(id = 'classic') {
	return MODES.find(candidate => candidate.id === id) || MODES[0];
}

export function nextModeId(id = 'classic') {
	const index = MODES.findIndex(candidate => candidate.id === id);
	return MODES[(index + 1 + MODES.length) % MODES.length].id;
}

function mode(id, name, description, overrides = {}) {
	return Object.freeze({
		id, name, description, timeScale: 1, targetScale: 1, startMassScale: 1,
		trafficSpeed: 1, rivalSpeed: 1, pedestrianSpeed: 1, playerSpeed: 1,
		scoreScale: 1, captureMass: 1, eventCadence: 27, bossAt: 0.58,
		untimed: false, events: true, bossImmediate: false, rivalLimit: Infinity,
		win: 'mass', reverse: false, fragile: false, celestial: false, daily: false,
		...overrides
	});
}
