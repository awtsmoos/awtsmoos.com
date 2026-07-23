// B"H
// Boruch Hashem
// Blessed is He
/** Tree planning preserves invalid input as diagnostics instead of throwing. */

import { hashCanonicalValue } from "../../foundation/canonical/index.js";
import { compileUniversalNodeTreePlan } from "../compileUniversalNodeTreePlan.js";

function normalizedTree(input) {
	const nodes = Object.freeze((input.nodes ?? []).map((node) => Object.freeze({
		id: node.id,
		type: node.type,
		inputs: Object.freeze({ ...(node.inputs ?? {}) }),
		config: Object.freeze({ ...(node.config ?? {}) })
	})));
	const links = Object.freeze((input.links ?? []).map((link) => Object.freeze({
		id: link.id,
		from: Object.freeze({ ...link.from }),
		to: Object.freeze({ ...link.to })
	})));
	return Object.freeze({
		id: input.id ?? `open-tree:${hashCanonicalValue({ nodes, links }).slice(0, 16)}`,
		kind: input.kind ?? "mixed",
		nodes,
		links,
		contentHash: hashCanonicalValue({ kind: input.kind, nodes, links })
	});
}

/** Returns a canonical plan or a diagnostic fallback plan. */
export function planOpenGraphTree(input, surface, options) {
	try {
		return compileUniversalNodeTreePlan(input, {
			...options,
			definitionRegistry: surface.registry
		});
	} catch (error) {
		return Object.freeze({
			tree: normalizedTree(input),
			zones: Object.freeze(input.zones ?? []),
			interfaceItems: Object.freeze(input.interfaceItems ?? []),
			diagnostics: Object.freeze([{
				code: error.code ?? "OPEN_NODE_TREE_PLAN_FAILED",
				message: error.message
			}])
		});
	}
}
