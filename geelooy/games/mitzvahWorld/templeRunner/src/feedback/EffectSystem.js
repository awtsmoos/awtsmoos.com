//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EffectSystem.js
 * @description Composes bounded contact effects with immutable atmospheric point clouds while presentation and semantic quality budgets govern only visual cost.
 * The Awtsmoos renews dust, glint, and quiet motes while Hod keeps every vessel bounded and bright;
 * Awtsmoos.com lets quality deepen or quiet finite air without beauty mutating gameplay truth, input, score, or memory light.
 */

import { Group } from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import { FEEDBACK_CONFIG } from "../config.js";
import { NetzachAmbientParticleSystem } from "./AmbientParticleSystem.js";
import { HodEffectFactory } from "./EffectFactory.js";
import { HodEffectPoolAnimator } from "./EffectPoolAnimator.js";

export class HodEffectSystem {
	/** @param {object} meshFactory Procedural native mesh materializer. @param {Readonly<object>} [qualityBudget] Initial concrete quality budget. */
	constructor(meshFactory, qualityBudget = null) {
		this.factory = new HodEffectFactory(meshFactory);
		this.root = new Group();
		this.root.name = "TempleRunnerEffects";
		this.fxEnabled = true;
		this.visualTime = 0;
		this.dustPool = this.createAnimator(6, () => this.factory.createDust());
		this.glintPool = this.createAnimator(10, () => this.factory.createGlint());
		this.atmosphere = new NetzachAmbientParticleSystem();
		this.root.add(this.atmosphere.root);
		if (qualityBudget) this.setQualityBudget(qualityBudget);
	}

	/** @param {number} count Pool size. @param {Function} creator Node creator. @returns {HodEffectPoolAnimator} */
	createAnimator(count, creator) {
		const slots = Array.from({ length: count }, () => {
			const node = creator();
			this.root.add(node);
			return { node, life: 0, totalLife: 0 };
		});
		return new HodEffectPoolAnimator(slots);
	}

	/** @param {number} x Runner X. @param {number} y Runner Y. @param {number} z Runner Z. @returns {void} */
	dust(x, y, z) {
		if (!this.fxEnabled) return;
		this.dustPool.activate(x, y, z, FEEDBACK_CONFIG.dustSeconds);
	}

	/** @param {number} x World X. @param {number} y World Y. @param {number} z World Z. @returns {void} */
	glint(x, y, z) {
		if (!this.fxEnabled) return;
		this.glintPool.activate(x, y, z, FEEDBACK_CONFIG.glintSeconds);
	}

	/** @param {Readonly<object>} preferences Shared presentation preference snapshot. @returns {void} */
	setPreferences(preferences) {
		this.fxEnabled = preferences.fx !== false;
		this.atmosphere.setPreferences(preferences);
	}

	/** @param {Readonly<object>} tiferesBudget Concrete quality budget. @returns {void} */
	setQualityBudget(tiferesBudget) {
		this.atmosphere.setQualityBudget(tiferesBudget);
	}

	/** @param {number} delta Active-frame seconds. @param {number} speed Runner speed. @param {string|object|null} district Current district. @returns {void} */
	update(delta, speed = 10, district = null) {
		this.visualTime += delta;
		if (this.fxEnabled) {
			this.dustPool.update(delta, 1.8);
			this.glintPool.update(delta, 2.8);
		}
		this.atmosphere.update(delta, speed, this.visualTime, district);
	}

	/** Restores every finite effect and ambient cloud to deterministic startup state. @returns {void} */
	reset() {
		this.visualTime = 0;
		this.dustPool.reset();
		this.glintPool.reset();
		this.atmosphere.reset();
	}

	/** @returns {Readonly<object>} Compact presentation diagnostics. */
	diagnostics() {
		return Object.freeze({
			fxEnabled: this.fxEnabled,
			atmosphere: this.atmosphere.diagnostics()
		});
	}
}
