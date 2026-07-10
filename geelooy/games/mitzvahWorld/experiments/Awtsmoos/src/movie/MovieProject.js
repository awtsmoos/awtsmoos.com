// B"H
/**
 * @file MovieProject.js
 * @description Parses, normalizes, validates, and URL-encodes AI-authored movie JSON.
 */
const DEFAULT_RESOLUTION = Object.freeze({ width: 960, height: 540 });

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}

function parseJson(text, label) {
	try {
		return JSON.parse(text);
	} catch (error) {
		throw new Error(`${label} is not valid JSON: ${error.message}`);
	}
}

function decodeBase64Url(value) {
	const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
	if (typeof atob === 'function') {
		return decodeURIComponent(escape(atob(padded)));
	}
	return Buffer.from(padded, 'base64').toString('utf8');
}

function encodeBase64Url(value) {
	const base64 = typeof btoa === 'function'
		? btoa(unescape(encodeURIComponent(value)))
		: Buffer.from(value, 'utf8').toString('base64');
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function normalizeMovieProject(source) {
	const project = clone(source || {});
	project.version = Number(project.version || 1);
	project.title = String(project.title || 'Untitled Awtsmoos Movie');
	project.duration = Math.max(.1, Number(project.duration || 30));
	project.fps = Math.max(8, Math.min(60, Number(project.fps || 24)));
	project.resolution = { ...DEFAULT_RESOLUTION, ...(project.resolution || {}) };
	project.seed = Number(project.seed || 613);
	project.tracks = Array.isArray(project.tracks) ? project.tracks : [];
	for (const [trackIndex, track] of project.tracks.entries()) {
		track.id = String(track.id || `${track.type || 'track'}-${trackIndex + 1}`);
		track.type = String(track.type || 'event');
		track.target = track.target == null ? null : String(track.target);
		track.clips = Array.isArray(track.clips) ? track.clips : [];
		for (const [clipIndex, clip] of track.clips.entries()) {
			clip.id = String(clip.id || `${track.id}-clip-${clipIndex + 1}`);
			clip.start = Math.max(0, Number(clip.start || 0));
			clip.duration = Math.max(.001, Number(clip.duration || .001));
			clip.easing = String(clip.easing || 'linear');
		}
	}
	return project;
}

export function validateMovieProject(project) {
	const issues = [];
	if (!project.tracks.length) issues.push('Project has no timeline tracks.');
	if (!Number.isFinite(project.duration)) issues.push('Duration must be finite.');
	for (const track of project.tracks) {
		if (!track.clips.length) issues.push(`${track.id} has no clips.`);
		for (const clip of track.clips) {
			if (clip.start + clip.duration > project.duration + .001) {
				issues.push(`${clip.id} extends beyond project duration.`);
			}
		}
	}
	return { ok: issues.length === 0, issues };
}

export function encodeMovieProject(project) {
	return encodeBase64Url(JSON.stringify(normalizeMovieProject(project)));
}

export function hasMovieRequest(search = '') {
	const params = new URLSearchParams(search);
	return params.get('mode') === 'movie'
		|| params.has('movie')
		|| params.has('movieJson')
		|| params.has('movieUrl');
}

export async function loadRequestedMovie(search = '', fetcher = globalThis.fetch) {
	const params = new URLSearchParams(search);
	if (params.has('movieJson')) {
		return normalizeMovieProject(parseJson(params.get('movieJson'), 'movieJson'));
	}
	if (params.has('movieUrl')) {
		const response = await fetcher(params.get('movieUrl'));
		if (!response.ok) throw new Error(`Movie URL failed with HTTP ${response.status}.`);
		return normalizeMovieProject(await response.json());
	}
	const movie = params.get('movie');
	if (movie && movie !== 'sample30') {
		return normalizeMovieProject(parseJson(decodeBase64Url(movie), 'movie'));
	}
	const sampleUrl = '/games/mitzvahWorld/movies/projects/chossid-journey-30s.json';
	const response = await fetcher(sampleUrl);
	if (!response.ok) throw new Error(`Sample movie failed with HTTP ${response.status}.`);
	return normalizeMovieProject(await response.json());
}
