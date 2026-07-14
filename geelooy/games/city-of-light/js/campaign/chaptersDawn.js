//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ChaptersDawn
 * @description
 * The first courtyards teach movement, gathering, awakening, and return. Their
 * light is gentle, but their missions are complete vessels rather than tutorial
 * scenery, revealing the Awtsmoos through deliberate first steps.
 */

import { defineChapter } from './ChapterFactory.js';

export const CHAPTERS_DAWN = Object.freeze([
	defineChapter({
		id: 'dawn-1', number: 1, region: 'dawn', title: 'First Courtyard',
		summary: 'Gather the first sparks and awaken the eastern beacon.',
		width: 19, height: 17, plazas: 2, loops: 3, platforms: 1, sparks: 6,
		wildlife: { dove: 2, firefly: 8 }, weather: 'clear',
		stages: [
			{ type: 'collect', count: 6, label: 'Gather six sparks' },
			{ type: 'exit', count: 1, label: 'Enter the dawn beacon' }
		]
	}),
	defineChapter({
		id: 'dawn-2', number: 2, region: 'dawn', title: 'Three Lamps',
		summary: 'Awaken three lamps before the central road appears.',
		width: 21, height: 19, plazas: 3, loops: 4, platforms: 1, sparks: 7,
		wildlife: { dove: 3, firefly: 10 }, weather: 'breeze',
		stages: [
			{ type: 'awaken', count: 3, label: 'Awaken three lamps' },
			{ type: 'collect', count: 5, label: 'Gather the revealed sparks' },
			{ type: 'exit', count: 1, label: 'Cross the central beacon' }
		]
	}),
	defineChapter({
		id: 'dawn-3', number: 3, region: 'dawn', title: 'The Returning Path',
		summary: 'Reach the checkpoint, restore the shrines, and return renewed.',
		width: 23, height: 19, plazas: 3, loops: 5, platforms: 2, sparks: 8,
		wildlife: { dove: 3, deer: 1, firefly: 12 }, weather: 'breeze',
		stages: [
			{ type: 'checkpoint', count: 1, label: 'Reach the garden checkpoint' },
			{ type: 'awaken', count: 2, label: 'Restore two shrines' },
			{ type: 'collect', count: 8, label: 'Gather every returning spark' },
			{ type: 'exit', count: 1, label: 'Return to the beacon' }
		]
	}),
	defineChapter({
		id: 'dawn-4', number: 4, region: 'dawn', title: 'Crown of Morning',
		summary: 'Complete the dawn circuit and receive the gift of swift light.',
		width: 25, height: 21, plazas: 4, loops: 6, platforms: 2, sparks: 9,
		wildlife: { dove: 4, deer: 1, firefly: 14 }, weather: 'sunrise',
		rewardAbility: 'dash',
		stages: [
			{ type: 'awaken', count: 4, label: 'Awaken the crown shrines' },
			{ type: 'collect', count: 9, label: 'Gather the crown sparks' },
			{ type: 'exit', count: 1, label: 'Receive the morning crown' }
		]
	})
]);
