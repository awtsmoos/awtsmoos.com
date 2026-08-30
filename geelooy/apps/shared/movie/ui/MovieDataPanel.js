// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieDataPanel.js
 * @description The Awtsmoos lets exact movie data enter without a single semantic guess;
 * Awtsmoos.com offers JSON as a transparent transport while external agents author every scene and dress.
 */
export function mountMovieDataPanel(host, state, status) {
	host.innerHTML = `<form class="movie-data-form"><label>Canonical movie JSON<textarea name="movieData" spellcheck="false" autocomplete="off" aria-label="Canonical movie JSON"></textarea></label><div class="movie-form-actions"><button type="submit" class="movie-primary-action">Load canonical data</button><button type="button" data-movie-copy>Copy current data</button></div><small>Structured data only. External agents choose scenes, cameras, layers, timing, and motion.</small></form>`;
	const form = host.querySelector('.movie-data-form');
	const textarea = form.elements.movieData;
	form.addEventListener('submit', event => {
		event.preventDefault();
		try {
			state.loadJson(textarea.value);
			status('Canonical movie data loaded and validated.');
		} catch (error) {
			status(`Data error: ${error.message}`);
		}
	});
	host.querySelector('[data-movie-copy]').addEventListener('click', () => {
		const movie = state.snapshot().movie;
		textarea.value = movie ? JSON.stringify(movie, null, 2) : '';
		status(movie ? 'Current canonical data copied into the editor.' : 'No movie data is loaded.');
	});
	return state.subscribe(snapshot => {
		if (snapshot.movie && document.activeElement !== textarea) {
			textarea.value = JSON.stringify(snapshot.movie, null, 2);
		}
	});
}
