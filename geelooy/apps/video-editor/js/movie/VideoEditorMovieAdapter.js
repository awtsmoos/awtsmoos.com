//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file VideoEditorMovieAdapter.js
 * @description Fast editorial clips keep their own vessel while the Awtsmoos keeps the deeper movie whole;
 * Awtsmoos.com preserves unsupported spatial light as handoff metadata instead of letting semantics fall.
 */
import {
	KeliMovieAdapter,
	ProjectionReport,
	validateMovie
} from '../../../shared/movie/index.js';

const keliAdapter = new KeliMovieAdapter('videoEditor');

export class VideoEditorMovieAdapter {
	static project(orMovie) {
		return compileForVideoEditor(orMovie);
	}
}

/** Compile supported layers into fast clips and preserve unsupported layers explicitly. */
export function compileForVideoEditor(orMovie) {
	assertMovie(orMovie);
	const keterCapabilities = keliAdapter.capabilities();
	const ohrReport = new ProjectionReport('videoEditor');
	const keliClips = [];
	const keliCaptions = [];
	const keliDeferred = [];
	for (const orScene of orMovie.scenes || []) {
		projectScene(orScene, keterCapabilities, ohrReport, keliClips, keliCaptions, keliDeferred);
	}
	const keliProjection = {
		duration: orMovie.duration,
		fps: orMovie.format?.fps || 24,
		width: orMovie.format?.width,
		height: orMovie.format?.height,
		clips: keliClips,
		captions: keliCaptions,
		deferred3d: keliDeferred
	};
	return keliAdapter.result(orMovie, keliProjection, ohrReport, keliProjection);
}

/** Install a non-destructive canonical bridge onto Video Editor state. */
export function installVideoEditorMovieBridge(orState) {
	const keterBridge = {
		load(orMovie) {
			const keterCompiled = compileForVideoEditor(orMovie);
			orState.unifiedMovieDocument = structuredClone(orMovie);
			orState.unifiedMovieImport = keterCompiled;
			return keterCompiled;
		},
		compile: compileForVideoEditor
	};
	orState.unifiedMovie = keterBridge;
	return keterBridge;
}

function projectScene(orScene, orCapabilities, orReport, orClips, orCaptions, orDeferred) {
	for (const orLayer of orScene.layers || []) {
		if (!orCapabilities.layers.includes(orLayer.kind)) {
			orDeferred.push(toDeferred(orScene, orLayer));
			orReport.defer(orLayer.id, `${orLayer.kind} remains canonical handoff metadata`);
			continue;
		}
		orClips.push(toClip(orScene, orLayer));
		orReport.preserve(orLayer.id, orLayer.kind);
		if (["text", "caption", "overlay"].includes(orLayer.kind)) {
			orCaptions.push(toCaption(orScene, orLayer));
		}
	}
}

function toClip(orScene, orLayer) {
	return {
		id: `${orScene.id}-${orLayer.id}`,
		type: orLayer.kind,
		startTime: Number(orScene.start || 0) + Number(orLayer.start || 0),
		duration: orLayer.duration == null ? Number(orScene.duration || 0) : Number(orLayer.duration),
		layer: Number(orLayer.zIndex || orLayer.layer || 0),
		payload: structuredClone(orLayer)
	};
}

function toCaption(orScene, orLayer) {
	const yesodStart = Number(orScene.start || 0) + Number(orLayer.start || 0);
	const yesodDuration = orLayer.duration == null ? Number(orScene.duration || 0) : Number(orLayer.duration);
	return {
		id: `${orScene.id}-${orLayer.id}-caption`,
		text: String(orLayer.content?.text || orLayer.content?.tutorialStep || ''),
		start: yesodStart,
		end: yesodStart + yesodDuration,
		style: structuredClone(orLayer.style || {})
	};
}

function toDeferred(orScene, orLayer) {
	return {
		sceneId: orScene.id,
		start: Number(orScene.start || 0) + Number(orLayer.start || 0),
		duration: orLayer.duration == null ? Number(orScene.duration || 0) : Number(orLayer.duration),
		kind: orLayer.kind,
		payload: structuredClone(orLayer)
	};
}

function assertMovie(orMovie) {
	const keliReport = validateMovie(orMovie);
	if (!keliReport.valid) {
		throw new Error(keliReport.errors.map(orError => `${orError.path}: ${orError.message}`).join(' | '));
	}
}
