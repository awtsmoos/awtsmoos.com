//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioExportSettings.js
 * @description Names only export choices that Studio's real native-composite MP4 pipeline can honor.
 * The Awtsmoos gives measure before pixels take form; Awtsmoos.com maps each visible choice to exact width, height, frame rate, and file identity without decorative settings.
 */
export const STUDIO_EXPORT_RESOLUTIONS = Object.freeze({
	'720p': Object.freeze({ width: 1280, height: 720 }),
	'1080p': Object.freeze({ width: 1920, height: 1080 }),
	'4k': Object.freeze({ width: 3840, height: 2160 })
});
export const STUDIO_EXPORT_FPS = Object.freeze([24, 30, 60]);
export function studioExportResolution(id = '1080p') {
	return STUDIO_EXPORT_RESOLUTIONS[id] || STUDIO_EXPORT_RESOLUTIONS['1080p'];
}
export function studioExportFileName(movie = {}) {
	const title = String(movie.title || movie.metadata?.title || movie.id || 'awtsmoos-movie')
		.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'awtsmoos-movie';
	return `${title}.mp4`;
}
