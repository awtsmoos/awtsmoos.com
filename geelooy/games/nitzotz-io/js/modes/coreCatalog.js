// B"H
// Boruch Hashem
// Blessed is He
import { defineMode } from './define.js';

/** The original twelve arena paths remain immutable and in their established order. */
export const CORE_MODES = Object.freeze([
	defineMode('classic', 'Classic Revelation', 'Reach the target mass before time closes.'),
	defineMode('last', 'Last Vessel Standing', 'Outgrow every rival and remain the final vessel.', {
		win: 'last',
		rivalSpeed: 1.12,
		targetScale: 0.88,
		events: true,
		bosses: false
	}),
	defineMode('endless', 'Endless Metropolis', 'No clock and no finish line; pursue a persistent record.', {
		untimed: true,
		win: 'record',
		events: true,
		bosses: true
	}),
	defineMode('conquest', 'District Conquest', 'Reveal every city quadrant and hold the complete map.', {
		win: 'conquest',
		timeScale: 1.28,
		events: true
	}),
	defineMode('bossRush', 'Boss Rush', 'Break successive district seals with shortened intervals.', {
		win: 'boss',
		bosses: true,
		events: false,
		bossAt: 7,
		timeScale: 1.35,
		targetScale: 0.8
	}),
	defineMode('zen', 'Zen Collection', 'No rivals and no timer; reveal the generated city at your pace.', {
		untimed: true,
		win: 'record',
		rivals: 0,
		events: false,
		bosses: false,
		playerSpeed: 0.92
	}),
	defineMode('daily', 'Daily Seed', 'One deterministic global seed and modifier for the current day.', {
		daily: true,
		events: true,
		bosses: true
	}),
	defineMode('timeAttack', 'Time Attack', 'Reach a reduced target under an unforgiving clock.', {
		timeScale: 0.58,
		targetScale: 0.72,
		playerSpeed: 1.08,
		scoreScale: 1.18
	}),
	defineMode('reverse', 'Reverse Malkhut', 'Begin enormous and consume only landmarks before mass decays.', {
		win: 'reverse',
		startMass: 1180,
		massDecay: 8.5,
		timeScale: 1.4,
		captureMass: -0.45,
		scoreScale: 1.25,
		events: true
	}),
	defineMode('fragile', 'Fragile Vessel', 'Any larger collision ends the round; routes matter more than mass.', {
		fragile: true,
		targetScale: 0.74,
		playerSpeed: 1.12,
		scoreScale: 1.3
	}),
	defineMode('trafficChaos', 'Traffic Chaos', 'A denser and faster moving city tests every crossing.', {
		trafficSpeed: 2.1,
		trafficDensity: 1.7,
		timeScale: 1.18,
		scoreScale: 1.16,
		events: true
	}),
	defineMode('celestial', 'Celestial Pressure', 'Rapid events, persistent bosses, and aggressive rivals.', {
		events: true,
		bosses: true,
		eventCadence: 10,
		rivalSpeed: 1.35,
		targetScale: 1.18,
		timeScale: 1.25,
		scoreScale: 1.4
	})
]);
