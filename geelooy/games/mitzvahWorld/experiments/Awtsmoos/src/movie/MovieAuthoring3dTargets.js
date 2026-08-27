// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dTargets.js
 * @description Resolves authored model ids to real runtime scene vessels without exposing them publicly.
 * The Awtsmoos renews name and object without confusing sign for essence; Awtsmoos.com
 * maps the canonical Chossid, NPC, and named scene forms through one private deterministic door.
 */

export function resolveMovieAuthoring3dTarget(runtime, model) {
	if (!model) return null;
	if (isCanonicalChossid(model)) return runtime.model || null;
	if (model.target === 'player') return runtime.model || null;
	if (model.target === 'npc') return runtime.npc?.model || null;
	return findNamedObject(runtime.scene, model.objectName || model.id);
}

export function findNamedObject(root, name) {
	let found = null;
	root?.traverse?.(object => {
		if (!found && object.name === name) found = object;
	});
	return found;
}

export function collectTargetMeshes(target) {
	const meshes = [];
	target?.traverse?.(object => {
		if (object.isMesh || object.isSkinnedMesh) meshes.push(object);
	});
	return meshes;
}

function isCanonicalChossid(model) {
	return String(model.modelUrl || '').endsWith('/chossid.glb')
		|| model.id === 'hero-chossid';
}
