// B"H
// Boruch Hashem
// Blessed is He
/**
 * A finite vessel protects generative abundance. The Awtsmoos reveals each
 * resource dimension so Awtsmoos.com optimizes without silent semantic loss.
 */

/** Estimates semantic and compiled creature resource usage. */
export function estimateCreatureBudget(creature, artifacts = null) {
	const meshParts = artifacts?.mesh?.parts || [];
	return Object.freeze({
		parts: creature.parts.length + creature.limbs.length + 1,
		bones: artifacts?.yetzirahRig?.bones?.length || 0,
		vertices: meshParts.reduce(
			(sum, part) => sum + (part.positions?.length || 0) / 3,
			0
		),
		triangles: meshParts.reduce(
			(sum, part) => sum + (part.indices?.length || 0) / 3,
			0
		),
		materialLayers: creature.materialLayers.length,
		textureBytes: artifacts?.memoryReport?.textureBytes || 0,
		maximumSkinInfluences: artifacts?.skinning?.maximumInfluences || 0,
		compileMilliseconds: artifacts?.memoryReport?.compileMilliseconds || 0,
		temporaryBytes: artifacts?.memoryReport?.temporaryBytes || 0
	});
}

/** Validates every declared budget ceiling. */
export function validateCreatureBudget(usage, limits = {}) {
	const exceeded = Object.entries(limits).filter(
		([name, limit]) => Number.isFinite(limit)
			&& Number(usage[name] || 0) > limit
	).map(([name]) => name);
	return Object.freeze({
		ok: exceeded.length === 0,
		usage,
		limits: Object.freeze({ ...limits }),
		exceeded: Object.freeze(exceeded),
		diagnostics: Object.freeze(exceeded.map((dimension) => ({
			code: "CREATURE.BUDGET_EXCEEDED",
			severity: "error",
			dimension,
			actual: usage[dimension],
			limit: limits[dimension]
		})))
	});
}

/** Suggests bounded optimization without mutating authoritative anatomy. */
export function optimizeCreatureBudget(usage, limits = {}) {
	const report = validateCreatureBudget(usage, limits);
	return Object.freeze({
		...report,
		suggestions: Object.freeze(report.exceeded.map((dimension) => {
			if (dimension === "bones") {
				return "Reduce secondary-motion or repeated limb chains.";
			}
			if (dimension === "triangles" || dimension === "vertices") {
				return "Lower compile quality or select a lower LOD.";
			}
			if (dimension === "materialLayers") {
				return "Merge compatible semantic material layers.";
			}
			return `Reduce ${dimension}.`;
		}))
	});
}
