//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ChaptersRiver
 * @description
 * The river chapters turn paired stones and lanterns into trustworthy passage.
 * Bridges are mission edges, never decorative lies, so the Awtsmoos.com player
 * crosses only routes whose opening and destination have both been proven.
 */

import { defineChapter } from './ChapterFactory.js';

export const CHAPTERS_RIVER = Object.freeze([
	defineChapter({
		id: 'river-1', number: 9, region: 'river', title: 'Two Stones Across Water',
		summary: 'Awaken paired stones and reveal the first bridge.',
		width: 31, height: 27, plazas: 5, loops: 10, platforms: 4, sparks: 10,
		wildlife: { dove: 4, fox: 2, firefly: 18 }, weather: 'mist',
		requiredAbility: 'animalCall',
		stages: [
			{ type: 'bridge', count: 2, label: 'Awaken the paired bridge stones' },
			{ type: 'collect', count: 8, label: 'Gather the river sparks' },
			{ type: 'exit', count: 1, label: 'Cross the mirror gate' }
		]
	}),
	defineChapter({
		id: 'river-2', number: 10, region: 'river', title: 'Lanterns in the Mist',
		summary: 'Restore lanterns that reveal a safe passage through the mist.',
		width: 33, height: 27, plazas: 6, loops: 11, platforms: 4, sparks: 11,
		wildlife: { dove: 4, owl: 1, firefly: 22 }, weather: 'mist',
		stages: [
			{ type: 'awaken', count: 4, label: 'Restore the river lanterns' },
			{ type: 'checkpoint', count: 1, label: 'Reach the mist checkpoint' },
			{ type: 'collect', count: 9, label: 'Gather the reflected sparks' },
			{ type: 'exit', count: 1, label: 'Leave the mist behind' }
		]
	}),
	defineChapter({
		id: 'river-3', number: 11, region: 'river', title: 'The Divided Current',
		summary: 'Choose two routes, awaken both banks, and reunite the current.',
		width: 35, height: 29, plazas: 6, loops: 12, platforms: 5, sparks: 12,
		wildlife: { deer: 2, fox: 2, owl: 1, firefly: 24 }, weather: 'rain',
		stages: [
			{ type: 'bridge', count: 4, label: 'Awaken four bank stones' },
			{ type: 'awaken', count: 2, label: 'Restore both river shrines' },
			{ type: 'collect', count: 10, label: 'Gather the reunited sparks' },
			{ type: 'exit', count: 1, label: 'Cross the reunited current' }
		]
	}),
	defineChapter({
		id: 'river-4', number: 12, region: 'river', title: 'Song of the Bridge',
		summary: 'Complete the river circuit and receive the bridge-song.',
		width: 35, height: 31, plazas: 7, loops: 13, platforms: 5, sparks: 13,
		wildlife: { dove: 5, deer: 2, owl: 2, firefly: 26 }, weather: 'stormlight',
		rewardAbility: 'bridgeSong',
		stages: [
			{ type: 'bridge', count: 6, label: 'Awaken the great bridge circuit' },
			{ type: 'escort', count: 1, species: 'deer', label: 'Guide the river deer home' },
			{ type: 'collect', count: 11, label: 'Gather the bridge-song sparks' },
			{ type: 'exit', count: 1, label: 'Receive the bridge-song' }
		]
	})
]);
