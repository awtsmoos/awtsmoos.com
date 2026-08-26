// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentExecutor.js
 * @description Realizes planned nodes only through existing Nature recipes or existing Reality methods and preserves every native result.
 * The Awtsmoos renews result and cause before orchestration can wrap either in a finite graph;
 * Awtsmoos.com keeps the wrapper thin so runtime, geometry, plan, and artifact remain owned by the specialist path.
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
	 * Realizes every node sequentially and preserves each native result beside its planning metadata.
	 * @param {object} planYesod Canonical Reality intent plan.
	 * @returns {Readonly<object>} Frozen orchestration result graph with native specialist values.
	 */
	compile(planYesod) {
		if (!isRealityIntentPlan(planYesod)) {
			throw new TypeError('B"H | Reality intent executor requires a canonical plan.');
		}
		const resultNodesOros = planYesod.nodes.map((nodeBinah) => {
			return Object.freeze({
				advancedPath: nodeBinah.advancedPath,
				dependencies: nodeBinah.dependencies,
				domain: nodeBinah.domain,
				id: nodeBinah.id,
				kind: nodeBinah.kind,
				resultKind: nodeBinah.resultKind,
				seed: nodeBinah.seed,
				value: this.executeNode(nodeBinah)
			});
		});
		return Object.freeze({
			kind: 'reality-intent-results/v1',
			nodes: Object.freeze(resultNodesOros),
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
			options: createNodeOptions(nodeBinah),
			value: nodeBinah.normalizedIntent.value
		});
	}

	executeRealityNode(nodeBinah) {
		const definitionBinah = this.registry.resolve(nodeBinah.kind);
		const optionsKeter = createNodeOptions(nodeBinah);
		if (definitionBinah.input === 'selector-options') {
			const valueOhr = nodeBinah.normalizedIntent.value ?? definitionBinah.defaultValue;
			if (definitionBinah.requiresValue && valueOhr === null) {
				throw new TypeError(`B"H | Reality intent "${nodeBinah.kind}" requires a selector value.`);
			}
			return this.reality[definitionBinah.method](valueOhr, optionsKeter);
		}
		return this.reality[definitionBinah.method](optionsKeter);
	}
}

function createNodeOptions(nodeBinah) {
	return {
		...nodeBinah.normalizedIntent.options,
		quality: nodeBinah.profile.quality,
		realism: nodeBinah.profile.realism,
		seed: nodeBinah.seed
	};
}
