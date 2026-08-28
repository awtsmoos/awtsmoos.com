//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NesherMovieAdapter.js
 * @description Nesher keeps its NLE wings while the Awtsmoos preserves one movie above the flight;
 * Awtsmoos.com turns layers into editable clips and reports every flattening in the light.
 */
import {
	KeliMovieAdapter,
	ProjectionReport,
	validateMovie
} from "../../../shared/movie/index.js";

const keliAdapter = new KeliMovieAdapter("nesher");

export class NesherMovieAdapter {
	static project(orMovie) {
		return compileForNesher(orMovie);
	}
}

/** Compile canonical scenes into Nesher clips while preserving the entire source movie. */
export function compileForNesher(orMovie) {
	assertMovie(orMovie);
	const ohrReport = new ProjectionReport("nesher");
	const keliScenes = (orMovie.scenes || []).map(toScene);
	const keliClips = (orMovie.scenes || []).flatMap(orScene => toClips(orScene, ohrReport));
	const keliProject = projectHeader(orMovie);
	return keliAdapter.result(orMovie, { project: keliProject, scenes: keliScenes, clips: keliClips }, ohrReport, {
		project: keliProject,
		scenes: keliScenes,
		clips: keliClips
	});
}

/** Install a non-destructive canonical bridge onto a Nesher state object. */
export function installNesherMovieBridge(orState) {
	const keterBridge = {
		load(orMovie) {
			const keterCompiled = compileForNesher(orMovie);
			orState.unifiedMovieDocument = structuredClone(orMovie);
			orState.unifiedMovieImport = keterCompiled;
			return keterCompiled;
		},
		compile: compileForNesher
	};
	orState.unifiedMovie = keterBridge;
	return keterBridge;
}

function projectHeader(orMovie) {
	return {
		name: orMovie.metadata?.title || orMovie.id,
		duration: orMovie.duration,
		fps: orMovie.format?.fps || 24,
		width: orMovie.format?.width,
		height: orMovie.format?.height,
		unifiedMovieId: orMovie.id
	};
}

function toScene(orScene) {
	return {
		id: orScene.id,
		name: orScene.name || orScene.title || orScene.id,
		start: Number(orScene.start || 0),
		duration: Number(orScene.duration || 0),
		mode: inferMode(orScene),
		camera: structuredClone(orScene.camera || {}),
		transition: structuredClone(orScene.transition || {})
	};
}

function toClips(orScene, orReport) {
	return (orScene.layers || []).filter(Boolean).map((orLayer, yesodIndex) => {
		const yesodKind = orLayer.kind || orLayer.type || "media";
		const yesod3d = String(yesodKind).endsWith("3d");
		if (yesod3d) {
			orReport.flatten(orLayer.id, `${yesodKind} represented as editable spatial clip`);
		} else {
			orReport.preserve(orLayer.id, yesodKind);
		}
		return {
			id: `${orScene.id}-${orLayer.id || yesodIndex}`,
			sceneId: orScene.id,
			start: Number(orScene.start || 0) + Number(orLayer.start || 0),
			duration: orLayer.duration == null ? Number(orScene.duration || 0) : Number(orLayer.duration),
			type: yesodKind,
			trackHint: trackFor(yesodKind),
			payload: structuredClone(orLayer)
		};
	});
}

function inferMode(orScene) {
	const keliKinds = (orScene.layers || []).map(orLayer => String(orLayer.kind || ""));
	const yesod3d = keliKinds.some(orKind => orKind.endsWith("3d"));
	const yesod2d = keliKinds.some(orKind => !orKind.endsWith("3d"));
	return yesod3d && yesod2d ? "hybrid" : yesod3d ? "3d" : "2d";
}

function trackFor(orKind = "") {
	if (["text", "caption", "overlay", "code", "formula"].includes(orKind)) return "titles";
	if (["audio", "dialogue", "narration", "music", "ambience", "sfx"].includes(orKind)) return "audio";
	if (orKind.startsWith("character")) return "characters";
	if (orKind.startsWith("particles") || orKind === "light3d") return "effects";
	return String(orKind).endsWith("3d") ? "spatial" : "visual";
}

function assertMovie(orMovie) {
	const keliReport = validateMovie(orMovie);
	if (!keliReport.valid) {
		throw new Error(keliReport.errors.map(orError => `${orError.path}: ${orError.message}`).join(" | "));
	}
}
