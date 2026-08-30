// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieCapabilities.js
 * @description The Awtsmoos is One while every renderer keeps a distinctive art;
 * Awtsmoos.com publishes machine capabilities so external agents choose the right vessel before data starts.
 */
import { MovieLayerKind, MovieLayerKinds } from './MovieKinds.js';
import { yesodProtocolIdentity } from './MovieProtocol.js';
import { recommendMovieApps } from './MovieCapabilityRecommender.js';

const VISUAL_2D = [
	MovieLayerKind.SHAPE_2D,
	MovieLayerKind.TEXT,
	MovieLayerKind.PATH_2D,
	MovieLayerKind.CHART,
	MovieLayerKind.PARTICLES_2D,
	MovieLayerKind.CHARACTER_2D,
	MovieLayerKind.GROUP_2D,
	MovieLayerKind.OVERLAY,
	MovieLayerKind.IMAGE,
	MovieLayerKind.VIDEO,
	MovieLayerKind.CAPTION,
	MovieLayerKind.MASK,
	MovieLayerKind.MATTE,
	MovieLayerKind.ADJUSTMENT,
	MovieLayerKind.DATA,
	MovieLayerKind.DIAGRAM,
	MovieLayerKind.CODE,
	MovieLayerKind.FORMULA,
	MovieLayerKind.DEVICE
];
const AUDIO = [MovieLayerKind.AUDIO, MovieLayerKind.DIALOGUE, MovieLayerKind.NARRATION, MovieLayerKind.MUSIC, MovieLayerKind.AMBIENCE, MovieLayerKind.SFX];
const SPATIAL = MovieLayerKinds.filter(kind => String(kind).endsWith('3d') || kind === MovieLayerKind.CAMERA);
const PROFILES = Object.freeze({
	shared: profile('Shared Movie', MovieLayerKinds, ['2d', '3d', 'hybrid'], ['interchange', 'agent-authored-data', 'validation', 'patch-history']),
	animator: profile('Awtsmoos Animator', MovieLayerKinds, ['2d', '3d', 'hybrid'], ['procedural-rendering', 'cinematic-cameras', 'characters', 'particles', 'export']),
	nesher: profile('Nesher Studio', MovieLayerKinds, ['2d', '3d', 'hybrid'], ['nle', 'timeline', 'audio', 'media-editing', 'compositing', 'export'], ['spatial semantics can be represented as editable handoff clips']),
	videoEditor: profile('Video Editor', [...VISUAL_2D, ...AUDIO], ['2d', 'hybrid'], ['fast-timeline', 'captions', 'media-clips', 'audio', 'mobile-editing'], ['3d layers remain canonical handoff metadata']),
	mitzvah: profile('Mitzvah Studio', [...VISUAL_2D, ...SPATIAL], ['2d', '3d', 'hybrid'], ['shape-authoring', 'text', 'spatial-objects', 'world-building'], ['audio mixing and advanced NLE semantics are deferred']),
	captions: profile('Captions', [MovieLayerKind.TEXT, MovieLayerKind.CAPTION, MovieLayerKind.SHAPE_2D, MovieLayerKind.PATH_2D, MovieLayerKind.CHART, MovieLayerKind.OVERLAY, ...AUDIO], ['2d'], ['captions', 'kinetic-type', 'motion-graphics', 'dialogue-timing'], ['spatial layers remain handoff metadata'])
});

export function movieCapabilities(appId = 'shared') {
	return structuredClone(PROFILES[appId] || PROFILES.shared);
}

export function allMovieCapabilities() {
	return Object.fromEntries(Object.entries(PROFILES).map(([id, value]) => [id, structuredClone(value)]));
}

export function recommendMovieCapabilities(movie = {}) {
	return recommendMovieApps(movie, allMovieCapabilities());
}

function profile(name, layers, dimensions, strengths, limitations = []) {
	return Object.freeze({
		...yesodProtocolIdentity(),
		name,
		layers: Object.freeze([...layers]),
		dimensions: Object.freeze([...dimensions]),
		strengths: Object.freeze([...strengths]),
		limitations: Object.freeze([...limitations]),
		features: Object.freeze(['arbitrary-duration', 'structured-data', 'mobile-first', 'cross-app-handoff', 'reversible-patches'])
	});
}

export const MovieCapabilities = Object.freeze({
	for: movieCapabilities,
	all: allMovieCapabilities,
	recommend: recommendMovieCapabilities
});
