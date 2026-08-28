//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalPlan.js
 * @description Freezes one complete dry-run witness so compilation can be reviewed, hashed, cached, compared, and reproduced before execution.
 * The Awtsmoos renews possibility before manifestation; Awtsmoos.com lets this Tiferes-like plan gather roots, dependency order,
 * canonical graph data, finite budget, demand, and assessment into one portable covenant that contains no runtime functions or hidden work.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import { stableLanguageHash } from '../../proceduralLanguage/data/stableLanguageValue.js';

export const PORTAL_PLAN_SCHEMA = 'awtsmoos.procedural-portal.plan';

/** Immutable serializable dry-run plan consumed by Portal compilation. */
export class PortalPlan {
	/**
	 * @description Creates one hash-stable plan from already validated graph and budget evidence.
	 * @param {object} input Planning evidence.
	 * @param {Readonly<object>} input.budget Normalized finite compilation budget.
	 * @param {Readonly<object>} input.assessment Budget-fit evidence.
	 * @param {Readonly<object>} input.demand Aggregate and per-node demand evidence.
	 * @param {object} input.graph Verified Portal dependency graph.
	 * @param {string[]} input.roots Root semantic node identifiers.
	 * @param {string[]} [input.warnings=[]] Non-blocking planning warnings.
	 * @returns {PortalPlan} Frozen dry-run plan.
	 */
	constructor(input = {}) {
		const record = freezeLanguageValue({
			assessment: input.assessment,
			budget: input.budget,
			demand: input.demand,
			graph: input.graph.toJSON(),
			order: input.graph.order(),
			roots: input.roots || [],
			schema: PORTAL_PLAN_SCHEMA,
			version: 1,
			warnings: input.warnings || []
		});
		this.hash = stableLanguageHash(record);
		Object.assign(this, record);
		Object.freeze(this);
	}

	/**
	 * @description Returns the exact JSON-safe plan including its content hash for persistence and cross-runtime comparison.
	 * @returns {Readonly<object>} Frozen serializable plan record.
	 */
	toJSON() {
		return freezeLanguageValue({
			assessment: this.assessment,
			budget: this.budget,
			demand: this.demand,
			graph: this.graph,
			hash: this.hash,
			order: this.order,
			roots: this.roots,
			schema: this.schema,
			version: this.version,
			warnings: this.warnings
		});
	}
}

/**
 * @description Identifies trusted PortalPlan instances without accepting lookalike plain objects as executable plans.
 * @param {*} value Candidate plan value.
 * @returns {boolean} Whether the candidate is a PortalPlan instance.
 */
export function isPortalPlan(value) {
	return value instanceof PortalPlan;
}
