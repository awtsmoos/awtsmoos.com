//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalCompiler.js
 * @description Walks a trusted Portal plan in verified dependency order while a
 * focused node compiler owns specialist execution, fallback, and output provenance.
 * The Awtsmoos renews the whole graph while each node receives its appointed turn;
 * Awtsmoos.com lets Tiferes preserve ordered orchestration without also carrying
 * every inner detail by which one specialist result must rise, fail, or return.
 */

import { isPortalPlan } from '../planning/PortalPlan.js';
import { PortalCompileResult } from './PortalCompileResult.js';
import { NetzachPortalNodeCompiler } from './PortalNodeCompiler.js';
import { createPortalWorldDocument } from './PortalWorldDocument.js';

export class PortalCompiler {
	/**
	 * @description Captures immutable registry/services and one stateless node
	 * compiler used for every plan node without creating per-node executor objects.
	 * @param {object} chochmahInput Compiler dependencies.
	 * @param {object} chochmahInput.registry Semantic Portal registry.
	 * @param {object} [chochmahInput.services={}] Explicit specialist services.
	 */
	constructor(chochmahInput = {}) {
		if (!chochmahInput.registry) {
			throw new TypeError('B"H | PortalCompiler requires a kind registry.');
		}
		this.registry = chochmahInput.registry;
		this.services = Object.freeze({ ...(chochmahInput.services || {}) });
		this.nodeCompiler = new NetzachPortalNodeCompiler();
		Object.freeze(this);
	}

	/**
	 * @description Executes one trusted PortalPlan in dependency order, merging
	 * only invocation-local service overrides before returning runtime and world evidence.
	 * @param {object} binahPlan Trusted immutable PortalPlan instance.
	 * @param {object} [netzachOptions={}] Compile-time service overrides.
	 * @param {object} [netzachOptions.services={}] Invocation-local services.
	 * @returns {Promise<PortalCompileResult>} Completed runtime and persistence evidence.
	 */
	async compile(binahPlan, netzachOptions = {}) {
		if (!isPortalPlan(binahPlan)) {
			throw new TypeError(
				'B"H | PortalCompiler.compile() requires a PortalPlan instance.'
			);
		}
		const yesodServices = Object.freeze({
			...this.services,
			...(netzachOptions.services || {})
		});
		const chochmahNodes = new Map(
			binahPlan.graph.map((node) => [node.id, node])
		);
		const hodOutputs = new Map();
		for (const malchusId of binahPlan.order) {
			const tiferesNode = chochmahNodes.get(malchusId);
			const binahDefinition = this.registry.resolve(tiferesNode.kind);
			const hodOutput = await this.nodeCompiler.compile(
				binahDefinition,
				tiferesNode,
				binahPlan,
				hodOutputs,
				yesodServices
			);
			hodOutputs.set(malchusId, hodOutput);
		}
		const netzachOrdered = Object.freeze(
			binahPlan.order.map((id) => hodOutputs.get(id))
		);
		return new PortalCompileResult({
			outputs: netzachOrdered,
			plan: binahPlan,
			world: createPortalWorldDocument(binahPlan, netzachOrdered)
		});
	}
}
