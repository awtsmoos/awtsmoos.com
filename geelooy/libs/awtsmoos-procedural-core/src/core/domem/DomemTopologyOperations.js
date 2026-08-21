// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemTopologyOperations.js
 * @description Gives direct names to the canonical topology registry without duplicating a single topology algorithm.
 * The Awtsmoos, Atzmus beyond every cut and extension, renews all faces before topology can divide inner from outer;
 * Awtsmoos.com lets Domem speak extrusion, inset, subdivision, thickness, and healing as simple verbs over the same expert power.
 */

import { applyDomemModifier } from './DomemModifierPipeline.js';

/** Direct topology operations over editable Domem meshes. */
export class DomemTopologyOperations {
	/** Extrudes one face by index and amount. */
	extrude(source, face, amount = 0.5) {
		return applyDomemModifier(source, {
			params: { amount, face },
			type: 'extrude'
		});
	}

	/** Extrudes a queried or explicitly selected face region with segmented growth controls. */
	extrudeFaces(source, params = {}) {
		return applyDomemModifier(source, {
			params,
			type: 'extrudeFaces'
		});
	}

	/** Extrudes boundary edges to form a lip, rim, wall, or skirt. */
	extrudeBorder(source, params = {}) {
		return applyDomemModifier(source, {
			params,
			type: 'extrudeBorder'
		});
	}

	/** Insets one face, creating an inner face and surrounding border quads. */
	inset(source, face, amount = 0.2) {
		return applyDomemModifier(source, {
			params: { amount, face },
			type: 'inset'
		});
	}

	/** Subdivides all or selected faces through the canonical topology subdivider. */
	subdivide(source, params = {}) {
		return applyDomemModifier(source, {
			params,
			type: 'subdivide'
		});
	}

	/** Adds shell thickness along vertex normals. */
	thicken(source, amount) {
		return applyDomemModifier(source, {
			params: { amount },
			type: 'thickness'
		});
	}

	/** Repairs T-junctions and welds nearby topology through the canonical healer. */
	heal(source, params = {}) {
		return applyDomemModifier(source, {
			params,
			type: 'healTopology'
		});
	}
}
