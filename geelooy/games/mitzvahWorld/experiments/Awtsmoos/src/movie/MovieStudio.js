// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudio.js
 * @description Boots the world with visible progress, optional staged scene worlds, and the professional NLE.
 * The Awtsmoos renews world and editing vessel together; Awtsmoos.com binds runtime, project,
 * generation, loading, cameras, actions, utilities, preferences, controls, and rendering to one session.
 */

import { createEretzRuntime } from '../app/createEretzRuntime.js';
import { renderExactMovieStudioSession } from './MovieExactRender.js';
import { MovieStudioAuthoring3dController } from './MovieStudioAuthoring3dController.js';
import { MovieStudioCameraActionController } from './MovieStudioCameraActionController.js';
import { MovieStudioInteractionController } from './MovieStudioInteractionController.js';
import { createMovieStudioLoadingProgress } from './MovieStudioLoadingProgress.js';
import { MovieStudioPreferenceController } from './MovieStudioPreferenceController.js';
import { MovieStudioResizeController } from './MovieStudioResizeController.js';
import { MovieStudioSession } from './MovieStudioSession.js';
import { MovieStudioUtilityController } from './MovieStudioUtilityController.js';
import { createMovieStudioView, showMovieLoading } from './MovieStudioView.js';
import { createMovieWorldActivationService } from './MovieWorldActivationService.js';
import { hideMovieWorldChrome } from './MovieWorldChrome.js';

export async function createMovieStudio(hosts, initialProject, options = {}) {
	const loading = showMovieLoading();
	try {
		const diagnostics = await createEretzRuntime(hosts, {
			onProgress: createMovieStudioLoadingProgress(loading),
			quality: options.quality || 'cinematic',
			startLoop: false
		});
		const runtime = diagnostics.runtime;
		installWorldActivation(runtime, options);
		const restoreWorldChrome = hideMovieWorldChrome(hosts, runtime.renderer.canvas);
		loading.update({
			details: 'Preparing editing controls and authored project services.',
			label: 'Arranging cinematic timeline',
			progress: 0.94,
			status: 'loading'
		});
		const view = createMovieStudioView(initialProject);
		const session = new MovieStudioSession(runtime, diagnostics, view, initialProject);
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

function installWorldActivation(runtime, options) {
	if (!options.loadWorld && !options.worldStages) return;
	runtime.worldLoader = createMovieWorldActivationService({
		createView: showMovieLoading,
		fallback: options.worldFallback,
		load: options.loadWorld,
		retries: options.worldLoadRetries,
		stages: options.worldStages
	});
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
