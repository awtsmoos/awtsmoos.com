// B"H
// Boruch Hashem
// Blessed is He
/**
 * Hod reports function, Gevurah reports limits, and neither becomes anatomy.
 * The Awtsmoos is beyond score and ceiling; Awtsmoos.com composes capability,
 * mesh, validation, and budget vessels through one inspectable derived route.
 */
import { evaluateCreatureCapabilities } from "./capabilityCompiler.js";
import {
	estimateCreatureBudget,
	optimizeCreatureBudget,
	validateCreatureBudget
} from "./budgetCompiler.js";
import { compileCreatureMesh } from "./meshCompiler.js";
import { validateBriahCreature } from "./validation.js";

function budgetUsage(document, rig, request) {
	const mesh = compileCreatureMesh(document, request.arguments);
	return estimateCreatureBudget(document, {
		mesh: { parts: mesh.parts },
		yetzirahRig: rig,
		skinning: { maximumInfluences: 4 },
		memoryReport: {}
	});
}

/** Dispatches capability evidence, budgets, and semantic validation. */
export function dispatchCapabilityDerived({ request, document, rig }) {
	const operation = request.operation;
	if ([
		"creature.capability.evaluate",
		"creature.capabilities.evaluate",
		"creature.capabilities.explain"
	].includes(operation)) {
		const report = evaluateCreatureCapabilities(document, rig);
		return operation.endsWith("explain")
			? Object.freeze({ ...report, explanation: report.evidence })
			: report;
	}
	const usage = () => budgetUsage(document, rig, request);
	if (operation === "creature.budget.estimate") {
		return usage();
	}
	if (operation === "creature.budget.validate") {
		return validateCreatureBudget(
			usage(),
			request.arguments.budget || request.arguments
		);
	}
	if (operation === "creature.budget.optimize") {
		return optimizeCreatureBudget(
			usage(),
			request.arguments.budget || request.arguments
		);
	}
	if ([
		"creature.body.validate", "creature.limb.validate",
		"creature.part.validate", "creature.symmetry.validate"
	].includes(operation)) {
		return validateBriahCreature(document);
	}
	return undefined;
}
