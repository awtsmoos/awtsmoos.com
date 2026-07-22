// B"H
// Boruch Hashem
// Blessed is He
/**
 * Parity is reported, never implied. The Awtsmoos lets Awtsmoos.com preserve
 * every node while naming which nodes have representation, execution, and
 * independently implemented numerical semantics.
 */
import { compileUniversalNodeTreePlan } from "./compileUniversalNodeTreePlan.js";

/** Produces exact per-family and per-node capability evidence. */
export function createNodeParityReport(input, options = {}) {
	const plan = compileUniversalNodeTreePlan(input, options);
	const families = {};
	for (const node of plan.nodes) {
		const family = node.metadata?.family ?? node.type.split(".")[0];
		const entry = families[family] ??= {
			represented: 0,
			executable: 0,
			nativeSemantics: 0
		};
		entry.represented += 1;
		entry.executable += Number(node.executionSupported);
		entry.nativeSemantics += Number(node.nativeSemantics);
	}
	return Object.freeze({
		treeId: plan.tree.id,
		kind: plan.tree.kind,
		coverage: plan.coverage,
		families: Object.freeze(Object.fromEntries(
			Object.entries(families).map(([name, value]) => [name, Object.freeze(value)])
		)),
		missingExecution: Object.freeze(plan.nodes
			.filter(node => !node.executionSupported)
			.map(node => node.type)),
		missingNativeSemantics: Object.freeze(plan.nodes
			.filter(node => !node.nativeSemantics)
			.map(node => node.type)),
		diagnostics: plan.diagnostics
	});
}
