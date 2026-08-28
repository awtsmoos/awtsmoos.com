//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalFfmpegExportSupport.js
 * @description The Awtsmoos separates preparation from orchestration so each light enters a fitting vessel;
 * Awtsmoos.com resolves profile, duration, clipped audio intent, final evidence, and manifest without owning frame transport.
 */
import {
	malchusRenderProfile,
	yesodCreateRenderManifest
} from '../../../../../shared/movie/index.js';

/**
 * Resolves ffmpeg export geometry and quality through the shared render-profile covenant.
 * @param {object} orMovie Canonical movie whose native format supplies defaults.
 * @param {object} orOptions Explicit export overrides.
 * @returns {object} Shared render profile.
 */
export function yesodFfmpegExportProfile(orMovie, orOptions = {}) {
	return malchusRenderProfile(orOptions.profileId || 'preview', {
		width: Number(orOptions.width || orMovie.format?.width || 640),
		height: Number(orOptions.height || orMovie.format?.height || 360),
		fps: Number(orOptions.fps || orMovie.format?.fps || 12),
		quality: Number(orOptions.quality || 0.72)
	});
}

/**
 * Constrains a requested browser export duration to the canonical plan duration.
 * @param {number|undefined} orRequested Requested milliseconds.
 * @param {number} orFallback Full canonical plan milliseconds.
 * @returns {number} Positive bounded milliseconds.
 * @throws {Error} When the supplied duration is non-finite or non-positive.
 */
export function gevurahFfmpegDuration(orRequested, orFallback) {
	const yesodDuration = Number(orRequested ?? orFallback);
	if (!Number.isFinite(yesodDuration) || yesodDuration <= 0) {
		throw new Error('ffmpeg export duration must be a positive finite millisecond value.');
	}
	return Math.min(yesodDuration, Number(orFallback));
}

/**
 * Creates the audio-facing plan bounded to the requested export window.
 * @param {object} orPlan Full Animator millisecond export plan.
 * @param {number} orDurationMs Bounded export duration in milliseconds.
 * @returns {object} Cloned plan appropriate for soundtrack rendering.
 */
export function binahClippedFfmpegPlan(orPlan, orDurationMs) {
	return {
		...structuredClone(orPlan),
		duration: orDurationMs,
		dialogue: (orPlan.dialogue || []).filter((orLine) => {
			return orLine.start < orDurationMs;
		})
	};
}

/**
 * Fetches the native evidence file back through the no-cache proof server.
 * @param {string} orPublicPath Server-returned proof path beneath Geelooy.
 * @param {object} orOptions Fetch/proof-origin overrides.
 * @returns {Promise<Blob>} Final MP4 Blob for page compatibility and inspection.
 * @throws {Error} When the evidence server does not return HTTP success.
 */
export async function malchusFetchFfmpegEvidence(orPublicPath, orOptions = {}) {
	const keterUrl = new URL(
		orPublicPath,
		orOptions.proofOrigin || globalThis.location?.href || 'http://127.0.0.1:8768/'
	);
	const yesodFetch = orOptions.fetch || globalThis.fetch;
	const keterResponse = await yesodFetch(keterUrl, {
		cache: 'no-store'
	});
	if (!keterResponse.ok) {
		throw new Error(`Final ffmpeg evidence fetch failed with HTTP ${keterResponse.status}.`);
	}
	return keterResponse.blob();
}

/**
 * Harmonizes native ffmpeg evidence with the established browser-export result envelope.
 * @param {object} orContext Canonical movie, projection, profile, audio, native result, blob, and timing.
 * @returns {object} Stable export result consumed by the canonical proof page.
 */
export function tiferesFfmpegExportResult(orContext) {
	const {
		movie,
		projection,
		profile,
		audio,
		nativeResult,
		blob,
		durationSeconds,
		frameCount
	} = orContext;
	return {
		blob,
		fileName: nativeResult.fileName,
		durationSeconds,
		frameCount,
		voiceClips: audio.voices,
		codecPath: nativeResult.backend,
		capabilities: {
			backend: nativeResult.backend,
			probe: nativeResult.probe
		},
		manifest: yesodCreateRenderManifest(
			movie,
			{ id: 'animator-canonical-native-ffmpeg' },
			profile
		),
		canonicalMovie: structuredClone(movie),
		adapterReport: structuredClone(projection.report),
		nativeResult
	};
}
