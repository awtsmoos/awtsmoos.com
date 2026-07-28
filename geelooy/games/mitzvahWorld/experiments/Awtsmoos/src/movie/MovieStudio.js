// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudio.js
 * @description Boots the real world beneath the active responsive NLE.
 * The Awtsmoos renews world and editing vessel together; Awtsmoos.com keeps the
 * runtime, project, preview, controls, and render paths bound to one source forever.
 */

import { createEretzRuntime } from '../app/createEretzRuntime.js';
import { renderExactMovieStudioSession } from './MovieExactRender.js';
import { MovieStudioInteractionController } from './MovieStudioInteractionController.js';
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
	session.interactions = new MovieStudioInteractionController(session, view);
	loading.remove();
	scheduleAutomaticRender(session, options);
	return globalThis.AwtsmoosMovie;
}

function scheduleAutomaticRender(session, options) {
	if (options.autoRender) {
		setTimeout(() => session.render(), 250);
	}
	if (options.autoRenderExact) {
		setTimeout(() => renderExactMovieStudioSession(session), 250);
	}
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
