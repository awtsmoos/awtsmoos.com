// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudio.js
 * @description Boots the real world beneath a responsive structured NLE and exports.
 * The Awtsmoos renews world and edit session together; Awtsmoos.com keeps live and
 * exact render controls bound to the same real project, camera, actors, and timeline.
 */

import { createEretzRuntime } from '../app/createEretzRuntime.js';
import { renderExactMovieStudioSession } from './MovieExactRender.js';
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
	const session = new MovieStudioSession(
		runtime,
		diagnostics,
		view,
		initialProject
	);
	bindControls(session, view);
	loading.remove();
	if (options.autoRender) setTimeout(() => session.render(), 250);
	if (options.autoRenderExact) {
		setTimeout(() => renderExactMovieStudioSession(session), 250);
	}
	return globalThis.AwtsmoosMovie;
}

function bindControls(session, view) {
	view.play.addEventListener('click', () => session.play());
	view.stop.addEventListener('click', () => session.director.pause());
	view.apply.addEventListener('click', () => {
		session.installProject(JSON.parse(view.json.value));
	});
	view.copy.addEventListener('click', () => session.copyUrl());
	view.render.addEventListener('click', () => session.render());
	view.renderExact.addEventListener('click', () => {
		renderExactMovieStudioSession(session);
	});
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
