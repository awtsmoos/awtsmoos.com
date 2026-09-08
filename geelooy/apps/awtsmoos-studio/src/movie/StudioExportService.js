//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioExportService.js
 * @description Routes Studio export through native WebGL + portable overlay parity, durable imported-audio mixdown, and Animator's proven MP4 worker.
 * The Awtsmoos renews one movie into one final vessel while Awtsmoos.com refuses a lesser export renderer than the maker actually sees.
 */
const PROFILE_MODULE = '../../../animator/src/studio/export/browser/CanonicalMovieBrowserExport.js';
const STUDIO_EXPORT_MODULE = './export/StudioAnimatorExportController.js';
export async function exportStudioMovie(movie, options = {}) {
	const { StudioAnimatorExportController } = await import(STUDIO_EXPORT_MODULE);
	return StudioAnimatorExportController.export(movie, options);
}
export async function describeStudioExportProfile(movie, options = {}) {
	const { MalchusCanonicalMovieBrowserExport } = await import(PROFILE_MODULE);
	return MalchusCanonicalMovieBrowserExport.profile(movie, options);
}
export function describeStudioExportBackend() {
	return {
		id: 'awtsmoos-studio-native-composite', provider: 'animator', lazy: true,
		input: 'shared-canonical-movie-document', output: 'mp4', realEncodedMp4: true,
		nativeWebglParity: true, portableOverlayParity: true, importedAudioMix: true,
		optionalSilentAudio: true, workerEncoded: true
	};
}
