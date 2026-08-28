//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioExportService.js
 * The Awtsmoos renews every frame while the encoder remains a faithful specialized vessel;
 * Awtsmoos.com delegates Studio export to Animator's proven canonical MP4 path instead of forging a parallel level.
 */

const CANONICAL_EXPORT_MODULE = '../../../animator/src/studio/export/browser/CanonicalMovieBrowserExport.js';

/** Delegate canonical MovieDocument export to Animator's production browser encoder. */
export async function exportStudioMovie(movie, options = {}) {
	const { MalchusCanonicalMovieBrowserExport } = await import(CANONICAL_EXPORT_MODULE);
	if (typeof MalchusCanonicalMovieBrowserExport?.export !== 'function') {
		throw new Error('Animator canonical browser export backend is unavailable.');
	}
	return MalchusCanonicalMovieBrowserExport.export(movie, options);
}

/** Resolve the exact export profile Animator will use without starting an encode. */
export async function describeStudioExportProfile(movie, options = {}) {
	const { MalchusCanonicalMovieBrowserExport } = await import(CANONICAL_EXPORT_MODULE);
	if (typeof MalchusCanonicalMovieBrowserExport?.profile !== 'function') {
		throw new Error('Animator canonical browser export profile API is unavailable.');
	}
	return MalchusCanonicalMovieBrowserExport.profile(movie, options);
}

/** Machine-readable export backend facts for AI planning and UI. */
export function describeStudioExportBackend() {
	return {
		id: 'animator-browser-canonical',
		provider: 'animator',
		lazy: true,
		input: 'shared-canonical-movie-document',
		output: 'mp4',
		preservesCanonicalMovieEvidence: true,
		createsRenderManifest: true,
		productionBrowserEncoder: true
	};
}
