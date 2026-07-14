// B"H
// Boruch Hashem
// Blessed is He
/** @module TimelineCompilation @description Compiles storyboard scenes into a deterministic source-linked timeline. */

/** Compiles sequential clips while preserving source provenance. */
export function compileTimeline(storyboard, input = {}) {
	if (storyboard?.state !== 'draft') {
		throw new TypeError('Timeline compilation requires a storyboard draft.');
	}
	let cursorMs = 0;
	const clips = storyboard.scenes.map((scene, index) => {
		const startMs = cursorMs;
		cursorMs += scene.durationMs;
		return Object.freeze({
			id: `clip:${storyboard.id}:${index}`,
			sceneId: scene.id,
			startMs,
			endMs: cursorMs,
			source: scene.source,
			actors: scene.actors
		});
	});
	return Object.freeze({
		id: input.id || `timeline:${storyboard.id}:${Number(input.version || 1)}`,
		storyboardId: storyboard.id,
		version: Number(input.version || 1),
		durationMs: cursorMs,
		clips: Object.freeze(clips),
		compiledAt: String(input.compiledAt || new Date().toISOString()),
		compilerVersion: String(input.compilerVersion || 'creator-world-os-v1')
	});
}
