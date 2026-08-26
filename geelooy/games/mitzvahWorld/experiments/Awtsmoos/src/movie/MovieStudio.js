// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudio.js
 * @description Boots a strict authored runtime, verifies rich world and cinema assets, then composes one truthful authoring session.
 * The Awtsmoos renews river, cedar, ridge, actor, garment, frame, and editor before finite cinema claims reality;
 * Awtsmoos.com keeps the route light while the opened studio waits for every mounted world and prepared Chossid in clarity.
 */

import { installMinimalMeadowRichWorld } from '../app/MinimalMeadowRichWorld.js';
import { prepareMovieCinemaAssets } from './MovieCinemaAssetPreparation.js';
import { renderExactMovieStudioSession } from './MovieExactRender.js';
import { MovieStudioAuthoring3dController } from './MovieStudioAuthoring3dController.js';
import { MovieStudioAudioMixerController } from './MovieStudioAudioMixerController.js';
import { MovieStudioCameraActionController } from './MovieStudioCameraActionController.js';
import { MovieStudioCompositionController } from './MovieStudioCompositionController.js';
import { MovieStudioInteractionController } from './MovieStudioInteractionController.js';
import { MovieStudioKeyframeController } from './MovieStudioKeyframeController.js';
import { MovieStudioPerformanceController } from './MovieStudioPerformanceController.js';
import { MovieStudioPreferenceController } from './MovieStudioPreferenceController.js';
import { MovieStudioPresentationController } from './MovieStudioPresentationController.js';
import { MovieStudioPreviewMirror } from './MovieStudioPreviewMirror.js';
import { MovieStudioProjectBrowserController } from './MovieStudioProjectBrowserController.js';
import { MovieStudioResizeController } from './MovieStudioResizeController.js';
import { createMovieRuntime } from './MovieRuntimeFactory.js';
import { MovieStudioScene3dController } from './MovieStudioScene3dController.js';
import { MovieStudioScene3dGizmo } from './MovieStudioScene3dGizmo.js';
import { MovieStudioSession } from './MovieStudioSession.js';
import { MovieStudioTitleController } from './MovieStudioTitleController.js';
import { MovieStudioTransportController } from './MovieStudioTransportController.js';
import { MovieStudioUiActionRegistry } from './MovieStudioUiActionRegistry.js';
import { MovieStudioUtilityController } from './MovieStudioUtilityController.js';
import { createMovieStudioView, showMovieLoading } from './MovieStudioView.js';
import { prepareMovieStudioWorld } from './MovieStudioWorldReadiness.js';
import { MovieStudioWorkspaceModeController } from './MovieStudioWorkspaceModeController.js';
import { hideMovieWorldChrome } from './MovieWorldChrome.js';

/** Creates one fully prepared Movie Studio session over a real authored runtime. */
export async function createMovieStudio(hosts, initialProject, options = {}) {
	const loading = showMovieLoading();
	const environment = options.environment || globalThis;
	try {
		const diagnostics = await createMovieRuntime(hosts, { ...options, environment });
		loading.set('B"H decoding the complete authored valley and real assets…');
		await prepareMovieStudioWorld(diagnostics, environment);
		const runtime = diagnostics.runtime;
		loading.set('B"H hydrating the real river, trees, village, and mountains…');
		const richWorld = await installMinimalMeadowRichWorld(runtime, environment);
		loading.set('B"H preparing the real shared Chossid cast and wardrobe…');
		const cinemaAssets = await prepareMovieCinemaAssets(initialProject, { runtime });
		const restoreWorldChrome = hideMovieWorldChrome(hosts, runtime.renderer.canvas);
		const view = createMovieStudioView(initialProject);
		const session = new MovieStudioSession(runtime, diagnostics, view, initialProject);
		installControllers(session, view, environment);
		session.initialCinemaAssets = cinemaAssets;
		session.initialRichWorld = richWorld;
		session.restoreWorldChrome = restoreWorldChrome;
		scheduleAutomaticRender(session, options);
		return session.publicApi;
	} finally {
		loading.remove();
	}
}

/** Installs focused controllers while the session remains the sole lifecycle owner. */
function installControllers(session, view, environment) {
	session.uiActionRegistry = new MovieStudioUiActionRegistry(view.root, environment);
	session.previewMirror = new MovieStudioPreviewMirror(session);
	session.workspaceModeController = new MovieStudioWorkspaceModeController(session, view);
	session.scene3dController = new MovieStudioScene3dController(session, view.root);
	session.scene3dGizmo = new MovieStudioScene3dGizmo(session, view.root);
	session.authoring3dController = new MovieStudioAuthoring3dController(session, view);
	session.cameraActionController = new MovieStudioCameraActionController(session, view);
	session.keyframeController = new MovieStudioKeyframeController(session, view);
	session.audioMixerController = new MovieStudioAudioMixerController(session, view);
	session.titleController = new MovieStudioTitleController(session, view);
	session.compositionController = new MovieStudioCompositionController(session, view.root);
	session.projectBrowserController = new MovieStudioProjectBrowserController(session, view.root);
	session.utilityController = new MovieStudioUtilityController(session, view);
	session.performanceController = new MovieStudioPerformanceController(session, { environment });
	session.transportController = new MovieStudioTransportController(session, view);
	session.interactions = new MovieStudioInteractionController(session, view);
	session.presentationController = new MovieStudioPresentationController(session, view);
	session.preferenceController = new MovieStudioPreferenceController(session, view);
	session.resizeController = new MovieStudioResizeController(session, view);
}

/** Schedules optional render automation only after all runtime and controller readiness. */
function scheduleAutomaticRender(session, options) {
	if (options.autoRender) {
		setTimeout(() => session.render(), 250);
	}
	if (options.autoRenderExact) {
		setTimeout(() => renderExactMovieStudioSession(session), 250);
	}
}

export default createMovieStudio;
