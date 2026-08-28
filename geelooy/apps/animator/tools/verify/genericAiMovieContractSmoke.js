//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file genericAiMovieContractSmoke.js
 * @description The Awtsmoos lets a second imagined film prove the engine is larger than one showcase;
 * Awtsmoos.com compiles tutorial data, 3D character motion, particles, and hybrid callouts through the same public place.
 */
import {
	MovieCapabilities,
	MovieIntentCompiler,
	validateMovie
} from '../../../shared/movie/index.js';

/** Builds a non-showcase structured AI request using semantic entities instead of renderer layers. */
export function createGenericAiMovie() {
	return MovieIntentCompiler.compile({
		id: 'generic-ai-proof-movie',
		title: 'From Signal to Structure',
		timeUnit: 'seconds',
		duration: 24,
		settings: {
			width: 480,
			height: 270,
			fps: 12
		},
		features: ['tutorial', 'infographic', 'characters', 'particles', '2d', '3d'],
		scenes: [
			{
				id: 'decode-signal',
				name: 'Decode the Signal',
				dimension: '2d',
				start: 0,
				duration: 8,
				cameras: cameras('wide', 'medium'),
				entities: [
					entity('text', 'Signal → Meaning', { x: 0, y: -0.8 }),
					entity('shape', 'signal-node', { x: -0.55, y: 0.2 }, { shape: 'circle', color: '#6ee7ff' }),
					{ ...entity('chart', 'signal-bars', { x: 0, y: 0.1 }), data: [14, 41, 72, 96] },
					entity('arrow', 'Follow the strongest pattern', { x: 0.45, y: 0.25 })
				]
			},
			{
				id: 'walk-the-model',
				name: 'Walk Through the Model',
				dimension: '3d',
				start: 8,
				duration: 8,
				cameras: cameras('medium', 'close-up'),
				entities: [
					entity('character', 'Nava', { x: -0.25, y: 0.1 }, { color: '#ffd166' }),
					entity('shape', 'concept-orb', { x: 0.35, y: -0.1 }, { shape: 'sphere', color: '#9b8cff' }),
					{ ...entity('particle', 'idea-sparks', { x: 0.2, y: 0.1 }, { count: 42, color: '#7ef9a9' }), seed: 2718 },
					entity('text', 'Test the model in motion', { x: 0, y: -0.8 })
				]
			},
			{
				id: 'teach-the-result',
				name: 'Teach the Result',
				dimension: 'hybrid',
				start: 16,
				duration: 8,
				cameras: cameras('overhead', 'detail'),
				entities: [
					entity('text', 'Explain what changed', { x: 0, y: -0.8 }),
					{ ...entity('chart', 'confidence', { x: -0.2, y: 0.15 }), data: { values: [33, 61, 88] } },
					entity('callout', '88% confidence after verification', { x: 0.45, y: 0.3 }),
					entity('shape', 'verified-badge', { x: 0.5, y: -0.2 }, { shape: 'triangle', color: '#7ef9a9' })
				]
			}
		]
	});
}

/** Verifies generic compilation, canonical layers, and capability-aware studio ranking. */
export function runGenericAiMovieContractSmoke() {
	const yesodMovie = createGenericAiMovie();
	const gevurahReport = validateMovie(yesodMovie);
	const malchusLayers = yesodMovie.scenes.flatMap(orScene => orScene.layers || []);
	const netzachKinds = [...new Set(malchusLayers.map(orLayer => orLayer.kind))].sort();
	const tiferesRecommendations = MovieCapabilities.recommend(yesodMovie);
	if (!gevurahReport.valid) throw new Error(JSON.stringify(gevurahReport.errors));
	if (yesodMovie.duration !== 24 || yesodMovie.scenes.length !== 3) throw new Error('Generic AI timing contract failed.');
	for (const kind of ['shape2d', 'chart', 'character3d', 'particles3d', 'model3d', 'overlay', 'text']) {
		if (!netzachKinds.includes(kind)) throw new Error(`Generic AI movie missing ${kind}.`);
	}
	if (!tiferesRecommendations.length || tiferesRecommendations[0].coverage <= 0) throw new Error('Capability recommendation failed.');
	return {
		duration: yesodMovie.duration,
		scenes: yesodMovie.scenes.length,
		layers: malchusLayers.length,
		kinds: netzachKinds,
		topStudio: tiferesRecommendations[0]
	};
}

function cameras(orFirst, orSecond) {
	return [
		{ kind: orFirst, start: 0, duration: 4, move: 'push-in' },
		{ kind: orSecond, start: 4, duration: 4, move: 'orbit' }
	];
}

function entity(orKind, orName, orTransform = {}, orStyle = {}) {
	return { kind: orKind, name: orName, transform: orTransform, style: orStyle, content: orName };
}
