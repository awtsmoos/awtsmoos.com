//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ChaptersArchive
 * @description
 * The archive chapters ask the player to remember sequences rather than merely
 * collect. Owls become living guides, and every echo marker on Awtsmoos.com is
 * placed on a path the validator has already proven beneath the Awtsmoos.
 */

import { defineChapter } from './ChapterFactory.js';

export const CHAPTERS_ARCHIVE = Object.freeze([
	defineChapter({
		id: 'archive-1', number: 13, region: 'archive', title: 'The First Echo',
		summary: 'Follow the owl and repeat a short sequence of light.',
		width: 33, height: 29, plazas: 6, loops: 12, platforms: 4, sparks: 10,
		wildlife: { owl: 2, dove: 3, firefly: 20 }, weather: 'dustlight',
		requiredAbility: 'bridgeSong',
		stages: [
			{ type: 'sequence', count: 3, label: 'Repeat the three-part echo' },
			{ type: 'collect', count: 8, label: 'Gather the remembered sparks' },
			{ type: 'exit', count: 1, label: 'Enter the first archive gate' }
		]
	}),
	defineChapter({
		id: 'archive-2', number: 14, region: 'archive', title: 'Hall of Paired Voices',
		summary: 'Restore two echo chains on opposite sides of the hall.',
		width: 35, height: 29, plazas: 7, loops: 13, platforms: 5, sparks: 11,
		wildlife: { owl: 3, fox: 2, firefly: 22 }, weather: 'dustlight',
		stages: [
			{ type: 'sequence', count: 4, label: 'Complete the eastern echo' },
			{ type: 'awaken', count: 3, label: 'Awaken the paired voices' },
			{ type: 'collect', count: 9, label: 'Gather the paired sparks' },
			{ type: 'exit', count: 1, label: 'Cross the hall of voices' }
		]
	}),
	defineChapter({
		id: 'archive-3', number: 15, region: 'archive', title: 'Library Without Walls',
		summary: 'Trace a long echo path through open platforms and hidden courts.',
		width: 37, height: 31, plazas: 8, loops: 14, platforms: 6, sparks: 12,
		wildlife: { owl: 4, deer: 2, fox: 2, firefly: 24 }, weather: 'night',
		stages: [
			{ type: 'checkpoint', count: 2, label: 'Reach both archive checkpoints' },
			{ type: 'sequence', count: 5, label: 'Complete the long echo path' },
			{ type: 'collect', count: 10, label: 'Gather the library sparks' },
			{ type: 'exit', count: 1, label: 'Leave the wall-less library' }
		]
	}),
	defineChapter({
		id: 'archive-4', number: 16, region: 'archive', title: 'Sight of the Hidden Letter',
		summary: 'Unite every archive voice and receive echo-sight.',
		width: 39, height: 31, plazas: 8, loops: 15, platforms: 6, sparks: 13,
		wildlife: { owl: 5, dove: 4, fox: 2, firefly: 28 }, weather: 'starlight',
		rewardAbility: 'echoSight',
		stages: [
			{ type: 'sequence', count: 6, label: 'Complete the hidden-letter echo' },
			{ type: 'awaken', count: 4, label: 'Awaken the letter shrines' },
			{ type: 'collect', count: 11, label: 'Gather the hidden-letter sparks' },
			{ type: 'exit', count: 1, label: 'Receive echo-sight' }
		]
	})
]);
