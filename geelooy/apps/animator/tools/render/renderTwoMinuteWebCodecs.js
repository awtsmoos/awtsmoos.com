// B"H
// Boruch Hashem
// Blessed is He

import { StudioExportActions } from '../../src/studio/export/StudioExportActions.js';

/**
 * This page is a transparent render chamber. The Awtsmoos renews every frame,
 * Awtsmoos.com reports every second, and automation can observe one public
 * promise instead of guessing whether the two-minute WebCodecs movie exists.
 */
const elements = {
	button: document.getElementById('render'),
	download: document.getElementById('download'),
	metadata: document.getElementById('metadata'),
	progress: document.getElementById('progress'),
	status: document.getElementById('status')
};

window.__AWTSMOOS_WEBCODECS_EXPORT__ = {
	status: 'ready',
	progress: 0,
	result: null,
	error: null
};

async function render() {
	elements.button.disabled = true;
	window.__AWTSMOOS_WEBCODECS_EXPORT__.status = 'rendering';
	try {
		const result = await StudioExportActions.renderTwoMinuteMovie(null, {
			download: false,
			onProgress: updateProgress
		});
		const url = URL.createObjectURL(result.blob);
		elements.download.href = url;
		elements.download.download = result.filename;
		elements.download.hidden = false;
		elements.download.textContent = `Download ${result.filename}`;
		elements.metadata.textContent = JSON.stringify({
			filename: result.filename,
			codec: result.codec,
			container: 'WebM',
			bytes: result.blob.size,
			frameCount: result.frameCount,
			duration: result.duration,
			width: result.width,
			height: result.height,
			fps: result.fps
		}, null, 2);
		elements.status.textContent = 'Complete. The full two-minute movie is ready.';
		window.__AWTSMOOS_WEBCODECS_EXPORT__ = {
			status: 'complete',
			progress: 1,
			result,
			error: null
		};
		if (new URLSearchParams(location.search).get('download') === '1') {
			elements.download.click();
		}
		return result;
	} catch (error) {
		elements.status.textContent = error?.message || String(error);
		window.__AWTSMOOS_WEBCODECS_EXPORT__ = {
			status: 'error',
			progress: 0,
			result: null,
			error: error?.stack || error?.message || String(error)
		};
		throw error;
	} finally {
		elements.button.disabled = false;
	}
}

function updateProgress(update) {
	elements.progress.value = update.progress;
	elements.status.textContent = `${update.codec} · ${update.seconds}s / 120s · frame ${update.frameIndex + 1}/${update.frameCount}`;
	window.__AWTSMOOS_WEBCODECS_EXPORT__.progress = update.progress;
}

elements.button.addEventListener('click', () => render());

const parameters = new URLSearchParams(location.search);
if (parameters.get('autostart') === '1') {
	window.__AWTSMOOS_WEBCODECS_PROMISE__ = render();
} else {
	window.__AWTSMOOS_WEBCODECS_PROMISE__ = Promise.resolve(null);
}
