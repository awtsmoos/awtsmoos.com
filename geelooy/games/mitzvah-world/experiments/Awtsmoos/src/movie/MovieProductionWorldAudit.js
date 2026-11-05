// B"H
// Boruch Hashem
// Blessed is He

/** Rejects visible fallback world surfaces while allowing real GLTF assets and atmosphere shaders. */
import {
	materialList,
	materialUsesFallback,
	realMaterialImages
} from './MovieProductionTextureEvidence.js';

export function auditMovieProductionWorld(runtime) {
	const violations = [];
	let meshes = 0;
	let texturedMaterials = 0;
	visit(runtime?.scene, [], (node, ancestors) => {
		if (!node.isMesh && !node.isSkinnedMesh) return;
		if (insideChossid(node, ancestors)) return;
		meshes += 1;
		auditPrimitive(node, violations);
		for (const material of materialList(node.material)) {
			if (materialUsesFallback(material)) {
				violations.push(issue('PROCEDURAL_MATERIAL_FALLBACK', node, material));
				continue;
			}
			if (realMaterialImages(material).length) {
				texturedMaterials += 1;
				continue;
			}
			if (!approvedAsset(ancestors) && !approvedAtmosphere(node, ancestors)) {
				violations.push(issue('SOLID_WORLD_MATERIAL', node, material));
			}
		}
	});
	return Object.freeze({
		meshes,
		ready: violations.length === 0,
		texturedMaterials,
		violations: Object.freeze(violations)
	});
}

function auditPrimitive(node, violations) {
	const data = node.userData || {};
	const family = String(data.family || '');
	if (data.bootstrapVisual || /movie-procedural-character/i.test(family)) {
		violations.push(issue('PRODUCTION_PRIMITIVE_VISIBLE', node, node.material));
	}
}

function insideChossid(node, ancestors) {
	return Boolean(node.userData?.realChossid || [...ancestors, node].some(item => {
		const data = item.userData || {};
		return data.AwtsmoosCinemaChossid || data.AwtsmoosCanonicalPlayer;
	}));
}

function approvedAsset(ancestors) {
	return ancestors.some(node => {
		const load = node.userData?.isolatedModelLoad;
		return Boolean(load?.resolvedUrl && load.fallback !== true);
	});
}

function approvedAtmosphere(node, ancestors) {
	return Boolean(node.material?.texturePolicy?.proceduralSky)
		|| [...ancestors, node].some(item => item.userData?.AwtsmoosSky);
}

function visit(node, ancestors, callback) {
	if (!node || node.visible === false) return;
	callback(node, ancestors);
	const next = [...ancestors, node];
	for (const child of node.children || []) visit(child, next, callback);
}

function issue(code, node, material) {
	return Object.freeze({ code, material: material?.name || null, path: node?.name || null });
}
