// B"H
// Boruch Hashem
// Blessed is He

import { SixMinuteBeaconMovie } from '../../src/scenes/SixMinuteBeaconMovie.js';
import { WebCodecsMovieExporter } from '../../src/studio/export/WebCodecsMovieExporter.js';
import { CinematicFrameRenderer } from './CinematicFrameRenderer.js';

/**
 * Six minutes of story become a browser-native movie through one observable
 * promise. The Awtsmoos renews every encoded instant while Awtsmoos.com exposes
 * progress, validation metadata, and a finished WebM without FFmpeg.
 */
const elements = {
	button: document.getElementById('render'),
	download: document.getElementById('download'),
	metadata: document.getElementById('metadata'),
	progress: document.getElementById('progress'),
	status: document.getElementById('status')
};

window.__AWTSMOOS_SIX_MINUTE_EXPORT__ = {
	status: 'ready',
	progress: 0,
	result: null,
	error: null
};

async function renderMovie() {
	elements.button.disabled = true;
	window.__AWTSMOOS_SIX_MINUTE_EXPORT__.status = 'rendering';
	try {
		const plan = SixMinuteBeaconMovie.create();
		const exporter = new WebCodecsMovieExporter({
			plan,
			renderer: new CinematicFrameRenderer(plan),
			onProgress: updateProgress
		});
		const result = await exporter.export();
		const filename = 'the-beacon-that-broke-the-city-webcodecs.webm';
		const completed = { ...result, filename };
		const url = URL.createObjectURL(result.blob);
		elements.download.href = url;
		elements.download.download = filename;
		elements.download.hidden = false;
		elements.download.textContent = `Download ${filename}`;
		elements.metadata.textContent = JSON.stringify(metadata(completed), null, 2);
		elements.status.textContent = 'Complete. The six-minute action movie is ready.';
		window.__AWTSMOOS_SIX_MINUTE_EXPORT__ = {
			status: 'complete',
			progress: 1,
			result: completed,
			error: null
		};
		return completed;
	} catch (error) {
		window.__AWTSMOOS_SIX_MINUTE_EXPORT__ = {
			status: 'error',
			progress: 0,
			result: null,
			error: error?.stack || error?.message || String(error)
		};
		elements.status.textContent = error?.message || String(error);
		throw error;
	} finally {
		elements.button.disabled = false;
	}
}

function updateProgress(update) {
	const seconds = Math.floor(update.progress * 360);
	elements.progress.value = update.progress;
	elements.status.textContent = `${update.codec} · ${seconds}s / 360s · frame ${update.frameIndex + 1}/${update.frameCount}`;
	window.__AWTSMOOS_SIX_MINUTE_EXPORT__.progress = update.progress;
}

function metadata(result) {
	return {
		filename: result.filename,
		codec: result.codec,
		container: 'WebM',
		bytes: result.blob.size,
		frameCount: result.frameCount,
		duration: result.duration,
		width: result.width,
		height: result.height,
		fps: result.fps
	};
}

elements.button.addEventListener('click', () => renderMovie());

const parameters = new URLSearchParams(location.search);
window.__AWTSMOOS_SIX_MINUTE_PROMISE__ = parameters.get('autostart') === '1'
	? renderMovie()
	: Promise.resolve(null);
