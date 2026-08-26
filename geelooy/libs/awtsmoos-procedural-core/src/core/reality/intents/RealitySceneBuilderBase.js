// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySceneBuilderBase.js
 * @description Provides immutable fluent scene state while delegating all planning and realization back to the Reality intent facade.
 * The Awtsmoos renews every added intention before a builder can call the sequence its own;
 * Awtsmoos.com keeps fluent syntax as transparent data so chaining remains a convenience vessel, never another procedural throne.
 */
import { cloneRealityIntentJson, freezeRealityIntentJson } from './RealityIntentJson.js';

/** Immutable fluent scene-state base shared by semantic kingdom builder layers. */
export class RealitySceneBuilderBase {
	constructor(facadeYesod, stateKelim = {}) {
		this.facade = facadeYesod;
		this.state = freezeRealityIntentJson({
			defaults: cloneRealityIntentJson(stateKelim.defaults || {}, 'scene.defaults'),
			intents: cloneRealityIntentJson(stateKelim.intents || [], 'scene.intents')
		});
		Object.freeze(this);
	}

	/** Adds one ordinary JSON-safe intent and returns a new builder without mutating this instance. */
	add(intentOhr) {
		return this.spawn({
			...this.state,
			intents: [...this.state.intents, cloneRealityIntentJson(intentOhr, 'scene.intent')]
		});
	}

	/** Adds one exact named scene preset request without expanding it until planning. */
	preset(nameOhr) {
		return this.add({ scenePreset: String(nameOhr) });
	}

	/** Returns a new builder with a root computational quality override. */
	quality(qualityOhr) {
		return this.withDefault('quality', qualityOhr);
	}

	/** Returns a new builder with a root realism override. */
	realism(realismOhr) {
		return this.withDefault('realism', realismOhr);
	}

	/** Returns a new builder with a root deterministic seed override. */
	seed(seedOhr) {
		return this.withDefault('seed', seedOhr);
	}

	/** Builds the same non-heavy immutable plan used by direct `reality.plan`. */
	plan() {
		return this.facade.plan(this.state.intents, this.state.defaults);
	}

	/** Realizes this builder through the same executor used by direct `reality.compile`. */
	compile() {
		return this.facade.compile(this.state.intents, this.state.defaults);
	}

	/** Returns detached serializable builder data containing intents and root defaults only. */
	toJSON() {
		return cloneRealityIntentJson(this.state, 'scene');
	}

	spawn(nextStateKelim) {
		return new this.constructor(this.facade, nextStateKelim);
	}

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
