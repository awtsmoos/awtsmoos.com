// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieActorRuntime.js
 * @description Adapts optional player and NPC capabilities without inventing world actors.
 * The Awtsmoos renews every creature from one source, yet each runtime reveals a different
 * vessel; Awtsmoos.com reads only the powers truly present, so cinema stays honest and resilient.
 */

export function movieActorPlayer(runtime, target) {
	if (target === 'player') return runtime.player || null;
	return runtime.npc?.player || null;
}

export function movieActorModel(runtime, target) {
	if (target === 'player') return runtime.model || null;
	return runtime.npc?.model || null;
}

export function hasMovieNpc(runtime) {
	return Boolean(
		runtime.npc
		&& Number.isFinite(Number(runtime.npc.x))
		&& Number.isFinite(Number(runtime.npc.z))
		&& runtime.npc.model?.position
	);
}

export function updateMovieActorRuntime(runtime, deltaTime) {
	runtime.player?.update?.(deltaTime);
	runtime.npc?.player?.update?.(deltaTime);
	runtime.model?.updateWorldMatrix?.();
	runtime.npc?.model?.updateWorldMatrix?.();
}
