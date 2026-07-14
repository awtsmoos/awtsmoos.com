//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ChaptersGarden
 * @description
 * The garden chapters reveal that living creatures are not decoration. Doves,
 * deer, and foxes carry mission meaning through safe paths, and the Awtsmoos is
 * honored when every sanctuary can truly receive the life guided toward it.
 */

import { defineChapter } from './ChapterFactory.js';

export const CHAPTERS_GARDEN = Object.freeze([
	defineChapter({
		id: 'garden-1', number: 5, region: 'garden', title: 'The Listening Deer',
		summary: 'Find the deer and guide it toward a lit sanctuary.',
		width: 25, height: 23, plazas: 4, loops: 7, platforms: 2, sparks: 8,
		wildlife: { deer: 2, dove: 3, firefly: 14 }, weather: 'leaves',
		requiredAbility: 'dash',
		stages: [
			{ type: 'escort', count: 1, species: 'deer', label: 'Guide a deer home' },
			{ type: 'collect', count: 6, label: 'Gather the sanctuary sparks' },
			{ type: 'exit', count: 1, label: 'Enter the garden gate' }
		]
	}),
	defineChapter({
		id: 'garden-2', number: 6, region: 'garden', title: 'Foxfire Paths',
		summary: 'Follow curious foxes to awaken hidden garden lamps.',
		width: 27, height: 23, plazas: 5, loops: 8, platforms: 3, sparks: 9,
		wildlife: { fox: 2, deer: 1, dove: 3, firefly: 16 }, weather: 'leaves',
		stages: [
			{ type: 'awaken', count: 3, label: 'Awaken the foxfire lamps' },
			{ type: 'collect', count: 7, label: 'Gather the hidden sparks' },
			{ type: 'exit', count: 1, label: 'Cross the foxfire arch' }
		]
	}),
	defineChapter({
		id: 'garden-3', number: 7, region: 'garden', title: 'Flock of the Western Wall',
		summary: 'Restore shrines while preserving the path of the flock.',
		width: 29, height: 25, plazas: 5, loops: 9, platforms: 3, sparks: 10,
		wildlife: { dove: 6, deer: 2, fox: 1, firefly: 18 }, weather: 'breeze',
		stages: [
			{ type: 'checkpoint', count: 1, label: 'Reach the western arbor' },
			{ type: 'awaken', count: 4, label: 'Restore the garden shrines' },
			{ type: 'escort', count: 1, species: 'dove', label: 'Guide the flock to shelter' },
			{ type: 'exit', count: 1, label: 'Open the western wall' }
		]
	}),
	defineChapter({
		id: 'garden-4', number: 8, region: 'garden', title: 'Voice Among Leaves',
		summary: 'Gather the garden animals and receive the call of kindness.',
		width: 31, height: 25, plazas: 6, loops: 10, platforms: 3, sparks: 11,
		wildlife: { dove: 5, deer: 3, fox: 2, firefly: 20 }, weather: 'sunshower',
		rewardAbility: 'animalCall',
		stages: [
			{ type: 'escort', count: 2, species: 'deer', label: 'Guide two deer home' },
			{ type: 'awaken', count: 3, label: 'Awaken the listening stones' },
			{ type: 'collect', count: 9, label: 'Gather the voice sparks' },
			{ type: 'exit', count: 1, label: 'Receive the animal call' }
		]
	})
]);
