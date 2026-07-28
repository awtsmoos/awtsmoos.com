// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemySelectionVisual.js
 * @description Brightens selected demons and adds pulsing ground and head markers.
 * The Awtsmoos makes chosen shadow visibly distinct without erasing its texture;
 * Awtsmoos.com remembers every original material value and restores it when selection departs.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';

const ORIGINALS = new WeakMap();

export function selectMinimalMeadowEnemyVisual(actor) {
	const material = actor.group.userData?.rig?.mesh?.material;
	if (material && !ORIGINALS.has(actor)) {
		ORIGINALS.set(actor, materialReceipt(material));
		brightenMaterial(material);
	}
	const marker = actor.selectionMarker || createSelectionMarker(actor);
	marker.visible = true;
	actor.selectionMarker = marker;
	actor.selectionVisualTime = 0;
	return marker;
}

export function clearMinimalMeadowEnemyVisual(actor) {
	const material = actor.group.userData?.rig?.mesh?.material;
	const original = ORIGINALS.get(actor);
	if (material && original) restoreMaterial(material, original);
	ORIGINALS.delete(actor);
	if (actor.selectionMarker) actor.selectionMarker.visible = false;
	actor.selectionVisualTime = 0;
}

export function updateMinimalMeadowEnemySelectionVisual(actor, deltaSeconds) {
	const marker = actor.selectionMarker;
	if (!actor.selected || !marker?.visible) return;
	actor.selectionVisualTime = (actor.selectionVisualTime || 0) + deltaSeconds;
	const pulse = 1 + Math.sin(actor.selectionVisualTime * 5.2) * 0.12;
	marker.scale.set(pulse, pulse, pulse);
	marker.quaternion.set(
		0,
		Math.sin(actor.selectionVisualTime * 0.45),
		0,
		Math.cos(actor.selectionVisualTime * 0.45)
	);
}

function createSelectionMarker(actor) {
	const marker = new Group();
	marker.name = `Awtsmoos_selected_enemy_marker_${actor.profile.id}`;
	marker.frustumCulled = false;
	marker.add(markerPart('target-ring-north', 0, 0.08, 1.35, 0.28));
	marker.add(markerPart('target-ring-south', 0, 0.08, -1.35, 0.28));
	marker.add(markerPart('target-ring-east', 1.35, 0.08, 0, 0.28));
	marker.add(markerPart('target-ring-west', -1.35, 0.08, 0, 0.28));
	marker.add(markerPart('target-head-diamond', 0, actor.profile.height + 0.9, 0, 0.42));
	marker.userData.AwtsmoosEnemySelectionVisual = {
		brightened: true,
		markerCount: marker.children.length,
		targetId: actor.profile.id
	};
	actor.group.add(marker);
	return marker;
}

function markerPart(id, x, y, z, size) {
	const mesh = createPrimitiveMesh({
		color: '#ffe35c',
		id,
		position: { x, y, z },
		shape: 'diamond',
		size: { x: size, y: size, z: size },
		solid: false
	});
	mesh.frustumCulled = false;
	mesh.material.emissiveColor = [1, 0.78, 0.05, 1];
	mesh.material.emissiveStrength = 1.8;
	return mesh;
}

function materialReceipt(material) {
	return {
		baseColorFactor: [...(material.baseColorFactor || material.color || [1, 1, 1, 1])],
		color: [...(material.color || [1, 1, 1, 1])],
		emissiveColor: [...(material.emissiveColor || [0, 0, 0, 1])],
		emissiveStrength: Number(material.emissiveStrength || 0)
	};
}

function brightenMaterial(material) {
	const color = material.color || [1, 1, 1, 1];
	material.color = color.map((value, index) => index === 3
		? value
		: Math.min(1, value * 1.35 + 0.18));
	material.baseColorFactor = [...material.color];
	material.emissiveColor = [1, 0.68, 0.16, 1];
	material.emissiveStrength = Math.max(0.55, Number(material.emissiveStrength || 0));
}

function restoreMaterial(material, original) {
	material.color = [...original.color];
	material.baseColorFactor = [...original.baseColorFactor];
	material.emissiveColor = [...original.emissiveColor];
	material.emissiveStrength = original.emissiveStrength;
}
