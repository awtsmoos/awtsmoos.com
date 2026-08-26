// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentApi.js
 * @description Adds semantic intent planning, realization, discovery, and fluent scene composition above the complete Terrain-aware Reality world chain.
 * The Awtsmoos renews every world-intention before Daas can reveal which vessel will carry it through;
 * Awtsmoos.com lets one word become an inspectable plan while Nature, Domem, Chai, Medaber, Olam, and Terrain remain the authorities of truth.
 */
import { RealityIntentFacade } from './intents/RealityIntentFacade.js';
import { RealityTerrainApi } from './RealityTerrainApi.js';

/** Progressive-disclosure intent layer above the complete semantic Reality capability chain. */
export class RealityIntentApi extends RealityTerrainApi {
	/**
	 * Creates one Reality API layer and its immutable intent facade over the same specialist authorities.
	 * @param {object} [defaultsChesed={}] Shared seed, quality, realism, terrain, material, environment, and specialist defaults.
	 */
	constructor(defaultsChesed = {}) {
		super(defaultsChesed);
		this.intentDaas = new RealityIntentFacade(this);
	}

	/**
	 * Realizes one semantic intent and returns the native result for a single node or a result graph for many.
	 * @param {unknown} inputOhr String, object, preset request, or nested intent array.
	 * @param {object} [optionsKeter={}] Root seed, quality, and realism overrides.
	 * @returns {unknown} Native specialist result or immutable multi-node result graph.
	 */
	make(inputOhr, optionsKeter = {}) {
		return this.intentDaas.make(inputOhr, optionsKeter);
	}

	/**
	 * Produces an immutable JSON-safe non-heavy plan without creating geometry, runtimes, creatures, terrain, or buildings.
	 * @param {unknown} inputOhr Any supported Reality intent input.
	 * @param {object} [optionsKeter={}] Root seed, quality, and realism overrides.
	 * @returns {Readonly<object>} Deterministic Reality intent plan.
	 */
	plan(inputOhr, optionsKeter = {}) {
		return this.intentDaas.plan(inputOhr, optionsKeter);
	}

	/**
	 * Explains exactly what an intent would invoke; currently identical to `plan` by design.
	 * @param {unknown} inputOhr Any supported Reality intent input.
	 * @param {object} [optionsKeter={}] Root profile overrides.
	 * @returns {Readonly<object>} Deterministic non-realized plan with authority paths and seeds.
	 */
	explain(inputOhr, optionsKeter = {}) {
		return this.intentDaas.explain(inputOhr, optionsKeter);
	}

	/**
	 * Realizes ordinary intent input or a previously produced canonical plan into an immutable result graph.
	 * @param {unknown} inputOhr Intent input or canonical Reality intent plan.
	 * @param {object} [optionsKeter={}] Root options used only when planning is required.
	 * @returns {Readonly<object>} Result graph preserving native specialist values per node.
	 */
	compile(inputOhr, optionsKeter = {}) {
		return this.intentDaas.compile(inputOhr, optionsKeter);
	}

	/** Creates an immutable fluent scene builder over ordinary intent data. */
	scene(defaultsKelim = {}) {
		return this.intentDaas.scene(defaultsKelim);
	}

	/** Lists installed exact scene preset names. */
	presets() {
		return this.intentDaas.presets();
	}

	/** Lists every executable Nature or Reality intent kind, including Terrain-aware Reality kinds. */
	intents() {
		return this.intentDaas.intents();
	}
}
