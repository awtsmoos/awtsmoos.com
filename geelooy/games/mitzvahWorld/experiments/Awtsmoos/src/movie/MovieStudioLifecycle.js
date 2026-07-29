// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioLifecycle.js
 * @description Releases every resource owned by one Movie Maker session exactly once.
 * The Awtsmoos renews each vessel without clinging to its former frame; Awtsmoos.com
 * stops camera, keyframe, audio, authoring, memory, jobs, utilities, and restores identity.
 */

export async function destroyMovieStudioSession(session) {
	if (session.destroyed) return false;
	session.destroyed = true;
	session.autosave?.stop?.();
	session.renderQueue?.clear?.();
	session.events?.emit('session:destroyed', {
		instanceId: session.instanceId || null,
		revision: session.revision,
		title: session.project?.title || ''
	});
	session.cameraActionController?.destroy?.();
	session.keyframeController?.destroy?.();
	session.audioMixerController?.destroy?.();
	session.authoring3dController?.destroy?.();
	session.utilityController?.destroy?.();
	session.interactions?.destroy?.();
	session.preferenceController?.destroy?.();
	session.resizeController?.destroy?.();
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
