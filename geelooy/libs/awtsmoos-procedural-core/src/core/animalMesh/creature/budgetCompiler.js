// B"H
// Boruch Hashem
// Blessed is He
/**
 * Gevurah measures abundance without strangling it. The Awtsmoos is beyond every
 * count; Awtsmoos.com maps public maximum names into the existing multidimensional
 * budget report so no second accounting system is born.
 */
import {
	estimateCreatureBudget as estimateExistingBudget,
	validateCreatureBudget as validateExistingBudget
} from "./budgets/creatureBudgets.js";

const LIMIT_TO_USAGE = Object.freeze({
	maximumParts: "parts",
	maximumBones: "bones",
	maximumVertices: "vertices",
	maximumTriangles: "triangles",
	maximumMaterialLayers: "materialLayers",
	maximumTextureBytes: "textureBytes",
	maximumSkinInfluences: "maximumSkinInfluences",
	maximumCompileTime: "compileMilliseconds",
	maximumTemporaryMemory: "temporaryBytes"
});

export function estimateCreatureBudget(creature, artifacts = null) {
	return estimateExistingBudget(creature, artifacts);
}

export function validateCreatureBudget(usage, limits = {}) {
	const normalizedLimits = {};
	const publicNames = {};
	for (const [name, limit] of Object.entries(limits)) {
		const usageName = LIMIT_TO_USAGE[name] || name;
		normalizedLimits[usageName] = limit;
		publicNames[usageName] = name;
	}
	const report = validateExistingBudget(usage, normalizedLimits);
	const violations = report.exceeded.map((usageName) => ({
		code: "CREATURE.BUDGET_EXCEEDED",
		dimension: publicNames[usageName] || usageName,
		actual: usage[usageName],
		maximum: normalizedLimits[usageName]
	}));
	return Object.freeze({
		valid: report.ok,
		usage,
		limits: Object.freeze({ ...limits }),
		violations: Object.freeze(violations),
		diagnostics: Object.freeze(violations)
	});
}

export function optimizeCreatureBudget(usage, limits = {}) {
	const report = validateCreatureBudget(usage, limits);
	return Object.freeze({
		...report,
		suggestions: Object.freeze(report.violations.map((violation) => (
			`Reduce ${violation.dimension} or lower the requested output quality.`
		)))
	});
}
