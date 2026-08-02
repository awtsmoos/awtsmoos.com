// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioLifecycle.js
 * @description Releases transport, parity registry, preview, presentation, UI, media, runtime, and project resources exactly once.
 * The Awtsmoos renews every vessel without clinging to its former frame; Awtsmoos.com stops
 * playback, visible mirroring, action observation, focused viewing, audio, jobs, memory, and world chrome before identity returns.
 */

export async function destroyMovieStudioSession(session) {
	if (session.destroyed) return false;
	session.destroyed = true;
	session.pause?.();
	session.autosave?.stop?.();
	session.renderQueue?.clear?.();
	session.events?.emit('session:destroyed', {
		instanceId: session.instanceId || null,
		revision: session.revision,
		title: session.project?.title || ''
	});
	session.transportController?.destroy?.();
	session.previewMirror?.destroy?.();
	session.performanceController?.destroy?.();
	session.scene3dGizmo?.destroy?.();
	session.scene3dController?.destroy?.();
	session.cameraActionController?.destroy?.();
	session.keyframeController?.destroy?.();
	session.audioMixerController?.destroy?.();
	session.titleController?.destroy?.();
	session.compositionController?.destroy?.();
	session.projectBrowserController?.destroy?.();
	session.authoring3dController?.destroy?.();
	session.utilityController?.destroy?.();
	session.uiActionRegistry?.destroy?.();
	session.presentationController?.destroy?.();
	session.interactions?.destroy?.();
	session.preferenceController?.destroy?.();
	session.resizeController?.destroy?.();
	session.workspaceModeController?.destroy?.();
	session.timeline?.destroy?.();
	session.director?.destroy?.();
	await session.plugins?.clear?.();
	session.runtimeAdapters?.clear?.();
	await session.recorder?.audio?.stop?.();
	session.runtime?.dispose?.();
	session.restoreWorldChrome?.();
	session.view?.restoreDocumentTitle?.();
	session.view?.root?.remove?.();
	session.persistence?.clear?.();
	if (session.instanceRegistry && session.instanceId) {
		session.events?.emit('instance:unregistered', { instanceId: session.instanceId });
		session.instanceRegistry.unregister(session.instanceId);
	} else if (globalThis.AwtsmoosMovie === session.publicApi) {
		delete globalThis.AwtsmoosMovie;
	}
	session.events?.clear?.();
	return true;
}
