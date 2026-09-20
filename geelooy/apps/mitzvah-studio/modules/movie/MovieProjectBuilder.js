// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectBuilder.js
 * @description Pure builder that turns studio shots into a Mitzvah World movie-project document.
 * Every camera preset is computed with real geometry from the target object's studio position,
 * and every generated project is validated against the movie-project schema contract before return.
 */

/** Canonical schema id for the movie-project contract. */
export const MOVIE_SCHEMA_ID = '/games/mitzvahWorld/movies/movie-project.schema.json';

/** Base route of the game's movie maker; projects travel as base64url JSON in the `movie` param. */
export const MOVIE_MODE_ROUTE = '/games/mitzvahWorld/?mode=movie';

export const MOVIE_VERSION = 1;
export const MOVIE_FPS = 24;
export const MOVIE_RESOLUTION = Object.freeze({ width: 960, height: 540 });
export const MOVIE_SEED = 613;
export const MOVIE_RENDER_BITRATE = 4200000;

/**
 * Camera presets. Each carries the easing used for its move and the mood grade
 * painted on the scene track while the shot plays.
 */
export const CAMERA_PRESETS = Object.freeze([
	Object.freeze({ id: 'static', label: 'Static', description: 'Fixed wide frame that holds on the target.', easing: 'linear', grade: '#9eb8ff' }),
	Object.freeze({ id: 'dolly', label: 'Dolly', description: 'Glides forward while tracking the player.', easing: 'easeInOutCubic', grade: '#8fd6b4' }),
	Object.freeze({ id: 'crane', label: 'Crane', description: 'Rises overhead while tracking the player.', easing: 'easeInOutQuad', grade: '#ffd27d' }),
	Object.freeze({ id: 'orbit', label: 'Orbit', description: 'Sweeps a 120 degree arc around the target.', easing: 'easeInOutQuad', grade: '#c9a7ff' }),
	Object.freeze({ id: 'closeup', label: 'Close-up', description: 'Tight frame on the target with a slow push-in.', easing: 'smootherstep', grade: '#ffb3a7' })
]);

export const PRESET_IDS = Object.freeze(CAMERA_PRESETS.map((preset) => preset.id));

const TRACK_TYPES = Object.freeze(['scene', 'actor', 'door', 'camera', 'dialogue', 'audio', 'event', 'sequence', 'material', 'crowd']);
const CLIP_ACTIONS = Object.freeze(['move', 'pose', 'talk', 'jump', 'walk', 'run', 'stand', 'fight', 'pray', 'celebrate', 'wave', 'greet']);
const AUDIO_KINDS = Object.freeze(['score', 'speechTone', 'door', 'jump', 'wind', 'water', 'forest', 'hearth', 'pulse', 'shimmer']);
const EASINGS = Object.freeze(['linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad', 'easeInOutCubic', 'smoothstep', 'smootherstep']);
const TRANSITIONS = Object.freeze(['cut', 'fade', 'crossfade']);
const ACTOR_IDS = Object.freeze(['player', 'npc']);

/**
 * @typedef {object} StudioShot
 * @property {string} id Stable shot id.
 * @property {string} title Shot title shown on the scene track and timeline.
 * @property {string} preset One of the CAMERA_PRESETS ids.
 * @property {number} durationSec Shot length in seconds, must be > 0.
 * @property {string} targetLabel Label of the studio document object the shot is aimed at.
 * @property {{speaker: string, text: string}} [dialogue] Optional timed subtitle line.
 * @property {number} [cameraOffset] Multiplier for the camera distance, default 1.
 */

/**
 * @typedef {object} StudioDocumentLike
 * @property {string} [name] Document name, used as the fallback movie title.
 * @property {Array<{label: string, position: {x: number, y: number, z: number}}>} objects
 */

function round2(value) {
	return Math.round(value * 100) / 100;
}

function isPoint(value) {
	return Boolean(value) && typeof value === 'object' &&
		Number.isFinite(Number(value.x)) && Number.isFinite(Number(value.y)) && Number.isFinite(Number(value.z));
}

function point(x, y, z) {
	return { x: round2(x), y: round2(y), z: round2(z) };
}

/** Aim point at the target's chest. */
function aimPoint(pos) {
	return point(pos.x, pos.y + 1.2, pos.z);
}

/** Aim point at the target's face for close-ups. */
function facePoint(pos) {
	return point(pos.x, pos.y + 1.6, pos.z);
}

/** Ground point offset from the target, for actor placement. */
function groundPoint(pos, dx, dz) {
	return point(pos.x + dx, pos.y, pos.z + dz);
}

function presetById(presetId) {
	return CAMERA_PRESETS.find((preset) => preset.id === presetId) || null;
}

function clampOffset(value) {
	const offset = Number(value);
	if (!Number.isFinite(offset)) return 1;
	return Math.min(3, Math.max(0.25, offset));
}

function slugify(text) {
	return String(text || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60) || 'movie';
}

/**
 * Computes one camera clip for a preset. Positions are derived from the target
 * object's studio position; `targetActor: 'player'` keeps moving shots glued
 * to the chossid as he walks.
 * @param {string} presetId
 * @param {number} start
 * @param {number} duration
 * @param {{x: number, y: number, z: number}} targetPos
 * @param {number} cameraOffset
 * @returns {object} Schema-valid camera clip.
 */
function buildCameraClip(presetId, start, duration, targetPos, cameraOffset) {
	const preset = presetById(presetId);
	if (!preset) {
		throw new Error(`Unknown camera preset "${presetId}". Expected one of: ${PRESET_IDS.join(', ')}.`);
	}
	const k = clampOffset(cameraOffset);
	const aim = aimPoint(targetPos);
	const face = facePoint(targetPos);
	const shot = preset.id;
	const easing = preset.easing;
	switch (preset.id) {
		case 'static': {
			// Fixed wide frame: from and to are identical, so the camera never moves.
			const pos = point(aim.x + 12 * k, aim.y + 7, aim.z + 12 * k);
			return { start, duration, shot, from: { position: pos, target: aim }, to: { position: pos, target: aim }, easing };
		}
		case 'dolly': {
			// Glide from wide to medium while tracking the player.
			const from = { position: point(aim.x + 14 * k, aim.y + 5, aim.z + 6 * k), targetActor: 'player' };
			const to = { position: point(aim.x + 7 * k, aim.y + 2.5, aim.z + 7 * k), targetActor: 'player' };
			return { start, duration, shot, from, to, easing };
		}
		case 'crane': {
			// Start low near the action, rise overhead while tracking the player.
			const from = { position: point(aim.x + 9 * k, aim.y + 2, aim.z + 9 * k), targetActor: 'player' };
			const to = { position: point(aim.x + 7 * k, aim.y + 11, aim.z + 7 * k), targetActor: 'player' };
			return { start, duration, shot, from, to, easing };
		}
		case 'orbit': {
			// Sweep a 120 degree arc around the target at a fixed radius and height.
			const radius = 11 * k;
			const sweep = (Math.PI * 2) / 3;
			const from = { position: point(aim.x + radius, aim.y + 3.5, aim.z), target: aim };
			const to = {
				position: point(aim.x + radius * Math.cos(sweep), aim.y + 3.5, aim.z + radius * Math.sin(sweep)),
				target: aim
			};
			return { start, duration, shot, from, to, easing };
		}
		case 'closeup': {
			// Tight on the target's face with a slow push-in.
			const from = { position: point(face.x + 3.4 * k, face.y + 0.8, face.z + 3.4 * k), target: face };
			const to = { position: point(face.x + 2.4 * k, face.y + 0.4, face.z + 2.4 * k), target: face };
			return { start, duration, shot, from, to, easing };
		}
		default:
			throw new Error(`Camera preset "${presetId}" has no geometry.`);
	}
}

/**
 * Maps dialogue speakers to actor roles. The first distinct non-narrator
 * speaker is the player (the chossid); the second brings in the npc.
 * Narrator lines are voiceover and map to no actor.
 * @param {StudioShot[]} shots
 * @returns {Record<string, 'player' | 'npc' | 'narrator'>}
 */
function mapSpeakers(shots) {
	const order = [];
	const roles = {};
	for (const shot of shots) {
		const name = String((shot.dialogue && shot.dialogue.speaker) || '').trim();
		if (!name) continue;
		if (name.toLowerCase() === 'narrator') {
			roles[name] = 'narrator';
			continue;
		}
		if (!Object.prototype.hasOwnProperty.call(roles, name)) {
			roles[name] = order.length === 0 ? 'player' : 'npc';
			order.push(name);
		}
	}
	return roles;
}

function resolveTarget(objects, shot) {
	const wanted = String(shot.targetLabel || '').trim();
	const exact = objects.find((object) => String(object.label) === wanted);
	if (exact) return exact;
	const lowered = wanted.toLowerCase();
	const fuzzy = objects.find((object) => String(object.label).toLowerCase() === lowered);
	if (fuzzy) return fuzzy;
	const available = objects.map((object) => `"${object.label}"`).join(', ') || '(none)';
	throw new Error(`Shot "${shot.id}" targets unknown label "${shot.targetLabel}". Available studio object labels: ${available}.`);
}

function dialogueCueTiming(shotStart, shotDuration, text) {
	const words = String(text).trim().split(/\s+/).filter(Boolean).length;
	const cueStart = round2(shotStart + 0.2);
	const cueDuration = round2(Math.max(0.5, Math.min(shotDuration - 0.5, Math.max(1.2, words * 0.45))));
	return { cueStart, cueDuration };
}

function base64UrlEncode(text) {
	const base64 = btoa(unescape(encodeURIComponent(text)));
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Builds the exact movie-maker URL for a project.
 * @param {object} project Validated movie-project document.
 * @param {boolean} autoRender When true, appends `&autoRender=1` so rendering starts on load.
 * @returns {string} `/games/mitzvahWorld/?mode=movie&movie=<base64url>[&autoRender=1]`
 */
export function movieMakerUrl(project, autoRender) {
	const encoded = base64UrlEncode(JSON.stringify(project));
	return `${MOVIE_MODE_ROUTE}&movie=${encoded}${autoRender ? '&autoRender=1' : ''}`;
}

/**
 * Validates a movie-project document against the schema contract.
 * @param {object} project Candidate project.
 * @returns {string[]} Error messages; empty when the project is valid.
 */
export function validateMovieProject(project) {
	const errors = [];
	if (!project || typeof project !== 'object') return ['Project must be an object.'];
	if (typeof project.title !== 'string' || project.title.trim() === '') {
		errors.push('Missing required field "title" (non-empty string).');
	}
	if (typeof project.duration !== 'number' || !(project.duration > 0)) {
		errors.push('Missing required field "duration" (number greater than 0).');
	}
	if (!Array.isArray(project.tracks) || project.tracks.length < 1) {
		errors.push('Missing required field "tracks" (array with at least one track).');
		return errors;
	}
	project.tracks.forEach((track, trackIndex) => {
		const where = `tracks[${trackIndex}]`;
		if (!track || typeof track !== 'object') {
			errors.push(`${where}: track must be an object.`);
			return;
		}
		if (!TRACK_TYPES.includes(track.type)) {
			errors.push(`${where}: missing or invalid required field "type" (expected one of ${TRACK_TYPES.join(', ')}).`);
		}
		if (!Array.isArray(track.clips) || track.clips.length < 1) {
			errors.push(`${where}: missing required field "clips" (array with at least one clip).`);
			return;
		}
		track.clips.forEach((clip, clipIndex) => {
			const at = `${where}.clips[${clipIndex}]`;
			if (!clip || typeof clip !== 'object') {
				errors.push(`${at}: clip must be an object.`);
				return;
			}
			if (typeof clip.start !== 'number' || clip.start < 0) {
				errors.push(`${at}: missing required field "start" (number >= 0).`);
			}
			if (typeof clip.duration !== 'number' || !(clip.duration > 0)) {
				errors.push(`${at}: missing required field "duration" (number greater than 0).`);
			}
			if (typeof clip.start === 'number' && typeof clip.duration === 'number' && typeof project.duration === 'number') {
				if (clip.start + clip.duration > project.duration + 1e-6) {
					errors.push(`${at}: clip runs past the project duration (${project.duration}s).`);
				}
			}
			if (clip.easing !== undefined && !EASINGS.includes(clip.easing)) {
				errors.push(`${at}: invalid "easing" (expected one of ${EASINGS.join(', ')}).`);
			}
			if (track.type === 'camera') {
				if (typeof clip.shot !== 'string' || clip.shot === '') {
					errors.push(`${at}: camera clip is missing "shot" (string).`);
				}
				['from', 'to'].forEach((key) => {
					const endpoint = clip[key];
					if (endpoint === undefined) return;
					if (!endpoint || typeof endpoint !== 'object' || !isPoint(endpoint.position)) {
						errors.push(`${at}: camera "${key}" needs a "position" point {x, y, z}.`);
						return;
					}
					if (endpoint.target !== undefined && !isPoint(endpoint.target)) {
						errors.push(`${at}: camera "${key}" target must be a point {x, y, z}.`);
					}
					if (endpoint.targetActor !== undefined && !ACTOR_IDS.includes(endpoint.targetActor)) {
						errors.push(`${at}: camera "${key}" targetActor must be "player" or "npc".`);
					}
				});
			}
			if (track.type === 'actor' && clip.action !== undefined && !CLIP_ACTIONS.includes(clip.action)) {
				errors.push(`${at}: invalid "action" (expected one of ${CLIP_ACTIONS.join(', ')}).`);
			}
			if (track.type === 'dialogue') {
				if (typeof clip.speaker !== 'string' || typeof clip.text !== 'string') {
					errors.push(`${at}: dialogue clip needs string "speaker" and "text".`);
				}
			}
			if (track.type === 'audio') {
				if (clip.kind !== undefined && !AUDIO_KINDS.includes(clip.kind)) {
					errors.push(`${at}: invalid "kind" (expected one of ${AUDIO_KINDS.join(', ')}).`);
				}
				if (clip.volume !== undefined && (typeof clip.volume !== 'number' || clip.volume < 0 || clip.volume > 1)) {
					errors.push(`${at}: "volume" must be a number between 0 and 1.`);
				}
			}
			if (track.type === 'scene' && clip.transition !== undefined && !TRANSITIONS.includes(clip.transition)) {
				errors.push(`${at}: invalid "transition" (expected one of ${TRANSITIONS.join(', ')}).`);
			}
		});
	});
	return errors;
}

/**
 * Builds a schema-valid movie-project document from studio shots.
 * @param {StudioDocumentLike} studioDocument Portable studio document with labeled objects.
 * @param {StudioShot[]} shots Ordered shot list.
 * @param {{title?: string}} [options] Optional overrides; title falls back to the document name.
 * @returns {object} Movie-project document ready for the movie maker.
 * @throws {Error} Naming the first problem found, so the panel can show it.
 */
export function buildMovieProject(studioDocument, shots, options = {}) {
	if (!studioDocument || !Array.isArray(studioDocument.objects)) {
		throw new Error('buildMovieProject: studioDocument must be a portable studio document with an "objects" array.');
	}
	if (studioDocument.objects.length === 0) {
		throw new Error('buildMovieProject: the studio document has no objects. Place at least one object in the studio to aim a shot at.');
	}
	if (!Array.isArray(shots) || shots.length === 0) {
		throw new Error('buildMovieProject: shots must be a non-empty array. Add at least one shot.');
	}

	const title = String((options && options.title) || studioDocument.name || '').trim() || 'Untitled Mitzvah Movie';

	const speakerRoles = mapSpeakers(shots);
	const hasNpc = Object.values(speakerRoles).includes('npc');

	const sceneClips = [];
	const cameraClips = [];
	const playerClips = [];
	const npcClips = [];
	const dialogueClips = [];
	const audioClips = [];

	let cursor = 0;
	shots.forEach((shot, index) => {
		if (!shot || typeof shot !== 'object') {
			throw new Error(`buildMovieProject: shot at index ${index} must be an object.`);
		}
		const shotId = String(shot.id || `shot-${index + 1}`);
		const shotTitle = String(shot.title || shotId).trim() || shotId;
		const duration = Number(shot.durationSec);
		if (!Number.isFinite(duration) || !(duration > 0)) {
			throw new Error(`buildMovieProject: shot "${shotId}" needs durationSec greater than 0.`);
		}
		if (!PRESET_IDS.includes(shot.preset)) {
			throw new Error(`buildMovieProject: shot "${shotId}" has unknown preset "${shot.preset}". Expected one of: ${PRESET_IDS.join(', ')}.`);
		}
		const targetObject = resolveTarget(studioDocument.objects, shot);
		const targetPos = {
			x: Number(targetObject.position.x),
			y: Number(targetObject.position.y),
			z: Number(targetObject.position.z)
		};
		if (!Number.isFinite(targetPos.x) || !Number.isFinite(targetPos.y) || !Number.isFinite(targetPos.z)) {
			throw new Error(`buildMovieProject: target object "${targetObject.label}" has no numeric position.`);
		}

		const start = round2(cursor);
		const shotDuration = round2(duration);
		const preset = presetById(shot.preset);
		const dialogue = shot.dialogue || {};
		const speaker = String(dialogue.speaker || '').trim();
		const text = String(dialogue.text || '').trim();
		const role = speaker ? (speakerRoles[speaker] || 'narrator') : null;

		// Scene: title card on the first shot, shot titles after; mood grade per preset.
		sceneClips.push({
			id: `${shotId}-scene`,
			start,
			duration: shotDuration,
			label: index === 0 ? title : shotTitle,
			grade: preset.grade,
			transition: index === 0 ? 'fade' : 'cut'
		});

		// Camera: eased position/target keyframes computed from the target position.
		const cameraClip = buildCameraClip(shot.preset, start, shotDuration, targetPos, shot.cameraOffset);
		cameraClip.id = `${shotId}-camera`;
		cameraClips.push(cameraClip);

		// Player (the chossid): walks into frame, then talks or stands with the shot.
		const walkDuration = round2(Math.min(shotDuration * 0.35, 2.5));
		const restDuration = round2(shotDuration - walkDuration);
		const playerSpot = groundPoint(targetPos, -1.5, -1.5);
		playerClips.push({
			id: `${shotId}-player-enter`,
			start,
			duration: walkDuration,
			action: 'move',
			animation: 'walk',
			from: groundPoint(targetPos, -4, -4),
			to: playerSpot,
			easing: 'easeInOutQuad'
		});
		if (restDuration > 0.05) {
			const playerTalks = role === 'player' && text !== '';
			playerClips.push({
				id: `${shotId}-player-act`,
				start: round2(start + walkDuration),
				duration: restDuration,
				action: playerTalks ? 'talk' : 'pose',
				animation: playerTalks ? 'talk' : 'idle',
				at: playerSpot,
				...(hasNpc ? { face: 'npc' } : {})
			});
		}

		// NPC: present when dialogue has two speakers; talks on its own lines.
		if (hasNpc) {
			const npcTalks = role === 'npc' && text !== '';
			npcClips.push({
				id: `${shotId}-npc`,
				start,
				duration: shotDuration,
				action: npcTalks ? 'talk' : 'pose',
				animation: npcTalks ? 'talk' : 'idle',
				at: groundPoint(targetPos, 1.8, 1.8),
				face: 'player'
			});
		}

		// Dialogue: timed subtitle cue, sized to the line length.
		if (text !== '') {
			const { cueStart, cueDuration } = dialogueCueTiming(start, shotDuration, text);
			dialogueClips.push({
				id: `${shotId}-line`,
				start: cueStart,
				duration: cueDuration,
				speaker: speaker === '' ? 'Narrator' : speaker,
				text
			});
			audioClips.push({
				id: `${shotId}-tone`,
				start: cueStart,
				duration: cueDuration,
				kind: 'speechTone',
				frequency: role === 'npc' ? 170 : 205,
				volume: 0.09
			});
		}

		cursor = round2(start + shotDuration);
	});

	const totalDuration = round2(cursor);

	const tracks = [
		{ id: 'scene', type: 'scene', clips: sceneClips },
		{ id: 'player-performance', type: 'actor', target: 'player', clips: playerClips },
		{ id: 'camera-cuts', type: 'camera', clips: cameraClips }
	];
	if (hasNpc) {
		tracks.push({ id: 'npc-performance', type: 'actor', target: 'npc', clips: npcClips });
	}
	if (dialogueClips.length > 0) {
		tracks.push({ id: 'dialogue', type: 'dialogue', clips: dialogueClips });
	}
	audioClips.push({
		id: 'score',
		start: 0,
		duration: totalDuration,
		kind: 'score',
		frequency: 110,
		volume: 0.045
	});
	tracks.push({ id: 'audio', type: 'audio', clips: audioClips });

	const project = {
		version: MOVIE_VERSION,
		title,
		duration: totalDuration,
		fps: MOVIE_FPS,
		resolution: { width: MOVIE_RESOLUTION.width, height: MOVIE_RESOLUTION.height },
		seed: MOVIE_SEED,
		render: {
			fileName: `${slugify(title)}.webm`,
			videoBitsPerSecond: MOVIE_RENDER_BITRATE
		},
		viewMode: 'legacy',
		tracks
	};

	const errors = validateMovieProject(project);
	if (errors.length > 0) {
		throw new Error(`buildMovieProject: generated project failed validation: ${errors.join(' ')}`);
	}
	return project;
}
