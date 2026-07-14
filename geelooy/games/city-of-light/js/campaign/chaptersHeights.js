//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ChaptersHeights
 * @description
 * The heights make platforms visible as raised courts with honest ramps and
 * multiple exits. Wind changes animation and pacing, never topology, because
 * the Awtsmoos.com path must remain accessible before spectacle begins.
 */

import { defineChapter } from './ChapterFactory.js';

export const CHAPTERS_HEIGHTS = Object.freeze([
	defineChapter({
		id: 'heights-1', number: 17, region: 'heights', title: 'Terraces of Wind',
		summary: 'Cross every raised terrace and restore its wind lamps.',
		width: 35, height: 31, plazas: 7, loops: 14, platforms: 6, sparks: 11,
		wildlife: { dove: 5, owl: 2, firefly: 22 }, weather: 'wind',
		requiredAbility: 'echoSight',
		stages: [
			{ type: 'platform', count: 4, label: 'Visit four wind terraces' },
			{ type: 'awaken', count: 3, label: 'Restore the terrace lamps' },
			{ type: 'exit', count: 1, label: 'Reach the upper gate' }
		]
	}),
	defineChapter({
		id: 'heights-2', number: 18, region: 'heights', title: 'Golden Ramps',
		summary: 'Link six platforms through shrines and bridge stones.',
		width: 37, height: 33, plazas: 8, loops: 15, platforms: 7, sparks: 12,
		wildlife: { dove: 5, deer: 2, owl: 2, firefly: 24 }, weather: 'wind',
		stages: [
			{ type: 'platform', count: 6, label: 'Visit the golden platforms' },
			{ type: 'bridge', count: 4, label: 'Awaken the ramp stones' },
			{ type: 'collect', count: 10, label: 'Gather the golden sparks' },
			{ type: 'exit', count: 1, label: 'Climb beyond the ramps' }
		]
	}),
	defineChapter({
		id: 'heights-3', number: 19, region: 'heights', title: 'Sky Garden Circuit',
		summary: 'Guide animals across the high courts without losing the path.',
		width: 39, height: 33, plazas: 9, loops: 16, platforms: 8, sparks: 13,
		wildlife: { dove: 6, deer: 3, fox: 2, owl: 3, firefly: 26 }, weather: 'gusts',
		stages: [
			{ type: 'checkpoint', count: 2, label: 'Reach the sky checkpoints' },
			{ type: 'escort', count: 2, species: 'deer', label: 'Guide two deer across' },
			{ type: 'platform', count: 6, label: 'Visit the sky platforms' },
			{ type: 'exit', count: 1, label: 'Complete the sky circuit' }
		]
	}),
	defineChapter({
		id: 'heights-4', number: 20, region: 'heights', title: 'Step Between Winds',
		summary: 'Complete the highest circuit and receive the wind-step.',
		width: 41, height: 35, plazas: 9, loops: 17, platforms: 9, sparks: 14,
		wildlife: { dove: 7, deer: 3, owl: 3, firefly: 30 }, weather: 'aurora',
		rewardAbility: 'windStep',
		stages: [
			{ type: 'platform', count: 8, label: 'Visit the crown platforms' },
			{ type: 'sequence', count: 5, label: 'Complete the wind echo' },
			{ type: 'collect', count: 12, label: 'Gather the crown sparks' },
			{ type: 'exit', count: 1, label: 'Receive the wind-step' }
		]
	})
]);
