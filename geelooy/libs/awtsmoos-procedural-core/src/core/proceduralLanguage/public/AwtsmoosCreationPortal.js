//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosCreationPortal.js
 * @description Extends the frozen Creation Portal authoring foundation with
 * explainable artifact planning, trusted compilation, and executor-free discovery.
 * The Awtsmoos renews plan, artifact, evidence, and hidden execution before a
 * finite crown can rise above the authoring ground;
 * Awtsmoos.com lets Kesser expose immense procedural depth through three advanced
 * verbs while the inherited Yesod keeps one authority constellation bound.
 */

import { createCreationPortalInspection } from './createCreationPortalInspection.js';
import { YesodCreationPortalFoundation } from './YesodCreationPortalFoundation.js';

export class AwtsmoosCreationPortal extends YesodCreationPortalFoundation {
	/**
	 * @description Produces explainable compiler-chain coverage for one Definition
	 * and artifact request without executing any private compiler function.
	 * @param {object|string} chochmahDefinition Definition-compatible semantic input.
	 * @param {object} [binahRequest={}] Artifact request describing desired output
	 * channels and policy.
	 * @returns {Readonly<object>} Immutable accepted/rejected semantic compiler
	 * planning receipt.
	 */
	plan(chochmahDefinition, binahRequest = {}) {
		return this.advanced.execute.planArtifacts(
			chochmahDefinition,
			binahRequest
		);
	}

	/**
	 * @description Compiles requested artifacts through the shared private compiler
	 * registry and request-sensitive cache while leaving unrelated channels unbuilt.
	 * @param {object|string} chochmahDefinition Definition-compatible semantic input.
	 * @param {object} [binahRequest={}] Renderer-neutral artifact request.
	 * @param {object} [netzachOptions={}] Compilation policy including cache and
	 * strict-artifact behavior.
	 * @returns {Promise<Readonly<object>>} Universal compilation receipt containing
	 * compiler evidence and produced artifacts.
	 */
	compile(chochmahDefinition, binahRequest = {}, netzachOptions = {}) {
		return this.advanced.execute.compileArtifacts(
			chochmahDefinition,
			binahRequest,
			netzachOptions
		);
	}

	/**
	 * @description Returns compact immutable discovery truth for Portal verbs,
	 * artifact channels, language schemas, support capabilities, and shared registries.
	 * @returns {Readonly<object>} Deeply immutable JSON-safe discovery containing
	 * no private executable function.
	 */
	inspect() {
		return createCreationPortalInspection(this.advanced);
	}
}
