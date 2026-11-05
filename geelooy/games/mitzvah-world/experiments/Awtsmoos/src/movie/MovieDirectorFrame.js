// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieDirectorFrame.js
 * @description Applies world, Short hero geometry, authored changes, performance, render, and overlay precedence to one frame.
 * The Awtsmoos renews each layer without confusing its authority; Awtsmoos.com joins
 * world, river, garden, actors, camera, renderer, source video, and text before the finite eye can name their time.
 */

export function applyMovieDirectorFrame(director, time, deltaTime) {
	director.performance?.beginFrame?.();
	const snapshot = director.timeline.snapshot(time);
	director.actors.apply(snapshot.byType.actor || [], deltaTime);
	const authoring3d = director.authoring3d?.apply?.(time) || [];
	director.crowd.apply(snapshot.byType.crowd || []);
	director.doors.apply(snapshot.byType.door || []);
	const camera = (snapshot.byType.camera || []).at(-1) || null;
	director.cameras.apply(camera);
	const sceneState = (snapshot.byType.scene || []).at(-1) || null;
	const scene = director.scenes.apply(sceneState);
	director.shortWorld?.apply?.(sceneState, deltaTime);
	const appearance = director.visuals?.apply?.(sceneState) || null;
	const performance = director.performance?.apply?.(time) || null;
	const runtime = director.runtime;
	updateMovieShadows(runtime);
	runtime.renderer.setInteractor(runtime.state, time);
	runtime.renderer.render(runtime.scene, runtime.camera);
	const frame = {
		authoring3d,
		camera: performance?.camera || director.cameras.currentShot,
		caption: activeClip(snapshot, 'caption'),
		crowd: director.crowd.snapshot(),
		dialogue: activeClip(snapshot, 'dialogue'),
		performance,
		renderer: runtime.renderer.stats,
		scene,
		shot: director.cameras.currentShot,
		snapshot,
		time,
		title: activeClip(snapshot, 'title')
	};
	if (appearance) frame.appearance = appearance;
	director.overlay.draw(runtime.renderer.canvas, frame);
	return frame;
}

export function updateMovieShadows(runtime) {
	runtime.shadows?.update?.({
		ground: runtime.ground,
		npc: runtime.npc,
		state: runtime.state,
		worldMode: runtime.worldMode
	});
}

function activeClip(snapshot, type) {
	return (snapshot.byType[type] || []).at(-1)?.clip || null;
}
