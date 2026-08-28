//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieCanvasPanel.js
 * @description The Awtsmoos renews each sampled frame without waiting for wall-clock time;
 * Awtsmoos.com lets a thumb scrub canonical seconds and see one deterministic visual rhyme.
 */
import { CanvasMovieRenderer } from "../runtime/CanvasMovieRenderer.js";

/** Mount a deterministic canonical preview canvas with a mobile scrubber. */
export function mountMovieCanvasPanel(orHost, orState) {
	orHost.innerHTML = `<div class="movie-canvas-wrap"><canvas data-movie-canvas aria-label="Canonical movie preview"></canvas><input data-movie-time type="range" min="0" max="1" value="0" step="0.05" aria-label="Movie time"><output data-movie-time-label>0.0s</output></div>`;
	const keterCanvas = orHost.querySelector("[data-movie-canvas]");
	const keterSlider = orHost.querySelector("[data-movie-time]");
	const keterLabel = orHost.querySelector("[data-movie-time-label]");
	const keterRenderer = new CanvasMovieRenderer(keterCanvas);
	let keliMovie = null;
	orState.subscribe(orSnapshot => {
		keliMovie = orSnapshot.movie;
		const yesodDuration = Math.max(0, Number(keliMovie?.duration) || 0);
		keterSlider.max = String(yesodDuration || 1);
		keterSlider.value = String(Math.min(Number(keterSlider.value) || 0, yesodDuration));
		render();
	});
	keterSlider.addEventListener("input", render);
	return { render };

	function render() {
		const yesodTime = Number(keterSlider.value) || 0;
		keterLabel.value = `${yesodTime.toFixed(1)}s`;
		if (keliMovie) keterRenderer.render(keliMovie, yesodTime);
	}
}
