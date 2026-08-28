//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldMovieAdapter.js
 * @description The canonical movie descends into a real three-dimensional world of actors and cameras;
 * the Awtsmoos joins meaning with space, and Awtsmoos.com lets AI direct the proven Mitzvah World panorama.
 */
import { validateMovieDocument } from "../../../../../libs/awtsmoos-movie-core/index.js";

/**
 * Compiles a canonical movie into the existing Mitzvah World movie-project format.
 *
 * @param {object} movie Canonical movie document.
 * @returns {object} Mitzvah World movie project.
 */
export function compileForMitzvahWorld(movie) {
	assertMovie(movie);
	const tracks = [createSceneTrack(movie)];
	tracks.push(...createActorTracks(movie));
	tracks.push(createCameraTrack(movie));
	const dialogueTrack = createDialogueTrack(movie);
	if (dialogueTrack.clips.length) tracks.push(dialogueTrack);
	return {
		version: 1,
		name: movie.title,
		duration: movie.duration,
		fps: movie.fps,
		resolution: resolutionFor(movie.aspectRatio),
		seed: movie.seed,
		render: { format: "webm", includeAudio: true },
		tracks
	};
}

function createSceneTrack(movie) {
	return {
		type: "scene",
		clips: movie.scenes.map(function toSceneClip(scene) {
			return {
				start: scene.start,
				duration: scene.duration,
				id: scene.id,
				grade: structuredClone(scene.background?.grade || {}),
				transition: scene.transition?.type || "cut",
				visibility: structuredClone(scene.world?.visibility || {})
			};
		})
	};
}

function createActorTracks(movie) {
	const actors = new Map();
	for (const scene of movie.scenes) {
		for (const entity of scene.entities || []) {
			if (entity.type !== "character") continue;
			const target = entity.target || "player";
			if (!actors.has(target)) actors.set(target, []);
			const actions = entity.actions?.length ? entity.actions : defaultActorActions(entity, scene);
			actors.get(target).push(...actions.map(function shiftAction(action) {
				return { ...structuredClone(action), start: scene.start + (Number(action.start) || 0) };
			}));
		}
	}
	return [...actors.entries()].map(function toActorTrack(entry) {
		return { type: "actor", target: entry[0], clips: entry[1] };
	});
}

function defaultActorActions(entity, scene) {
	return [{
		start: 0,
		duration: scene.duration,
		action: entity.action || "pose",
		animation: entity.animation || "idle",
		at: structuredClone(entity.position || { x: 0, y: 0, z: 0 })
	}];
}

function createCameraTrack(movie) {
	const clips = [];
	for (const scene of movie.scenes) {
		const shots = scene.camera?.shots || [scene.camera || {}];
		const shotDuration = scene.duration / Math.max(1, shots.length);
		shots.forEach(function addShot(shot, index) {
			clips.push({
				start: scene.start + index * shotDuration,
				duration: shotDuration,
				shot: shot.shot || scene.camera?.shot || "wide",
				position: structuredClone(shot.position || { x: 0, y: 4, z: 8 }),
				target: structuredClone(shot.target || { x: 0, y: 1.5, z: 0 }),
				easing: shot.easing || "easeInOutCubic"
			});
		});
	}
	return { type: "camera", clips };
}

function createDialogueTrack(movie) {
	const clips = [];
	for (const scene of movie.scenes) {
		for (const entity of scene.entities || []) {
			if (entity.type !== "text" || entity.role !== "dialogue") continue;
			clips.push({
				start: scene.start + (Number(entity.offset) || 0),
				duration: Number(entity.duration) || Math.min(5, scene.duration),
				speaker: entity.speaker || "Narrator",
				text: String(entity.text || "")
			});
		}
	}
	return { type: "dialogue", clips };
}

function resolutionFor(aspectRatio) {
	if (aspectRatio === "9:16") return { width: 540, height: 960 };
	if (aspectRatio === "1:1") return { width: 720, height: 720 };
	return { width: 960, height: 540 };
}

function assertMovie(movie) {
	const report = validateMovieDocument(movie);
	if (!report.ok) throw new Error(report.errors.join(" "));
}
