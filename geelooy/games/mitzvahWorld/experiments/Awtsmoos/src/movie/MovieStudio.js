// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudio.js
 * @description Boots the real world beneath the stable API and responsive professional NLE.
 * The Awtsmoos renews world and editing vessel together; Awtsmoos.com binds runtime, project,
 * recovery, cameras, actions, keyframes, audio, titles, 3D authoring, utilities, and rendering.
 */

import { createEretzRuntime } from '../app/createEretzRuntime.js';
import { renderExactMovieStudioSession } from './MovieExactRender.js';
import { MovieStudioAuthoring3dController } from './MovieStudioAuthoring3dController.js';
import { MovieStudioAudioMixerController } from './MovieStudioAudioMixerController.js';
import { MovieStudioCameraActionController } from './MovieStudioCameraActionController.js';
import { MovieStudioInteractionController } from './MovieStudioInteractionController.js';
import { MovieStudioKeyframeController } from './MovieStudioKeyframeController.js';
import { MovieStudioPreferenceController } from './MovieStudioPreferenceController.js';
import { MovieStudioProjectBrowserController } from './MovieStudioProjectBrowserController.js';
import { MovieStudioResizeController } from './MovieStudioResizeController.js';
import { MovieStudioSession } from './MovieStudioSession.js';
import { MovieStudioTitleController } from './MovieStudioTitleController.js';
import { MovieStudioUtilityController } from './MovieStudioUtilityController.js';
import { createMovieStudioView, showMovieLoading } from './MovieStudioView.js';
import { hideMovieWorldChrome } from './MovieWorldChrome.js';

export async function createMovieStudio(hosts, initialProject, options = {}) {
	const loading = showMovieLoading();
	try {
		const diagnostics = await createEretzRuntime(hosts, { quality: options.quality || 'cinematic', startLoop: false });
		const runtime = diagnostics.runtime;
		const restoreWorldChrome = hideMovieWorldChrome(hosts, runtime.renderer.canvas);
		loading.set('B"H arranging recovery, timeline, sound, titles, materials, actions, keyframes, and cameras…');
		const view = createMovieStudioView(initialProject);
		const session = new MovieStudioSession(runtime, diagnostics, view, initialProject);
		session.restoreWorldChrome = restoreWorldChrome;
		session.authoring3dController = new MovieStudioAuthoring3dController(session, view);
		session.cameraActionController = new MovieStudioCameraActionController(session, view);
		session.keyframeController = new MovieStudioKeyframeController(session, view);
		session.audioMixerController = new MovieStudioAudioMixerController(session, view);
		session.titleController = new MovieStudioTitleController(session, view);
		session.projectBrowserController = new MovieStudioProjectBrowserController(session, view.root);
		session.utilityController = new MovieStudioUtilityController(session, view);
		session.interactions = new MovieStudioInteractionController(session, view);
		session.preferenceController = new MovieStudioPreferenceController(session, view);
		session.resizeController = new MovieStudioResizeController(session, view);
		scheduleAutomaticRender(session, options);
		return session.publicApi;
	} finally { loading.remove(); }
}

function scheduleAutomaticRender(session, options) {
	if (options.autoRender) setTimeout(() => session.render(), 250);
	if (options.autoRenderExact) setTimeout(() => renderExactMovieStudioSession(session), 250);
}

export default createMovieStudio;
