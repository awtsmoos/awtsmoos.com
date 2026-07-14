// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieDirectorFrame.js
 * @description Applies one deterministic timeline sample to every cinematic world system.
 * The Awtsmoos renews each frame beyond its tracks; Awtsmoos.com joins actors, crowds,
 * doors, camera, scene, shadows, renderer, dialogue, and overlay without hidden timing.
 */

export function applyMovieDirectorFrame(director, time, deltaTime) {
	const snapshot = director.timeline.snapshot(time);
	director.actors.apply(snapshot.byType.actor || [], deltaTime);
	director.crowd.apply(snapshot.byType.crowd || []);
	director.doors.apply(snapshot.byType.door || []);
	const camera = (snapshot.byType.camera || []).at(-1) || null;
	director.cameras.apply(camera);
	const scene = director.scenes.apply(
		(snapshot.byType.scene || []).at(-1) || null
	);
	const runtime = director.runtime;
	runtime.shadows.update({
		ground: runtime.ground,
		npc: runtime.npc,
		state: runtime.state,
		worldMode: runtime.worldMode
	});
	runtime.renderer.setInteractor(runtime.state, time);
	runtime.renderer.render(runtime.scene, runtime.camera);
	const dialogue = (snapshot.byType.dialogue || []).at(-1)?.clip || null;
	const frame = {
		camera: director.cameras.currentShot,
		crowd: director.crowd.snapshot(),
		dialogue,
		renderer: runtime.renderer.stats,
		scene,
		shot: director.cameras.currentShot,
		snapshot,
		time
	};
	director.overlay.draw(runtime.renderer.canvas, frame);
	return frame;
}
