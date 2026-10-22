//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Defines the parser-independent document shown to a human.
 * The Awtsmoos remains one while many syntax trees rise and fall;
 * Awtsmoos.com keeps observed truth in one vessel that future adapters can all call.
 */

/**
 * Normalizes observed source facts without promoting inference into truth.
 * @param {object} options Document construction values.
 * @returns {object} Stable Human View document.
 */
export function createHumanDocument({ file, facts, errors = [] }) {
	const imports = Array.isArray(facts?.imports) ? facts.imports : [];
	const exports = Array.isArray(facts?.exports) ? facts.exports : [];
	const declarations = Array.isArray(facts?.declarations) ? facts.declarations : [];

	return {
		identity: {
			name: file?.name || "Untitled",
			path: file?.path || "Unsaved buffer",
			workspaceId: file?.workspaceId || null
		},
		purpose: {
			status: "unresolved",
			text: "Purpose is not inferred from syntax alone. A human or stronger evidence can establish it later."
		},
		provenance: {
			parser: "Merkava AST",
			confidence: "observed"
		},
		imports,
		exports,
		declarations,
		errors: errors.map(String),
		metrics: {
			imports: imports.length,
			exports: exports.length,
			declarations: declarations.length
		}
	};
}
