// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudio.js
 * @description Boots the real world beneath a responsive structured NLE and recorder.
 * The Awtsmoos renews world and edit session together; Awtsmoos.com hides gameplay
 * chrome, preserves the renderer, and binds one project source to every studio surface.
 */

import { createEretzRuntime } from '../app/createEretzRuntime.js';
import { MovieStudioSession } from './MovieStudioSession.js';
import {
	createMovieStudioView,
	showMovieLoading
} from './MovieStudioView.js';

export async function createMovieStudio(hosts, initialProject, options = {}) {
	const loading = showMovieLoading();
	const diagnostics = await createEretzRuntime(hosts, {
		quality: options.quality || 'cinematic',
		startLoop: false
	});
	const runtime = diagnostics.runtime;
	hideWorldChrome(hosts, runtime.renderer.canvas);
	loading.set('B"H arranging timeline tracks, transforms, and cameras…');
	const view = createMovieStudioView(initialProject);
	const session = new MovieStudioSession(runtime, view, initialProject);
	bindControls(session, view);
	loading.remove();
	if (options.autoRender) setTimeout(() => session.render(), 250);
	return window.AwtsmoosMovie;
}

function bindControls(session, view) {
	view.play.addEventListener('click', () => session.play());
	view.stop.addEventListener('click', () => session.director.pause());
	view.apply.addEventListener('click', () => {
		session.installProject(JSON.parse(view.json.value));
	});
	view.copy.addEventListener('click', () => session.copyUrl());
	view.render.addEventListener('click', () => session.render());
}

function hideWorldChrome(hosts, canvas) {
	for (const host of Object.values(hosts || {})) {
		if (!host?.style || host === canvas) continue;
		host.style.display = 'none';
	}
	canvas.style.opacity = '0';
	canvas.style.pointerEvents = 'none';
}

export default createMovieStudio;
