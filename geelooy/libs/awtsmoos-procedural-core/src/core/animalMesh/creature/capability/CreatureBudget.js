// B"H
// Boruch Hashem
// Blessed is He
/**
 * Gevurah gives creative expansion a measured vessel. Awtsmoos.com estimates
 * parts, bones, vertices, triangles, layers, texture bytes, skin influences,
 * compile work, and temporary memory before excess can become silent failure.
 */
export const DEFAULT_CREATURE_BUDGET = Object.freeze({
	maximumParts: 256,
	maximumBones: 512,
	maximumVertices: 250000,
	maximumTriangles: 500000,
	maximumMaterialLayers: 32,
	maximumTextureBytes: 268435456,
	maximumSkinInfluences: 4,
	maximumCompileTime: 10000,
	maximumTemporaryMemory: 536870912
});
/** Estimates multidimensional resources in O(1) from compiled counts. */
export function estimateCreatureBudget(creature, rig = null, artifacts = null) {
	const vertices = artifacts?.mesh?.positions?.length ? artifacts.mesh.positions.length / 3 : 0;
	const triangles = artifacts?.mesh?.indices?.length ? artifacts.mesh.indices.length / 3 : 0;
	return Object.freeze({
		parts: creature.parts.length,
		bones: rig?.bones?.length || 0,
		vertices,
		triangles,
		materialLayers: creature.materialLayers.length,
		textureBytes: artifacts?.materials?.estimatedTextureBytes || 0,
		skinInfluences: artifacts?.skinWeights?.maximumInfluences || 0,
		compileTime: artifacts?.memoryReport?.compileTime || 0,
		temporaryMemory: artifacts?.memoryReport?.temporaryMemory || 0
	});
}
/** Validates estimates against caller or default bounds in O(budget dimensions). */
export function validateCreatureBudget(estimate, limits = {}) {
	const budget = { ...DEFAULT_CREATURE_BUDGET, ...limits };
	const checks = [
		["parts", "maximumParts"], ["bones", "maximumBones"],
		["vertices", "maximumVertices"], ["triangles", "maximumTriangles"],
		["materialLayers", "maximumMaterialLayers"], ["textureBytes", "maximumTextureBytes"],
		["skinInfluences", "maximumSkinInfluences"], ["compileTime", "maximumCompileTime"],
		["temporaryMemory", "maximumTemporaryMemory"]
	];
	const violations = checks.filter(([key, limit]) => estimate[key] > budget[limit]).map(([key, limit]) => ({
		code: "CREATURE.BUDGET_EXCEEDED",
		dimension: key,
		actual: estimate[key],
		maximum: budget[limit]
	}));
	return Object.freeze({ valid: violations.length === 0, estimate, limits: Object.freeze(budget), violations });
}
