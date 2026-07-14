//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ChaptersHeart
 * @description
 * The final region combines every learned path without inventing impossible
 * geometry. Its difficulty comes from layered missions and living systems, while
 * the Awtsmoos.com validator still proves every court before the crown appears.
 */

import { defineChapter } from './ChapterFactory.js';

export const CHAPTERS_HEART = Object.freeze([
	defineChapter({
		id: 'heart-1', number: 21, region: 'heart', title: 'Six Roads Return',
		summary: 'Revisit every learned symbol in one connected district.',
		width: 39, height: 35, plazas: 9, loops: 17, platforms: 8, sparks: 13,
		wildlife: { dove: 6, deer: 3, fox: 2, owl: 3, firefly: 28 }, weather: 'aurora',
		requiredAbility: 'windStep',
		stages: [
			{ type: 'awaken', count: 4, label: 'Awaken the returning shrines' },
			{ type: 'bridge', count: 4, label: 'Restore the returning bridges' },
			{ type: 'sequence', count: 4, label: 'Complete the returning echo' },
			{ type: 'exit', count: 1, label: 'Enter the heart road' }
		]
	}),
	defineChapter({
		id: 'heart-2', number: 22, region: 'heart', title: 'City of Living Paths',
		summary: 'Guide wildlife through platforms, shrines, and checkpoints.',
		width: 41, height: 35, plazas: 10, loops: 18, platforms: 9, sparks: 14,
		wildlife: { dove: 7, deer: 4, fox: 3, owl: 3, firefly: 30 }, weather: 'starlight',
		stages: [
			{ type: 'checkpoint', count: 2, label: 'Reach the living checkpoints' },
			{ type: 'escort', count: 3, species: 'deer', label: 'Guide three deer home' },
			{ type: 'platform', count: 7, label: 'Visit the living platforms' },
			{ type: 'exit', count: 1, label: 'Open the living gate' }
		]
	}),
	defineChapter({
		id: 'heart-3', number: 23, region: 'heart', title: 'Night Before the Crown',
		summary: 'Complete a long multi-stage vigil across the entire city.',
		width: 43, height: 37, plazas: 10, loops: 19, platforms: 10, sparks: 15,
		wildlife: { dove: 8, deer: 4, fox: 3, owl: 4, firefly: 34 }, weather: 'night',
		stages: [
			{ type: 'sequence', count: 6, label: 'Complete the vigil echo' },
			{ type: 'awaken', count: 5, label: 'Awaken the vigil shrines' },
			{ type: 'bridge', count: 6, label: 'Restore the vigil bridges' },
			{ type: 'collect', count: 13, label: 'Gather the vigil sparks' },
			{ type: 'exit', count: 1, label: 'Reach the crown threshold' }
		]
	}),
	defineChapter({
		id: 'heart-4', number: 24, region: 'heart', title: 'The City Becomes Light',
		summary: 'Complete the final pilgrimage and awaken the city as one.',
		width: 45, height: 39, plazas: 12, loops: 21, platforms: 12, sparks: 18,
		wildlife: { dove: 10, deer: 5, fox: 4, owl: 5, firefly: 40 }, weather: 'crownlight',
		stages: [
			{ type: 'platform', count: 10, label: 'Visit the twelvefold city' },
			{ type: 'escort', count: 3, species: 'deer', label: 'Guide the final herd home' },
			{ type: 'sequence', count: 7, label: 'Complete the crown echo' },
			{ type: 'awaken', count: 6, label: 'Awaken the crown shrines' },
			{ type: 'collect', count: 16, label: 'Gather the final sparks' },
			{ type: 'exit', count: 1, label: 'Awaken the City of Light' }
		]
	})
]);
