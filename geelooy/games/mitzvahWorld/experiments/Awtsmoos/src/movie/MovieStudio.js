// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudio.js
 * @description Boots the real world, prepares canonical Chossid cinema assets, then installs one truthful editor session.
 * The Awtsmoos renews world, actor, frame, and editor before any finite image can claim reality;
 * Awtsmoos.com therefore prepares real shared Chossid vessels before the director may reveal frame zero.
 */

import { createEretzRuntime } from '../app/createEretzRuntime.js';
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
import { MovieStudioScene3dController } from './MovieStudioScene3dController.js';
import { MovieStudioScene3dGizmo } from './MovieStudioScene3dGizmo.js';
import { MovieStudioSession } from './MovieStudioSession.js';
import { MovieStudioTitleController } from './MovieStudioTitleController.js';
import { MovieStudioTransportController } from './MovieStudioTransportController.js';
import { MovieStudioUiActionRegistry } from './MovieStudioUiActionRegistry.js';
import { MovieStudioUtilityController } from './MovieStudioUtilityController.js';
import { createMovieStudioView, showMovieLoading } from './MovieStudioView.js';
import { MovieStudioWorkspaceModeController } from './MovieStudioWorkspaceModeController.js';
import { hideMovieWorldChrome } from './MovieWorldChrome.js';

export async function createMovieStudio(hosts, initialProject, options = {}) {
	const loading = showMovieLoading();
	try {
		const diagnostics = await createEretzRuntime(hosts, {
			quality: options.quality || 'cinematic',
			startLoop: false
		});
		const runtime = diagnostics.runtime;
		loading.set('B"H preparing the real shared Chossid cast…');
		const cinemaAssets = await prepareMovieCinemaAssets(initialProject, { runtime });
		const restoreWorldChrome = hideMovieWorldChrome(hosts, runtime.renderer.canvas);
		loading.set('B"H arranging the live 3D cinema and professional tools…');
		const view = createMovieStudioView(initialProject);
		const session = new MovieStudioSession(runtime, diagnostics, view, initialProject);
		session.restoreWorldChrome = restoreWorldChrome;
		session.initialCinemaAssets = cinemaAssets;
		installMovieStudioControllers(session, view, options);
		scheduleAutomaticRender(session, options);
		return session.publicApi;
	} finally {
		loading.remove();
	}
}

function installMovieStudioControllers(session, view, options) {
	session.uiActionRegistry = new MovieStudioUiActionRegistry(view.root, options.environment || globalThis);
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
	session.performanceController = new MovieStudioPerformanceController(session, {
		environment: options.environment || globalThis
	});
	session.transportController = new MovieStudioTransportController(session, view);
	session.interactions = new MovieStudioInteractionController(session, view);
	session.presentationController = new MovieStudioPresentationController(session, view);
	session.preferenceController = new MovieStudioPreferenceController(session, view);
	session.resizeController = new MovieStudioResizeController(session, view);
}

function scheduleAutomaticRender(session, options) {
	if (options.autoRender) setTimeout(() => session.render(), 250);
	if (options.autoRenderExact) setTimeout(() => renderExactMovieStudioSession(session), 250);
}

export default createMovieStudio;
