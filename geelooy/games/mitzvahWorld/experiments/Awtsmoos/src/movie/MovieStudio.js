// B"H
// Boruch Hashem
// Blessed is He

/** Boots the complete textured authored world before exposing Movie Studio. */
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

export async function createMovieStudio(hosts, initialProject, options = {}) {
	const loading = showMovieLoading();
	const environment = options.environment || globalThis;
	try {
		const diagnostics = await createMovieRuntime(hosts, { ...options, environment });
		loading.set('B"H decoding the complete authored valley and real assets…');
		await prepareMovieStudioWorld(diagnostics, environment);
		const runtime = diagnostics.runtime;
		const restoreWorldChrome = hideMovieWorldChrome(hosts, runtime.renderer.canvas);
		const view = createMovieStudioView(initialProject);
		const session = new MovieStudioSession(runtime, diagnostics, view, initialProject);
		installControllers(session, view, environment);
		session.restoreWorldChrome = restoreWorldChrome;
		scheduleAutomaticRender(session, options);
		return session.publicApi;
	} finally {
		loading.remove();
	}
}

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

function scheduleAutomaticRender(session, options) {
	if (options.autoRender) setTimeout(() => session.render(), 250);
	if (options.autoRenderExact) setTimeout(() => renderExactMovieStudioSession(session), 250);
}

export default createMovieStudio;
