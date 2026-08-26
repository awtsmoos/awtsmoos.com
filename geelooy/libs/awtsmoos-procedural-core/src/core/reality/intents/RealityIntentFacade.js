// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentFacade.js
 * @description Gives Reality one progressive-disclosure doorway for explain, plan, compile, make, scene, preset, alias, and intent discovery.
 * The Awtsmoos renews the whispered request and the realized world before either can stand alone;
 * Awtsmoos.com lets Daas reveal the route while every specialist authority remains seated upon its own throne.
 */
import {
	listRealityIntentKinds
} from './RealityIntentDescriptor.js';
import { realityIntentAliases } from './RealityIntentAliases.js';
import { TiferesRealityIntentExecutor } from './RealityIntentExecutor.js';
import {
	createRealityIntentPlan,
	isRealityIntentPlan
} from './RealityIntentPlan.js';
import { createRealityIntentRegistry } from './RealityIntentRegistry.js';
import { listRealityIntentPresets } from './RealityIntentPresets.js';
import { createRealitySceneBuilder } from './RealitySceneBuilder.js';

/** Progressive Reality intent service composed only from canonical registries, planners, and executors. */
export class RealityIntentFacade {
	constructor(realityYesod) {
		this.reality = realityYesod;
		this.registry = createRealityIntentRegistry();
		this.executor = new TiferesRealityIntentExecutor(realityYesod, this.registry);
		Object.freeze(this);
	}

	/**
	 * Produces the canonical non-heavy plan for one or many intents.
	 * @param {unknown} inputOhr String, object, preset request, or nested intent array.
	 * @param {object} [optionsKeter={}] Root seed, quality, and realism overrides.
	 * @returns {Readonly<object>} Immutable JSON-safe Reality intent plan.
	 */
	plan(inputOhr, optionsKeter = {}) {
		return createRealityIntentPlan(
			this.reality,
			this.registry,
			inputOhr,
			optionsKeter
		);
	}

	/**
	 * Explains exactly what Reality would execute without realizing any native result.
	 * @param {unknown} inputOhr Any supported Reality intent input.
	 * @param {object} [optionsKeter={}] Root profile overrides.
	 * @returns {Readonly<object>} Same canonical plan returned by `plan`.
	 */
	explain(inputOhr, optionsKeter = {}) {
		return this.plan(inputOhr, optionsKeter);
	}

	/**
	 * Realizes an existing plan or first plans ordinary intent input, preserving every native specialist result.
	 * @param {unknown} inputOhr Canonical plan or supported Reality intent input.
	 * @param {object} [optionsKeter={}] Root profile options used only when planning is required.
	 * @returns {Readonly<object>} Immutable orchestration result graph containing native values.
	 */
	compile(inputOhr, optionsKeter = {}) {
		const planYesod = isRealityIntentPlan(inputOhr)
			? inputOhr
			: this.plan(inputOhr, optionsKeter);
		return this.executor.compile(planYesod);
	}

	/**
	 * Realizes the simplest intent form and returns the native value for a single node.
	 * @param {unknown} inputOhr Supported Reality intent input.
	 * @param {object} [optionsKeter={}] Root profile overrides.
	 * @returns {unknown} Native result for one node, otherwise the multi-node result graph.
	 */
	make(inputOhr, optionsKeter = {}) {
		return this.executor.make(this.plan(inputOhr, optionsKeter));
	}

	/** Creates an immutable fluent builder using the same planner and executor. */
	scene(defaultsKelim = {}) {
		return createRealitySceneBuilder(this, defaultsKelim);
	}

	/** Lists exact installed scene preset names. */
	presets() {
		return listRealityIntentPresets();
	}

	/** Lists every currently executable Nature or Reality intent kind. */
	intents() {
		return listRealityIntentKinds(this.reality, this.registry);
	}

	/** Returns immutable exact kind and phrase alias evidence. */
	aliases() {
		return realityIntentAliases();
	}
}
