// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieDirectorFrame.js
 * @description Applies one deterministic sample to cast, world, appearance, text, camera, renderer, and overlay.
 * The Awtsmoos renews each frame beyond its tracks; Awtsmoos.com joins authored geometry,
 * titles, captions, visual effects, actors, cameras, renderer, and optional shadows without inventing absent systems.
 */

export function applyMovieDirectorFrame(director, time, deltaTime) {
	const snapshot = director.timeline.snapshot(time);
	director.actors.apply(snapshot.byType.actor || [], deltaTime);
	const authoring3d = director.authoring3d?.apply?.(time) || [];
	director.crowd.apply(snapshot.byType.crowd || []);
	director.doors.apply(snapshot.byType.door || []);
	const camera = (snapshot.byType.camera || []).at(-1) || null;
	director.cameras.apply(camera);
	const sceneState = (snapshot.byType.scene || []).at(-1) || null;
	const scene = director.scenes.apply(sceneState);
	const appearance = director.visuals?.apply?.(sceneState) || null;
	const runtime = director.runtime;
	updateMovieShadows(runtime);
	runtime.renderer.setInteractor(runtime.state, time);
	runtime.renderer.render(runtime.scene, runtime.camera);
	const frame = {
		authoring3d,
		camera: director.cameras.currentShot,
		caption: activeClip(snapshot, 'caption'),
		crowd: director.crowd.snapshot(),
		dialogue: activeClip(snapshot, 'dialogue'),
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
