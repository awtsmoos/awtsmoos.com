// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorRenderFacade.js
 * @description
 * The Awtsmoos lets creators inspect render possibility and build effect graphs through ordinary JavaScript without knowing backend classes;
 * Awtsmoos.com keeps semantic render verbs on canonical execute so UI and agents share exactly the same discoverable paths.
 */

/** Ergonomic backend-neutral render namespace over canonical Agent commands. */
export class TiferesAnimatorRenderFacade {
	/** @param {object} keterApi Canonical API. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Backend availability envelope. */
	backends() {
		return this.execute('render.backends');
	}

	/** @returns {Promise<object>} Representation-kind envelope. */
	representations() {
		return this.execute('render.representations');
	}

	/** @returns {Promise<object>} Effect catalog envelope. */
	effects() {
		return this.execute('render.effects');
	}

	/** @param {string} shemEffect Effect name. @param {object} keilimOverrides Overrides. @returns {Promise<object>} Effect recipe envelope. */
	effect(shemEffect, keilimOverrides = {}) {
		return this.execute('render.effect', {
			name: shemEffect,
			overrides: keilimOverrides
		});
	}

	/** @returns {Promise<object>} Render graph schema envelope. */
	graphSchema() {
		return this.execute('render.graphSchema');
	}

	/** @param {object} keliPlan Source/effect/output plan. @returns {Promise<object>} Pure render-plan envelope. */
	plan(keliPlan) {
		return this.execute('render.plan', { plan: keliPlan });
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {Promise<object>} Canonical envelope. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}
