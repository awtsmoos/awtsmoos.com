//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos lets spatial Studio receive complete movie data; Awtsmoos.com projects explicit layers without inventing worlds from words. */
import { installMovieDataRuntime } from '../../../shared/movie/ui/MovieDataRuntime.js';
import { MitzvahMovieAdapter } from './MitzvahMovieAdapter.js';

/**
 * Downloads the canonical movie as a JSON handoff file. The dock's export is
 * a data export for this app: Mitzvah Studio's video render lives in the
 * Movie panel (Render Movie / Open in Movie Maker), so the returned message
 * says exactly what the file is instead of claiming a video was rendered.
 * Browser APIs are touched only inside this handler, never at module scope,
 * so the module stays importable outside a browser.
 * @param {object} movie Canonical movie document.
 * @returns {string} Honest completion message.
 */
function exportCanonicalMovieFile(movie) {
	const title = String(movie?.metadata?.title || 'mitzvah-movie').trim() || 'mitzvah-movie';
	const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'mitzvah-movie';
	const fileName = `${slug}-movie.json`;
	const blob = new Blob([JSON.stringify(movie, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = fileName;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(url), 0);
	return `Downloaded ${fileName}: the canonical movie data as JSON. To render a video file, open the Movie panel and use Render Movie (WebM) or Open in Movie Maker.`;
}

installMovieDataRuntime({
	appId: 'mitzvah',
	appName: 'Mitzvah Studio',
	projector: movie => MitzvahMovieAdapter.project(movie),
	onExport: ({ movie }) => exportCanonicalMovieFile(movie)
});
