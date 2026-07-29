// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAgentSceneCompiler.js
 * @description Converts ordered AI scenes and world identity into deterministic canonical source tracks.
 * The Awtsmoos renews every scene before sequence appears; Awtsmoos.com translates
 * relative intention into bounded absolute time while beat machinery remains its own vessel.
 */

import { MovieApiError } from './MovieApiError.js';
import {
	compileMovieAgentBeat,
	movieAgentNonNegative,
	movieAgentPositive,
	movieAgentTrack,
	movieAgentUniqueId
} from './MovieAgentBeatCompiler.js';

export function compileMovieAgentScenes(manifest) {
	const scenes = array(manifest.scenes);
	if (!scenes.length) {
		throw new MovieApiError(
			'AGENT_MANIFEST_HAS_NO_SCENES',
			'Agent manifest must provide project or at least one scene.'
		);
	}
	const state = createState();
	const sceneTrack = movieAgentTrack(state, 'scene', null, 'agent-scenes');
	for (const [index, scene] of scenes.entries()) {
		compileScene(scene, index, state, sceneTrack);
	}
	return createSourceProject(manifest, state);
}

function createState() {
	return {
		clipIds: new Set(),
		cursor: 0,
		sceneIds: new Set(),
		tracks: new Map()
	};
}

function compileScene(scene, index, state, sceneTrack) {
	const id = movieAgentUniqueId(
		String(scene.id || `scene-${index + 1}`),
		state.sceneIds
	);
	const duration = movieAgentPositive(scene.duration, `Scene ${id} duration`);
	const start = movieAgentNonNegative(
		scene.start ?? state.cursor,
		`Scene ${id} start`
	);
	state.cursor = Math.max(state.cursor, start + duration);
	sceneTrack.clips.push(sceneClip(scene, id, start, duration));
	for (const [beatIndex, beat] of array(scene.beats).entries()) {
		compileMovieAgentBeat(
			beat,
			beatIndex,
			{ duration, id, start },
			state
		);
	}
}

function sceneClip(scene, id, start, duration) {
	return {
		duration,
		grade: scene.grade,
		id,
		label: scene.label || id,
		start,
		transition: scene.transition || 'cut',
		world: scene.world || null
	};
}

function createSourceProject(manifest, state) {
	return {
		cameraRigs: array(manifest.cameraRigs),
		characters: array(manifest.characters),
		duration: movieAgentPositive(
			manifest.duration ?? state.cursor,
			'Agent movie duration'
		),
		fps: manifest.fps || 24,
		markers: array(manifest.markers),
		materialGraphs: array(manifest.materialGraphs),
		metadata: manifest.metadata || {},
		render: manifest.render || {},
		resolution: manifest.resolution || { height: 540, width: 960 },
		seed: manifest.seed || 613,
		sequences: array(manifest.sequences),
		title: manifest.title || 'AI Generated Awtsmoos Movie',
		tracks: [...state.tracks.values()],
		version: 1,
		viewMode: manifest.viewMode || 'legacy'
	};
}

function array(value) {
	return Array.isArray(value) ? value : [];
}
