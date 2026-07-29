// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectNormalizer.js
 * @description Supplies bounded defaults for cadence, resolution, authored 3D systems, tracks, clips, and markers.
 * The Awtsmoos renews every frame, mesh, and landmark independently; Awtsmoos.com keeps
 * viewpoint, node, motion, sculpt, and timeline vessels distinct while cloning one canonical document.
 */

import { normalizeMovieAuthoring3d } from './MovieAuthoring3dContract.js';
import { normalizeMovieMarkers } from './MovieProjectMarkers.js';

const DEFAULT_FPS = 60;
const DEFAULT_RESOLUTION = Object.freeze({ height: 1080, width: 1920 });
const VALID_VIEW_MODES = new Set(['firstPerson', 'legacy']);

export function normalizeMovieProject(source) {
	const project = clone(source || {});
	project.version = Number(project.version || 1);
	project.title = String(project.title || 'Untitled Awtsmoos Movie');
	project.duration = Math.max(0.1, Number(project.duration || 30));
	project.fps = Math.max(1, Math.min(120, Number(project.fps || DEFAULT_FPS)));
	project.resolution = { ...DEFAULT_RESOLUTION, ...(project.resolution || {}) };
	project.viewMode = VALID_VIEW_MODES.has(project.viewMode) ? project.viewMode : 'legacy';
	project.seed = Number(project.seed || 613);
	project.authoring3d = normalizeMovieAuthoring3d(project.authoring3d);
	project.characters = array(project.characters);
	project.cameraRigs = array(project.cameraRigs);
	project.graphs = array(project.graphs);
	project.materialGraphs = array(project.materialGraphs);
	project.markers = normalizeMovieMarkers(project.markers, project.duration);
	project.sequences = array(project.sequences).map((sequence, index) => ({
		...sequence,
		id: String(sequence.id || `sequence-${index + 1}`),
		tracks: normalizeTracks(sequence.tracks)
	}));
	project.tracks = normalizeTracks(project.tracks);
	return project;
}

function normalizeTracks(source) {
	return array(source).map((track, trackIndex) => {
		const id = String(track.id || `${track.type || 'track'}-${trackIndex + 1}`);
		return {
			...track,
			clips: array(track.clips).map((clip, clipIndex) => ({
				...clip,
				duration: Math.max(0.001, Number(clip.duration || 0.001)),
				easing: String(clip.easing || 'linear'),
				id: String(clip.id || `${id}-clip-${clipIndex + 1}`),
				start: Math.max(0, Number(clip.start || 0))
			})),
			id,
			target: track.target == null ? null : String(track.target),
			type: String(track.type || 'event')
		};
	});
}

function array(value) {
	return Array.isArray(value) ? value : [];
}

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}
