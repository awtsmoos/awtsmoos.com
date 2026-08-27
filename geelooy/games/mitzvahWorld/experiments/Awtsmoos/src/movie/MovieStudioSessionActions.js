// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSessionActions.js
 * @description Owns live capture, render progress events, and canonical share URL creation.
 * The Awtsmoos renews every rendered frame beyond file and progress; Awtsmoos.com
 * keeps capture separate from the stable API facade while emitting serializable machine evidence.
 */

import { encodeMovieProject } from './MovieProject.js';

export async function renderMovieStudioSession(session) {
	const { view } = session;
	view.render.disabled = true;
	view.status.textContent = 'Arming browser-native movie capture…';
	try {
		const result = await session.recorder.render({
			download: true,
			onProgress: progress => applyRenderProgress(session, progress)
		});
		view.status.textContent = `Downloaded ${result.fileName} · ${(
			result.bytes / 1048576
		).toFixed(2)} MiB`;
		globalThis.AwtsmoosMovieRenderComplete = result;
		session.events.emit('render:completed', {
			bytes: result.bytes,
			fileName: result.fileName,
			revision: session.revision
		});
		return result;
	} catch (error) {
		view.status.textContent = `Render failed: ${error.message}`;
		globalThis.AwtsmoosMovieRenderError = error?.stack || String(error);
		session.events.emit('error', {
			code: 'MOVIE_RENDER_FAILED',
			message: error.message,
			operation: 'render.live',
			revision: session.revision
		});
		throw error;
	} finally {
		view.render.disabled = false;
	}
}

export function copyMovieStudioUrl(session) {
	const url = new URL(location.href);
	url.search = '';
	url.searchParams.set('mode', 'movie');
	url.searchParams.set('movie', encodeMovieProject(session.project));
	navigator.clipboard?.writeText(url.href);
	session.view.status.textContent = `GET URL ready · ${url.href.length} characters`;
	return url.href;
}

function applyRenderProgress(session, progress) {
	session.time = progress.time;
	session.timeline.setTime(progress.time);
	session.view.status.textContent = `Rendering ${
		progress.percent.toFixed(1)
	}% · ${progress.time.toFixed(2)}s`;
	session.events.emit('render:progress', {
		percent: progress.percent,
		revision: session.revision,
		time: progress.time
	});
}
