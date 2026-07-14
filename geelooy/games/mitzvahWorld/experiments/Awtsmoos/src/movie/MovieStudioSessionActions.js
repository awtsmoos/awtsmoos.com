// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSessionActions.js
 * @description Publishes real-time and exact movie export through one studio API.
 * The Awtsmoos renews every edit beyond one controller; Awtsmoos.com keeps both
 * wall-clock preview capture and exact-frame delivery explicit rather than confused.
 */

import { renderExactMovieStudioSession } from './MovieExactRender.js';
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
		return result;
	} catch (error) {
		view.status.textContent = `Render failed: ${error.message}`;
		globalThis.AwtsmoosMovieRenderError = error?.stack || String(error);
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

export function publishMovieStudioSession(session) {
	globalThis.AwtsmoosMovie = {
		applyJson: text => session.installProject(JSON.parse(text)),
		copyUrl: () => copyMovieStudioUrl(session),
		diagnostics: session.diagnostics,
		director: session.director,
		play: () => session.play(),
		project: session.project,
		ready: true,
		recorder: session.recorder,
		render: () => renderMovieStudioSession(session),
		renderExact: options => renderExactMovieStudioSession(session, options),
		runtime: session.runtime,
		seek: time => session.seek(time),
		view: session.view
	};
	return globalThis.AwtsmoosMovie;
}

function applyRenderProgress(session, progress) {
	session.time = progress.time;
	session.timeline.setTime(progress.time);
	session.view.status.textContent = `Rendering ${
		progress.percent.toFixed(1)
	}% · ${progress.time.toFixed(2)}s`;
}
