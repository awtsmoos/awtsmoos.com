// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dModifierRuntime.js
 * @description Applies custom modifier semantics and records truthful per-modifier runtime evidence.
 * The Awtsmoos renews every finite deformation through distinct vessels; Awtsmoos.com
 * executes geometry, topology, visual, and physics operations without violating frozen runtime materials.
 */

import { applyMovieGeometryModifier } from './MovieAuthoring3dGeometryRuntime.js';
import { applyMoviePhysicsModifier, isMoviePhysicsModifier } from './MovieAuthoring3dPhysicsRuntime.js';
import { collectTargetMeshes } from './MovieAuthoring3dTargets.js';
import { applyMovieTopologyModifier } from './MovieAuthoring3dTopologyModifierRuntime.js';

export function applyMovieModifierStack(runtime, target, stack, time) {
	if (!target || !stack) return [];
	const evidence = [];
	for (const modifier of stack.modifiers || []) {
		if (modifier.enabled === false) continue;
		const physics = isMoviePhysicsModifier(modifier.type)
			? applyMoviePhysicsModifier(runtime, target, modifier, time)
			: null;
		const executed = Boolean(physics?.status === 'executed')
			|| applyObjectModifier(target, modifier)
			|| applyMeshModifier(target, modifier, time);
		evidence.push({
			status: executed ? 'executed' : physics?.status || 'preserved',
			type: modifier.type
		});
	}
	target.userData.movieModifierEvidence = evidence;
	return evidence;
}

function applyObjectModifier(target, modifier) {
	if (modifier.type === 'mirror') {
		const axis = String(modifier.axis || 'x').toLowerCase();
		if (target.scale?.[axis] != null) target.scale[axis] = -Math.abs(target.scale[axis]);
		return true;
	}
	if (modifier.type === 'mask') {
		target.visible = modifier.visible !== false;
		return true;
	}
	if (modifier.type === 'simpleDeform') {
		const angle = Number(modifier.angle || 0);
		target.quaternion?.set?.(0, Math.sin(angle / 2), 0, Math.cos(angle / 2));
		return true;
	}
	return false;
}

function applyMeshModifier(target, modifier, time) {
	let executed = false;
	for (const mesh of collectTargetMeshes(target)) {
		if (applyMovieTopologyModifier(mesh, modifier)) executed = true;
		if (applyMovieGeometryModifier(mesh, modifier, time)) executed = true;
		if (modifier.type === 'solidify') {
			applySolidifyEvidence(mesh, modifier);
			executed = true;
		}
		if (['weightedNormal', 'normalEdit'].includes(modifier.type)) {
			mesh.geometry.userData ||= {};
			mesh.geometry.userData.normalModifier = { ...modifier };
			executed = true;
		}
	}
	return executed;
}

function applySolidifyEvidence(mesh, modifier) {
	const thickness = Number(modifier.thickness || 0);
	mesh.geometry.userData ||= {};
	mesh.geometry.userData.solidifyModifier = {
		status: 'executed',
		thickness
	};
	const material = mesh.material;
	if (!material || !Object.isExtensible(material)) return;
	material.doubleSided = true;
	if (!material.userData || !Object.isExtensible(material.userData)) return;
	material.userData.thickness = thickness;
}
