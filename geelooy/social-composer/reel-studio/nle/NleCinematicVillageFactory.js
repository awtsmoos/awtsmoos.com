// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleCinematicVillageFactory
 * @description
 * A complete village, node graphs, cinematic tracks, and AI brief arrive as one
 * deterministic project that opens, edits, compiles, previews, and renders immediately.
 */

import { createAiMovieEnvelope } from './NleAiContract.js';
import { createCinematicGraphSet } from './NleCinematicGraphFactory.js';
import { createCinematicVillageLayout } from './NleCinematicVillageLayout.js';
import { createCinematicVillageTracks } from './NleCinematicVillageTracks.js';

export function createCinematicVillageProject(options = {}) {
	const duration = bounded(options.duration, 8, 120, 24);
	const seed = Number(options.seed || 613);
	const graphs = createCinematicGraphSet(seed);
	const world = createCinematicVillageLayout(seed);
	return {
		ai: { contract: 'awtsmoos.ai-movie.v1', creativeBrief: creativeBrief() },
		cameraRigs: [],
		characters: [{ id: 'player', label: 'Lead chossid', modelRequest: 'Consistent modest cinematic character reference' }],
		duration,
		fps: 24,
		graphs: graphs.graphs,
		materialGraphs: graphs.materialGraphs,
		nle: { assets: createAssets(world, seed), version: 3 },
		render: { fileName: 'the-village-awakens.webm', videoBitsPerSecond: 8000000 },
		resolution: { height: 1080, width: 1920 },
		seed,
		sequences: [],
		title: String(options.title || 'The Village Awakens — Cinematic World'),
		tracks: createCinematicVillageTracks(duration),
		version: 1,
		viewMode: 'legacy'
	};
}

export function createCinematicVillageEnvelope(options = {}) {
	return createAiMovieEnvelope(createCinematicVillageProject(options));
}

function createAssets(world, seed) {
	return [
		{ id: 'cinematic-village-world', kind: 'cinematic-world', label: 'Living cinematic village', particleGraphIds: ['particles-fireflies', 'particles-mist'], seed, shaderGraphId: 'shader-village-dawn', world },
		{ animation: 'rise', background: 'rgba(4, 8, 15, .32)', color: '#fff7df', fontSize: 86, id: 'title-village-opening', kind: 'title', label: 'Opening title', subtext: 'A MitzvahWorld Film', text: 'THE VILLAGE AWAKENS' },
		{ animation: 'rise', background: 'rgba(3, 5, 8, .55)', color: '#ffe9ad', fontSize: 58, id: 'title-village-closing', kind: 'title', label: 'Closing title', subtext: 'B"H', text: 'ONE STEP CAN AWAKEN A WORLD' },
		{ fadeIn: 1.2, fadeOut: 1.8, frequency: 110, id: 'tone-village-score', kind: 'tone', label: 'Village score bed', volume: 0.038, waveform: 'sine' }
	];
}

function creativeBrief() {
	return {
		assetRequests: ['Consistent lead character reference.', 'Old stone and plaster village references.', 'Trees, wet paths, warm windows, and dawn atmosphere.', 'Footsteps, wind, birds, distant market, and restrained score stems.'],
		cameraLanguage: 'Aerial reveal, slow dolly, side track, forest orbit, and final crane reveal.',
		continuity: ['Preserve the same character and wardrobe.', 'Keep screen direction toward the radiant home.', 'Maintain damp ground and dawn light.', 'Keep house and tree geography stable.'],
		environment: 'A lived old-world village with eleven houses, sixty-four trees, stone paths, lamps, mist, and warm windows.',
		lighting: 'Cool dawn sky, soft fog, low golden sun, warm motivated windows, and restrained vignette.',
		logline: 'A chossid walks through an awakening village and discovers that one faithful step can bring an entire world toward light.',
		negativeConstraints: ['No floating buildings.', 'No changing wardrobe.', 'No impossible shadows.', 'No unreadable generated signs.'],
		sound: 'Wind, birds, damp footsteps, distant market life, and a restrained rising score.',
		subject: 'One dignified walking chossid moving through a coherent village toward a radiant home.',
		visualLanguage: 'Cinematic procedural WebGL world with realistic composition goals, tactile materials, atmospheric depth, and editable node graphs.'
	};
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value || fallback);
	return Math.max(minimum, Math.min(maximum, number));
}
