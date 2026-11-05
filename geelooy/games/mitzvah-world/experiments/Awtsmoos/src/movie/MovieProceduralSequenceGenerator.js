// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProceduralSequenceGenerator.js
 * @description Generates complete cinematic movies procedurally from a compact
 * script, using only the game's real systems: terrain/region worlds, the chossid
 * character, sky time-of-day palettes, camera rigs, actor blocking, dialogue,
 * and ambience. Takes { title, mood, shots } or auto-generates a shot list from
 * a named theme, and compiles it through the existing studio pipeline
 * (agent manifest -> MovieAgentCompiler -> movie-project.schema.json) into a
 * project the live WebGL studio can play, record, and export.
 * Everything is procedural WebGL; no pre-rendered video, no AI imagery.
 */

import {
	MOVIE_AGENT_MANIFEST_KIND,
	MOVIE_AGENT_MANIFEST_VERSION
} from './MovieApiConstants.js';
import { compileMovieAgentManifest } from './MovieAgentCompiler.js';
import { compileMovieWorldJson } from './MovieWorldJsonCompiler.js';
import { createMovieProceduralRandom } from './MovieProceduralSeed.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { addMovieSimpleParticles } from './MovieSimpleParticles.js';

/**
 * Cinematic mood recipes. timeOfDay uses the game's sky vocabulary
 * (SKY_TIME_OF_DAY: day | sunrise | night) so the sky renderer consumes it
 * directly; grade tints the scene composite; ambienceKind is a schema-valid
 * audio kind; rigs are MovieCameraRigCompiler preset names.
 */
export const PROCEDURAL_SEQUENCE_MOODS = Object.freeze({
	day: Object.freeze({
		timeOfDay: 'day',
		grade: '#fff5df',
		ambienceKind: 'wind',
		mood: 'hopeful',
		regionId: 'village-heart',
		rigs: Object.freeze(['craneReveal', 'dollyIn', 'sideTrack'])
	}),
	'sunrise-gold': Object.freeze({
		timeOfDay: 'sunrise',
		grade: '#ffd9a0',
		ambienceKind: 'wind',
		mood: 'hopeful',
		regionId: 'ridge-overlook',
		rigs: Object.freeze(['craneReveal', 'dollyIn', 'aerialPullback'])
	}),
	'night-fireflies': Object.freeze({
		timeOfDay: 'night',
		grade: '#c7d8ff',
		ambienceKind: 'forest',
		mood: 'wonder',
		regionId: 'forest-clearing',
		rigs: Object.freeze(['dollyIn', 'orbitLeft', 'sideTrack']),
		particles: 'fireflies'
	}),
	'forest-pool': Object.freeze({
		timeOfDay: 'day',
		grade: '#d8f0e0',
		ambienceKind: 'water',
		mood: 'peaceful',
		regionId: 'forest-pool',
		rigs: Object.freeze(['orbitRight', 'sideTrack', 'dollyIn']),
		water: true
	}),
	'oasis-night': Object.freeze({
		timeOfDay: 'night',
		grade: '#c7d8ff',
		ambienceKind: 'water',
		mood: 'wonder',
		regionId: 'desert-oasis',
		rigs: Object.freeze(['aerialPullback', 'orbitLeft', 'craneReveal']),
		water: true,
		particles: 'fireflies'
	})
});

/** Schema-valid actor actions the generator may block. */
const SEQUENCE_ACTOR_ACTIONS = Object.freeze([
	'move', 'pose', 'talk', 'jump', 'walk', 'run',
	'stand', 'fight', 'pray', 'celebrate', 'wave', 'greet'
]);

const DEFAULT_CHARACTERS = Object.freeze([
	Object.freeze({ id: 'chossid', name: 'The Chossid', role: 'protagonist' })
]);

/** Built-in theme templates: each shot becomes one cinematic scene. */
const SEQUENCE_THEMES = Object.freeze({
	'dream-hangout': Object.freeze({
		title: 'Dream Hangout',
		moods: Object.freeze(['night-fireflies', 'sunrise-gold', 'forest-pool', 'oasis-night']),
		shots: Object.freeze([
			Object.freeze({
				mood: 'night-fireflies',
				rig: 'dollyIn',
				duration: 16,
				label: 'Fireflies Night',
				actor: Object.freeze({ action: 'stand' }),
				dialogue: 'The night is full of lights, and every one of them is a promise.',
				audio: Object.freeze([
					{ kind: 'forest', volume: 0.22 },
					{ kind: 'hearth', volume: 0.14 }
				])
			}),
			Object.freeze({
				mood: 'sunrise-gold',
				rig: 'craneReveal',
				duration: 16,
				label: 'Sunrise Circle',
				actor: Object.freeze({ action: 'pray' }),
				dialogue: 'Modeh ani — I thank You for returning my soul to me this morning.',
				audio: Object.freeze([{ kind: 'wind', volume: 0.2 }])
			}),
			Object.freeze({
				mood: 'forest-pool',
				rig: 'orbitLeft',
				duration: 16,
				label: 'Forest Pool',
				actor: Object.freeze({ action: 'stand' }),
				dialogue: 'Still water shows the sky back to itself.',
				audio: Object.freeze([{ kind: 'water', volume: 0.25 }])
			}),
			Object.freeze({
				mood: 'oasis-night',
				rig: 'aerialPullback',
				duration: 16,
				label: 'Oasis Night',
				actor: Object.freeze({ action: 'wave' }),
				dialogue: 'Come and sit — there is room for everyone beside this water.',
				audio: Object.freeze([
					{ kind: 'water', volume: 0.2 },
					{ kind: 'forest', volume: 0.12 }
				])
			})
		])
	})
});

/**
 * Returns the default "Dream Hangout" compact script: four scenes matching the
 * four concept moods (fireflies night, sunrise circle, forest pool, oasis night).
 */
export function createDreamHangoutScript(overrides = {}) {
	const theme = SEQUENCE_THEMES['dream-hangout'];
	return {
		title: theme.title,
		theme: 'dream-hangout',
		seed: 20261011,
		fps: 24,
		resolution: { width: 1280, height: 720 },
		characters: theme.characters || [...DEFAULT_CHARACTERS],
		shots: theme.shots.map(shot => ({ ...shot, audio: shot.audio.map(entry => ({ ...entry })) })),
		...overrides
	};
}

/**
 * Compiles a compact sequence script into a valid movie-project.schema.json project.
 * @param {object} script { title, theme?, mood?, duration?, seed?, fps?, resolution?, characters?, shots? }
 *   A shot is { mood, rig?, duration?, label?, actor?: { action }, dialogue?: string | { speaker, text }, audio?: [{ kind, volume }] }.
 *   When `shots` is absent, a shot list is auto-generated from `theme` (or cycled moods).
 * @returns {{ project: object, manifest: object, script: object }} The compiled project plus its manifest and resolved script.
 */
export function generateProceduralMovieProject(script = {}) {
	const resolved = resolveSequenceScript(script);
	const manifest = buildSequenceManifest(resolved);
	const compiled = compileMovieAgentManifest(manifest);
	const project = attachSequenceParticles(compiled, resolved);
	return createMovieProjectSnapshot({ manifest, project, script: resolved });
}

/** Adds one deterministic particle graph per particle mood used (existing particle system, additive). */
function attachSequenceParticles(compiled, resolved) {
	const kinds = [];
	for (const shot of resolved.shots) {
		const kind = PROCEDURAL_SEQUENCE_MOODS[shot.mood]?.particles;
		if (kind && !kinds.includes(kind)) kinds.push(kind);
	}
	if (!kinds.length) return compiled;
	const project = JSON.parse(JSON.stringify(compiled));
	for (const kind of kinds) {
		addMovieSimpleParticles(project, kind, { seed: resolved.seed });
	}
	return createMovieProjectSnapshot(project);
}

/** Resolves a compact script into explicit shots, characters, and timing. */
function resolveSequenceScript(script) {
	const source = script && typeof script === 'object' ? script : {};
	const theme = SEQUENCE_THEMES[source.theme];
	const characters = normalizeCharacters(source.characters || theme?.characters);
	let shots = Array.isArray(source.shots) && source.shots.length
		? source.shots.map(normalizeShot)
		: autoShots(source, theme);
	const totalDuration = finitePositive(source.duration)
		|| shots.reduce((sum, shot) => sum + shot.duration, 0)
		|| 64;
	if (source.duration && !Array.isArray(source.shots)) {
		shots = distributeDuration(shots, source.duration);
	}
	return {
		title: String(source.title || theme?.title || 'Awtsmoos Procedural Movie'),
		theme: String(source.theme || ''),
		mood: String(source.mood || shots[0]?.mood || 'day'),
		duration: totalDuration,
		seed: finiteSeed(source.seed ?? 20261011),
		fps: source.fps === 60 ? 60 : 24,
		resolution: normalizeResolution(source.resolution),
		characters,
		shots
	};
}

function normalizeShot(shot, index) {
	const value = shot && typeof shot === 'object' ? shot : {};
	const mood = PROCEDURAL_SEQUENCE_MOODS[value.mood] ? value.mood : 'day';
	const recipe = PROCEDURAL_SEQUENCE_MOODS[mood];
	const rig = typeof value.rig === 'string' && value.rig ? value.rig : recipe.rigs[0];
	return {
		mood,
		rig,
		duration: finitePositive(value.duration) || 12,
		label: String(value.label || `Shot ${index + 1} — ${mood}`),
		actor: normalizeActor(value.actor),
		dialogue: normalizeDialogue(value.dialogue),
		audio: normalizeAudio(value.audio, recipe)
	};
}

function normalizeActor(actor) {
	if (!actor) return null;
	const action = SEQUENCE_ACTOR_ACTIONS.includes(actor.action) ? actor.action : 'stand';
	return { action };
}

function normalizeDialogue(dialogue) {
	if (!dialogue) return null;
	if (typeof dialogue === 'string') return { speaker: null, text: dialogue };
	return {
		speaker: typeof dialogue.speaker === 'string' ? dialogue.speaker : null,
		text: String(dialogue.text || '')
	};
}

function normalizeAudio(audio, recipe) {
	if (Array.isArray(audio) && audio.length) {
		return audio
			.filter(entry => entry && typeof entry.kind === 'string')
			.map(entry => ({
				kind: entry.kind,
				volume: Math.max(0, Math.min(1, Number(entry.volume) || 0.2))
			}));
	}
	return [{ kind: recipe.ambienceKind, volume: 0.2 }];
}

/** Auto-generates a deterministic shot list from a theme, or cycles moods by seed. */
function autoShots(source, theme) {
	if (theme) return theme.shots.map((shot, index) => normalizeShot(shot, index));
	const random = createMovieProceduralRandom(finiteSeed(source.seed ?? 20261011), 'sequence-shots');
	const moodNames = Object.keys(PROCEDURAL_SEQUENCE_MOODS);
	const count = Math.max(1, Math.min(8, Math.round((finitePositive(source.duration) || 48) / 12)));
	const shots = [];
	for (let index = 0; index < count; index += 1) {
		const mood = moodNames[Math.floor(random.between(0, moodNames.length)) % moodNames.length];
		const recipe = PROCEDURAL_SEQUENCE_MOODS[mood];
		shots.push(normalizeShot({
			mood,
			rig: recipe.rigs[index % recipe.rigs.length],
			label: `Scene ${index + 1} — ${mood}`,
			actor: { action: index % 2 ? 'stand' : 'walk' }
		}, index));
	}
	return distributeDuration(shots, finitePositive(source.duration) || count * 12);
}

function distributeDuration(shots, total) {
	const per = total / shots.length;
	return shots.map(shot => ({ ...shot, duration: Number(per.toFixed(3)) }));
}

function normalizeCharacters(characters) {
	const values = Array.isArray(characters) && characters.length ? characters : DEFAULT_CHARACTERS;
	return values.slice(0, 12).map((value, index) => {
		if (typeof value === 'string') {
			return { id: slug(value), name: value, role: index ? 'companion' : 'protagonist' };
		}
		return {
			id: String(value?.id || slug(value?.name) || `character-${index + 1}`),
			name: String(value?.name || `Character ${index + 1}`),
			role: String(value?.role || 'supporting')
		};
	});
}

function normalizeResolution(resolution) {
	const width = Number(resolution?.width);
	const height = Number(resolution?.height);
	return {
		width: Number.isFinite(width) && width > 0 ? Math.round(width) : 1280,
		height: Number.isFinite(height) && height > 0 ? Math.round(height) : 720
	};
}

function slug(value) {
	return String(value || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 48) || 'character';
}

function finiteSeed(value) {
	const number = Number(value);
	return (Number.isFinite(number) ? Math.floor(number) : 1) >>> 0 || 1;
}

function finitePositive(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : 0;
}

function buildSequenceManifest(resolved) {
	const random = createMovieProceduralRandom(resolved.seed, 'sequence-worlds');
	const protagonist = resolved.characters[0];
	let cursor = 0;
	const scenes = resolved.shots.map((shot, index) => {
		const recipe = PROCEDURAL_SEQUENCE_MOODS[shot.mood];
		const world = compileMovieWorldJson({
			regionId: recipe.regionId,
			label: shot.label,
			seed: finiteSeed(resolved.seed + index * 7919),
			atmosphere: {
				timeOfDay: recipe.timeOfDay,
				mood: recipe.mood,
				ambience: recipe.ambienceKind,
				weather: 'clear'
			},
			camera: { preferredRigs: [...recipe.rigs] },
			population: { crowd: 0 },
			...(recipe.water ? { water: { present: true } } : {}),
			...(recipe.particles ? { particles: { kind: recipe.particles } } : {})
		});
		const scene = {
			id: `shot-${index + 1}`,
			duration: shot.duration,
			start: Number(cursor.toFixed(3)),
			label: shot.label,
			grade: recipe.grade,
			transition: index === 0 ? 'fade' : 'crossfade',
			world,
			beats: buildShotBeats(shot, recipe, protagonist, `shot-${index + 1}`, random)
		};
		cursor += shot.duration;
		return scene;
	});
	return {
		kind: MOVIE_AGENT_MANIFEST_KIND,
		manifestVersion: MOVIE_AGENT_MANIFEST_VERSION,
		title: resolved.title,
		duration: Number(cursor.toFixed(3)),
		seed: resolved.seed,
		fps: resolved.fps,
		resolution: resolved.resolution,
		characters: resolved.characters,
		metadata: {
			generator: 'MovieProceduralSequenceGenerator',
			theme: resolved.theme,
			moods: resolved.shots.map(shot => shot.mood)
		},
		generation: {
			cinematic: false,
			engine: 'awtsmoos-procedural-sequence',
			plannerVersion: 1
		},
		scenes
	};
}

function buildShotBeats(shot, recipe, protagonist, sceneId, random) {
	const duration = shot.duration;
	const beats = [
		{
			type: 'camera',
			id: `${sceneId}-camera`,
			rig: shot.rig,
			duration
		}
	];
	if (shot.actor) {
		beats.push({
			type: 'actor',
			id: `${sceneId}-actor`,
			target: protagonist.id,
			action: shot.actor.action,
			duration: Number((duration * 0.7).toFixed(3)),
			offset: Number((duration * 0.15).toFixed(3))
		});
	}
	if (shot.dialogue && shot.dialogue.text) {
		beats.push({
			type: 'dialogue',
			id: `${sceneId}-dialogue`,
			speaker: shot.dialogue.speaker || protagonist.name,
			text: shot.dialogue.text,
			duration: Number(Math.min(duration * 0.5, 8).toFixed(3)),
			offset: Number(Math.min(1, duration * 0.15).toFixed(3))
		});
	}
	for (const [audioIndex, entry] of shot.audio.entries()) {
		beats.push({
			type: 'audio',
			id: `${sceneId}-audio-${audioIndex + 1}`,
			kind: entry.kind,
			volume: entry.volume,
			duration
		});
	}
	beats.push({
		type: 'event',
		id: `${sceneId}-event`,
		name: 'movie:procedural-sequence',
		duration: 0.001,
		offset: 0,
		payload: {
			mood: shot.mood,
			rig: shot.rig,
			seed: random.seed
		}
	});
	return beats;
}

/**
 * Generates a sequence and applies its agent manifest through a live cinema
 * domain (MovieStudioApiCinema*), returning the cinema apply receipt plus the
 * generated artifacts. This is the studio-runtime wiring: the cinema domain
 * compiles the manifest, installs the project on the session, and the session
 * director + MovieRecorder own playback and WebM export.
 * @param {object} cinemaDomain The createMovieStudioCinemaDomain() cinema domain.
 * @param {object} [script] Compact sequence script (see generateProceduralMovieProject).
 * @param {object} [options] Cinema apply options.
 */
export function applyProceduralMovieToCinema(cinemaDomain, script = {}, options = {}) {
	if (!cinemaDomain || typeof cinemaDomain.apply !== 'function') {
		throw new TypeError('applyProceduralMovieToCinema requires a live cinema domain.');
	}
	const generated = generateProceduralMovieProject(script);
	return createMovieProjectSnapshot({
		...generated,
		applied: cinemaDomain.apply(generated.manifest, options)
	});
}

/**
 * Installs a generated project into a live studio session for playback and export.
 * @param {object} session MovieStudioSession public API (installProject).
 * @param {object} project Compiled movie-project.schema.json project.
 * @returns {object} The install receipt from the session.
 */
export function installProceduralMovieProject(session, project) {
	if (!session || typeof session.installProject !== 'function') {
		throw new TypeError('installProceduralMovieProject requires a live studio session.');
	}
	return session.installProject(project, { reason: 'Procedural sequence generated' });
}

/**
 * Renders the installed project through the live WebGL canvas and exports WebM
 * via canvas.captureStream + MediaRecorder (the studio's MovieRecorder path).
 * When MediaRecorder or canvas.captureStream is unavailable, it degrades
 * gracefully: the project still plays live for preview and a structured
 * receipt explains the fallback instead of throwing.
 * @param {object} session MovieStudioSession public API (render/play/director).
 * @param {object} [options] { download, onProgress, onComplete }
 * @returns {Promise<object>} Render result, or a fallback receipt.
 */
export async function renderProceduralMovieProject(session, options = {}) {
	const canvas = session?.director?.overlay?.canvas;
	const captureStreamAvailable = typeof canvas?.captureStream === 'function';
	const mediaRecorderAvailable = typeof globalThis.MediaRecorder === 'function';
	if (!captureStreamAvailable || !mediaRecorderAvailable) {
		let previewStarted = false;
		try {
			if (typeof session?.play === 'function') {
				session.play();
				previewStarted = true;
			}
		} catch { /* preview is best-effort */ }
		return createMovieProjectSnapshot({
			recorded: false,
			previewStarted,
			reason: !mediaRecorderAvailable
				? 'media-recorder-unavailable'
				: 'canvas-capture-stream-unavailable',
			fallback: 'live-preview'
		});
	}
	return session.render();
}

export default generateProceduralMovieProject;
