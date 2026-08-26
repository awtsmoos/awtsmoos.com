// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldRealismReceiptParts.js
 * @description Shapes mounted house, mountain, tree, vegetation, terrain, and water evidence for Movie Maker preflight.
 * The Awtsmoos renews home, ridge, root, grass, lake, and current before a finite receipt can count them;
 * Awtsmoos.com keeps formatting separate from the strict readiness law so each source authority remains singular.
 */

export function movieHouseReceipt(system, diagnostics = {}) {
	return Object.freeze({
		doors: Number(diagnostics.doors || 0),
		houses: Number(diagnostics.houses || 0),
		materialsReady: Number(diagnostics.materialsReady || 0),
		mounted: Boolean(system?.group?.parent === system?.runtime?.scene),
		rooms: Number(diagnostics.rooms || 0),
		stairs: Number(diagnostics.stairs || 0)
	});
}

export function movieMountainReceipt(value) {
	return Object.freeze({
		activeMaterialLayers: Number(value.activeMaterialLayers || 0),
		belts: Number(value.belts || 0),
		layeredMaterials: value.layeredMaterials === true,
		meshes: Number(value.meshes || 0),
		mounted: value.mounted === true,
		placementModel: value.placementModel || null,
		snowCaps: Number(value.snowCaps || 0)
	});
}

export function movieTerrainReceipt(water) {
	return Object.freeze({
		lakeVertices: Number(water.lakeVertices || 0),
		riverVertices: Number(water.riverVertices || 0)
	});
}

export function movieTreeReceipt(trees) {
	return Object.freeze({
		authority: trees.authority || null,
		ecologyTaggedTrees: Number(trees.ecologyTaggedTrees || 0),
		mounted: trees.mounted === true,
		trees: Number(trees.trees || 0),
		visibleTrees: Number(trees.visibleTrees || 0)
	});
}

export function movieVegetationReceipt(value) {
	return Object.freeze({
		clumps: Number(value.clumps || 0),
		mounted: value.mounted === true,
		visibleCells: Number(value.visibleCells || 0)
	});
}

export function movieWaterReceipt(water) {
	return Object.freeze({
		activeNormalSources: Number(water.activeNormalSources || 0),
		flowLayers: Number(water.flowLayers || 0),
		lakeVertices: Number(water.lakeVertices || 0),
		normalMode: water.normalMode || null,
		physicalShader: water.physicalShader || null,
		riverVertices: Number(water.riverVertices || 0),
		shader: water.shader || null,
		waterMeshes: Number(water.waterMeshes || 0)
	});
}
