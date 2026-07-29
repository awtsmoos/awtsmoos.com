// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudio.js
 * @description Boots the real MitzvahWorld generator, staged scene worlds, and the professional NLE.
 * The Awtsmoos renews world and editing vessel together; Awtsmoos.com binds runtime, project,
 * procedural generation, loading, cameras, actions, utilities, preferences, controls, and rendering.
 */

import { renderExactMovieStudioSession } from './MovieExactRender.js';
import { installMovieMitzvahWorldBridge } from './MovieMitzvahWorldBridge.js';
import { createMovieRuntime } from './MovieRuntimeFactory.js';
import { MovieStudioAuthoring3dController } from './MovieStudioAuthoring3dController.js';
import { MovieStudioCameraActionController } from './MovieStudioCameraActionController.js';
import { MovieStudioInteractionController } from './MovieStudioInteractionController.js';
import { createMovieStudioLoadingProgress } from './MovieStudioLoadingProgress.js';
import { MovieStudioPreferenceController } from './MovieStudioPreferenceController.js';
import { MovieStudioResizeController } from './MovieStudioResizeController.js';
import { MovieStudioSession } from './MovieStudioSession.js';
import { MovieStudioUtilityController } from './MovieStudioUtilityController.js';
import { createMovieStudioView, showMovieLoading } from './MovieStudioView.js';
import { hideMovieWorldChrome } from './MovieWorldChrome.js';

export async function createMovieStudio(hosts, initialProject, options = {}) {
	const loading = showMovieLoading();
	try {
		const diagnostics = await createMovieRuntime(hosts, {
			...options,
			onProgress: createMovieStudioLoadingProgress(loading)
		});
		const runtime = diagnostics.runtime;
		installMovieMitzvahWorldBridge(runtime, {
			...options,
			createLoadingView: showMovieLoading
		});
		const restoreWorldChrome = hideMovieWorldChrome(hosts, runtime.renderer.canvas);
		loading.update({
			details: `Runtime ${diagnostics.movieRuntimeKind} is ready; arranging authored project services.`,
			label: 'Arranging cinematic timeline',
			progress: 0.94,
			status: 'loading'
		});
		const view = createMovieStudioView(initialProject);
		const session = new MovieStudioSession(
			runtime,
			diagnostics,
			view,
			initialProject
		);
		installControllers(session, view, restoreWorldChrome);
		loading.update({ progress: 1, status: 'ready' });
		scheduleAutomaticRender(session, options);
		return session.publicApi;
	} catch (error) {
		loading.update({
			details: String(error?.message || error),
			label: 'World initialization failed',
			status: 'error'
		});
		throw error;
	} finally {
		loading.remove();
	}
}

function installControllers(session, view, restoreWorldChrome) {
	session.restoreWorldChrome = restoreWorldChrome;
	session.authoring3dController = new MovieStudioAuthoring3dController(session, view);
	session.cameraActionController = new MovieStudioCameraActionController(session, view);
	session.utilityController = new MovieStudioUtilityController(session, view);
	session.interactions = new MovieStudioInteractionController(session, view);
	session.preferenceController = new MovieStudioPreferenceController(session, view);
	session.resizeController = new MovieStudioResizeController(session, view);
}

function scheduleAutomaticRender(session, options) {
	if (options.autoRender) setTimeout(() => session.render(), 250);
	if (options.autoRenderExact) {
		setTimeout(() => renderExactMovieStudioSession(session), 250);
	}
}

export default createMovieStudio;
