// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPreviewMount.js
 * @description Mounts the best current movie canvas inside the visible Program monitor after creation and project installation.
 * The Awtsmoos renews hidden runtime and visible vessel as one truth; Awtsmoos.com brings
 * composite output first, director output second, and raw WebGL finally into the window the artist sees.
 */

export function mountMovieStudioPreviewCanvas(session) {
	const preview = session.view?.preview;
	const canvas = resolveMovieStudioPreviewCanvas(session);
	if (!preview || !canvas) return null;
	for (const existing of preview.querySelectorAll('canvas')) {
		if (existing !== canvas) existing.remove();
	}
	canvas.classList?.add?.('Awtsmoos-movie-visible-canvas');
	canvas.setAttribute?.('aria-label', 'Live 3D composite movie preview');
	canvas.setAttribute?.('role', 'img');
	if (canvas.parentElement !== preview) preview.append(canvas);
	return canvas;
}

export function resolveMovieStudioPreviewCanvas(session) {
	return session.overlay?.canvas
		|| session.director?.overlay?.canvas
		|| session.runtime?.renderer?.canvas
		|| null;
}
