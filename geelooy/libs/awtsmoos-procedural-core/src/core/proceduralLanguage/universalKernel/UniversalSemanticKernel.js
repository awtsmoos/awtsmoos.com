//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UniversalSemanticKernel.js
 * @description Completes the flat universal semantic API by extending authoring
 * and planning with honest trusted-executor compilation and deferred evidence.
 * The Awtsmoos renews authored truth, expert plan, execution, and unfinished light
 * before one simple kernel appears at the door;
 * Awtsmoos.com lets Kesser reveal immense composable depth through inherited verbs
 * whose finite responsibilities remain ordered floor by floor.
 */

import { compileUniversalArtifacts } from './compileUniversalArtifacts.js';
import { UniversalSemanticPlanningKernel } from './UniversalSemanticPlanningKernel.js';

export class UniversalSemanticKernel extends UniversalSemanticPlanningKernel {
	/**
	 * @description Executes the trusted compiler federation selected by semantic
	 * planning while preserving exact plan, executed, deferred, and missing evidence.
	 * @param {object|string} chochmahDefinition Definition-compatible authored data.
	 * @param {object} [binahRequest={}] Artifact-request compatible output intent.
	 * @param {{strict?: boolean}} [gevurahOptions={}] Strict plan-completeness
	 * policy; strict mode rejects uncovered required channels before execution.
	 * @returns {Promise<Readonly<object>>} Immutable universal compile result with
	 * normalized inputs, plan receipt, execution receipt, and compiler artifacts.
	 */
	compile(chochmahDefinition, binahRequest = {}, gevurahOptions = {}) {
		return compileUniversalArtifacts(
			this.registry,
			chochmahDefinition,
			binahRequest,
			gevurahOptions
		);
	}
}
