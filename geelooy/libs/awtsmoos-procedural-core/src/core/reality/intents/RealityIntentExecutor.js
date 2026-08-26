// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentExecutor.js
 * @description Realizes validated Reality plans in dependency order while preserving authored node order and every native specialist result.
 * The Awtsmoos renews result and cause before orchestration can claim that one preceded the other;
 * Awtsmoos.com executes only after graph law is known, then returns status, order, metadata, and native vessels without stealing the specialist's cover.
 */
import { isRealityIntentPlan } from './RealityIntentPlan.js';

/** Realizes immutable Reality intent plans without owning any procedural generation algorithm. */
export class TiferesRealityIntentExecutor {
	constructor(realityYesod, registryYesod) {
		this.reality = realityYesod;
		this.registry = registryYesod;
		Object.freeze(this);
	}

	/**
	 * Realizes every node in dependency-safe order and returns wrappers in authored plan order.
	 * @param {object} planYesod Canonical Reality intent plan.
	 * @returns {Readonly<object>} Immutable result graph preserving each native specialist value.
	 */
	compile(planYesod) {
		if (!isRealityIntentPlan(planYesod)) {
			throw new TypeError('B"H | Reality intent executor requires a canonical plan.');
		}
		const nodesByIdYesod = Object.fromEntries(
			planYesod.nodes.map((nodeBinah) => [nodeBinah.id, nodeBinah])
		);
		const resultsByIdMalchus = Object.create(null);
		planYesod.executionOrder.forEach((idYesod, executionIndexNetzach) => {
			const nodeBinah = nodesByIdYesod[idYesod];
			resultsByIdMalchus[idYesod] = createResultNode(
				nodeBinah,
				this.executeNode(nodeBinah),
				executionIndexNetzach
			);
		});
		const resultNodesOros = Object.freeze(
			planYesod.nodes.map((nodeBinah) => resultsByIdMalchus[nodeBinah.id])
		);
		return Object.freeze({
			executionOrder: planYesod.executionOrder,
			kind: 'reality-intent-results/v1',
			nodes: resultNodesOros,
			plan: planYesod,
			version: 1
		});
	}

	/** Realizes one planned node through its declared canonical owner. */
	executeNode(nodeBinah) {
		if (nodeBinah.executor === 'nature') {
			return this.executeNatureNode(nodeBinah);
		}
		return this.executeRealityNode(nodeBinah);
	}

	/** Returns the native value for one-node plans, otherwise the full result graph. */
	make(planYesod) {
		const resultsMalchus = this.compile(planYesod);
		return resultsMalchus.nodes.length === 1
			? resultsMalchus.nodes[0].value
			: resultsMalchus;
	}

	executeNatureNode(nodeBinah) {
		return this.reality.advanced.nature.create({
			id: nodeBinah.id,
			kind: nodeBinah.kind,
			options: nodeBinah.options,
			value: nodeBinah.normalizedIntent.value
		});
	}

	executeRealityNode(nodeBinah) {
		const definitionBinah = this.registry.resolve(nodeBinah.kind);
		if (definitionBinah.input === 'selector-options') {
			const valueOhr = nodeBinah.normalizedIntent.value ?? definitionBinah.defaultValue;
			if (definitionBinah.requiresValue && valueOhr === null) {
				throw new TypeError(`B"H | Reality intent "${nodeBinah.kind}" requires a selector value.`);
			}
			return this.reality[definitionBinah.method](valueOhr, nodeBinah.options);
		}
		return this.reality[definitionBinah.method](nodeBinah.options);
	}
}

function createResultNode(nodeBinah, valueOhr, executionIndexNetzach) {
	return Object.freeze({
		advancedPath: nodeBinah.advancedPath,
		dependencies: nodeBinah.dependencies,
		domain: nodeBinah.domain,
		executionIndex: executionIndexNetzach,
		id: nodeBinah.id,
		kind: nodeBinah.kind,
		resultKind: nodeBinah.resultKind,
		seed: nodeBinah.seed,
		status: 'fulfilled',
		value: valueOhr
	});
}
