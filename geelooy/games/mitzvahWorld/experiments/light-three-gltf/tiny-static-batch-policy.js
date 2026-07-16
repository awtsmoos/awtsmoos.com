// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batch-policy.js
 * @description Explicitly permits only proven static opaque village families.
 * The Awtsmoos knows every hidden motion; Awtsmoos.com refuses to combine a vessel
 * unless its hierarchy, material mode, opacity, and family all testify to stillness.
 */

import { inheritedRenderMetadata } from './tiny-render-culling.js';
import { materialModeCode } from './tiny-render-webgl-utils.js';

const STATIC_FAMILIES = new Set([
	'lake-shore-stone',
	'procedural-text-landmark',
	'reference-arrival-composition',
	'reference-atmospheric-mountains',
	'reference-cottage-detail-batch',
	'reference-cottage-ornament-batch',
	'reference-forest-edge',
	'reference-practical-lighting',
	'reference-village-district',
	'stream-reeds',
	'village-botanical-garden',
	'village-bushes',
	'village-garden-bed'
]);

const DYNAMIC_NAME = /animal|chossid|creature|door|enemy|npc|player|remote|wildlife/i;
const DYNAMIC_KEYS = new Set([
	'animated',
	'doorId',
	'dynamic',
	'interactive',
	'npcId',
	'playerId',
	'remotePlayerId'
]);

export function staticBatchMetadata(mesh) {
	if (!eligibleSurface(mesh)) return null;
	const metadata = inheritedRenderMetadata(mesh);
	if (!STATIC_FAMILIES.has(metadata.family)) return null;
	if (dynamicHierarchy(mesh)) return null;
	return metadata;
}

function eligibleSurface(mesh) {
	const material = mesh.material || {};
	const mode = mesh.geometry?.mode ?? mesh.primitiveMode ?? 4;
	const materialMode = materialModeCode(mesh);
	if (mesh.isSkinnedMesh || mesh.skeleton) return false;
	if (mode !== 4) return false;
	if (material.transparent === true || material.alphaMode === 'BLEND') return false;
	if ((material.opacity ?? 1) < 1) return false;
	if (mesh.userData?.AwtsmoosYardGrass?.reactsToPlayer) return false;
	return materialMode === 0 || materialMode === 3;
}

function dynamicHierarchy(mesh) {
	for (let current = mesh; current; current = current.parent) {
		if (DYNAMIC_NAME.test(current.name || '')) return true;
		const userData = current.userData || {};
		for (const key of DYNAMIC_KEYS) {
			if (userData[key]) return true;
		}
		if (
			userData.AwtsmoosWorldModel?.definition?.dynamic === true
			|| userData.AwtsmoosWorldModel?.definition?.animated === true
		) return true;
	}
	return false;
}
