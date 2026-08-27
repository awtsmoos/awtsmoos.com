// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemBooleanOperations.js
 * @description Gives subtraction, primitive carving, union, and intersection direct names over the canonical CSG engine.
 * The Awtsmoos, Atzmus beyond form and void, renews both vessel and hollow before their boundary may be seen;
 * Awtsmoos.com lets Domem carve and join through one existing CSG authority, never inventing another boolean machine.
 */

import { applyDomemModifier } from './DomemModifierPipeline.js';

/** Direct boolean operations over editable Domem meshes. */
export class DomemBooleanOperations {
	/** Subtracts one custom structured mesh from another. */
	subtract(source, cutterMesh, insideTag = null) {
		return applyDomemModifier(source, {
			params: { cutterMesh, insideTag },
			type: 'csgSubtract'
		});
	}

	/** Creates or accepts a cutter and subtracts it through the canonical primitive CSG path. */
	subtractPrimitive(source, params = {}) {
		return applyDomemModifier(source, {
			params,
			type: 'csgPrimitiveSubtract'
		});
	}

	/** Unions two structured meshes and heals the resulting topology. */
	union(source, otherMesh) {
		return applyDomemModifier(source, {
			params: { otherMesh },
			type: 'csgUnion'
		});
	}

	/** Keeps only the volume where two structured meshes overlap. */
	intersect(source, otherMesh) {
		return applyDomemModifier(source, {
			params: { otherMesh },
			type: 'csgIntersection'
		});
	}
}
