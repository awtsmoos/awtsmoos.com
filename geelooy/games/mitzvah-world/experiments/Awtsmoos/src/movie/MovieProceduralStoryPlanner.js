// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProceduralStoryPlanner.js
 * @description Divides prompt intent into a deterministic dramatic arc with scene purpose and measured duration.
 * The Awtsmoos is beyond beginning, reversal, and return while each finite story benefits from honest shape;
 * Awtsmoos.com distributes time across revelation, challenge, choice, deed, and transformed landscape.
 */

import { createMovieProceduralRandom } from './MovieProceduralSeed.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const ARC_PURPOSES = Object.freeze([
	'establish-world',
	'introduce-desire',
	'reveal-challenge',
	'deepening-choice',
	'mitzvah-in-action',
	'consequence',
	'reconciliation',
	'final-image'
]);

export function planProceduralMovieStory(intent) {
	const random = createMovieProceduralRandom(intent.seed, 'story-arc');
	const purposes = choosePurposes(intent.sceneCount);
	const weights = purposes.map((purpose, index) => sceneWeight(purpose, index, random));
	const totalWeight = weights.reduce((sum, value) => sum + value, 0);
	let cursor = 0;
	const scenes = purposes.map((purpose, index) => {
		const rawDuration = intent.duration * weights[index] / totalWeight;
		const duration = index === purposes.length - 1
			? Number((intent.duration - cursor).toFixed(3))
			: Number(rawDuration.toFixed(3));
		const scene = {
			duration,
			id: `scene-${index + 1}`,
			index,
			purpose,
			start: Number(cursor.toFixed(3)),
			tension: tensionForPurpose(purpose),
			theme: intent.themes[index % intent.themes.length]
		};
		cursor += duration;
		return scene;
	});
	return createMovieProjectSnapshot({
		duration: intent.duration,
		genre: intent.genre,
		scenes,
		seed: intent.seed,
		tone: intent.tone
	});
}

function choosePurposes(count) {
	if (count === 1) return ['mitzvah-in-action'];
	if (count === 2) return ['reveal-challenge', 'final-image'];
	const output = ['establish-world'];
	const middle = ARC_PURPOSES.slice(1, -1);
	for (let index = 0; index < count - 2; index += 1) {
		output.push(middle[Math.floor(index * middle.length / Math.max(1, count - 2))]);
	}
	output.push('final-image');
	return output;
}

function sceneWeight(purpose, index, random) {
	const base = purpose === 'mitzvah-in-action' ? 1.35
		: purpose === 'final-image' ? 0.8
			: purpose === 'establish-world' ? 0.9 : 1;
	return base * random.between(0.88, 1.12) + index * 0.001;
}

function tensionForPurpose(purpose) {
	return ({
		'establish-world': 0.1,
		'introduce-desire': 0.25,
		'reveal-challenge': 0.6,
		'deepening-choice': 0.75,
		'mitzvah-in-action': 1,
		consequence: 0.7,
		reconciliation: 0.35,
		'final-image': 0.15
	})[purpose] ?? 0.5;
}
