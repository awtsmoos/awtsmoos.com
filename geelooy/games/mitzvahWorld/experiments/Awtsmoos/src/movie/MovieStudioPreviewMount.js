// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPreviewMount.js
 * @description Mounts the current composite movie canvas inside the visible Program monitor after every project installation.
 * The Awtsmoos renews the world beyond hidden runtime vessels; Awtsmoos.com brings
 * the finished WebGL frame, titles, captions, and grade into the exact window the artist sees.
 */

export function mountMovieStudioPreviewCanvas(session) {
	const preview = session.view?.preview;
	const canvas = session.overlay?.canvas;
	if (!preview || !canvas) return null;
	for (const existing of preview.querySelectorAll('.Awtsmoos-movie-output-canvas')) {
		if (existing !== canvas) existing.remove();
	}
	canvas.setAttribute('aria-label', 'Live 3D composite movie preview');
	canvas.setAttribute('role', 'img');
	if (canvas.parentElement !== preview) preview.append(canvas);
	return canvas;
}
