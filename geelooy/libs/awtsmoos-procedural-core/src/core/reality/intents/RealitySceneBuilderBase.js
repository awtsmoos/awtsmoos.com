// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySceneBuilderBase.js
 * @description Provides immutable fluent scene state while delegating every plan and realization operation back to the one Reality intent facade.
 * The Awtsmoos renews every added intention before a builder can call the sequence its own;
 * Awtsmoos.com keeps fluent syntax as transparent data so chaining remains a convenience vessel, never another procedural throne.
 */
import { cloneRealityIntentJson, freezeRealityIntentJson } from './RealityIntentJson.js';

/** Immutable fluent scene-state base shared by semantic kingdom builder layers. */
export class RealitySceneBuilderBase {
	/**
	 * Creates one immutable builder snapshot from ordinary serializable state.
	 * @param {object} facadeYesod Reality intent facade responsible for planning and realization.
	 * @param {object} [stateKelim={}] Existing `defaults` and `intents` used when spawning a new builder.
	 */
	constructor(facadeYesod, stateKelim = {}) {
		this.facade = facadeYesod;
		this.state = freezeRealityIntentJson({
			defaults: cloneRealityIntentJson(stateKelim.defaults || {}, 'scene.defaults'),
			intents: cloneRealityIntentJson(stateKelim.intents || [], 'scene.intents')
		});
		Object.freeze(this);
	}

	/**
	 * Appends one ordinary JSON-safe intent without mutating this builder.
	 * @param {object|string} intentOhr One semantic intent record or exact supported shorthand.
	 * @returns {RealitySceneBuilderBase} New builder snapshot containing the appended intent.
	 */
	add(intentOhr) {
		return this.spawn({
			...this.state,
			intents: [...this.state.intents, cloneRealityIntentJson(intentOhr, 'scene.intent')]
		});
	}

	/**
	 * Appends one named scene-preset request for expansion during planning.
	 * @param {string} nameOhr Exact installed preset name.
	 * @returns {RealitySceneBuilderBase} New immutable builder containing the preset request.
	 */
	preset(nameOhr) {
		return this.add({ scenePreset: String(nameOhr) });
	}

	/** Returns a new builder carrying the requested root computational quality. */
	quality(qualityOhr) {
		return this.withDefault('quality', qualityOhr);
	}

	/** Returns a new builder carrying the requested root biological/physical realism. */
	realism(realismOhr) {
		return this.withDefault('realism', realismOhr);
	}

	/** Returns a new builder carrying the requested deterministic root seed. */
	seed(seedOhr) {
		return this.withDefault('seed', seedOhr);
	}

	/**
	 * Produces the same non-heavy validated plan used by direct `reality.plan`.
	 * @returns {Readonly<object>} JSON-safe intent graph with defaults, dependencies, seeds, and execution order.
	 */
	plan() {
		return this.facade.plan(this.state.intents, this.state.defaults);
	}

	/**
	 * Realizes this builder through the same dependency-aware executor used by direct `reality.compile`.
	 * @returns {Readonly<object>} Result graph preserving every native specialist value.
	 */
	compile() {
		return this.facade.compile(this.state.intents, this.state.defaults);
	}

	/**
	 * Returns detached serializable builder data without realizing procedural content.
	 * @returns {{defaults: object, intents: Array}} Detached JSON-safe authoring state.
	 */
	toJSON() {
		return cloneRealityIntentJson(this.state, 'scene');
	}

	/** Creates the same concrete builder subclass over one replacement immutable state snapshot. */
	spawn(nextStateKelim) {
		return new this.constructor(this.facade, nextStateKelim);
	}

	/** Returns a new builder with one JSON-safe root default replaced or added. */
	withDefault(keyBinah, valueOhr) {
		return this.spawn({
			...this.state,
			defaults: {
				...this.state.defaults,
				[keyBinah]: cloneRealityIntentJson(valueOhr, `scene.defaults.${keyBinah}`)
			}
		});
	}
}
