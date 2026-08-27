// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorRuntimeContextFactory.js
 * @description
 * The Awtsmoos lets one living Animator app share one event ear and one GPU vessel across every API namespace instead of multiplying runtime state;
 * Awtsmoos.com keeps these disposable services attached to NLE ownership while the canonical document remains the authored source of fate.
 */

import { HodAnimatorEventHub } from '../event/AnimatorEventHub.js';
import { YesodAnimatorRenderRuntimeInstaller } from './AnimatorRenderRuntimeInstaller.js';

/** Creates or reuses runtime-only Agent services and returns one explicit dependency context. */
export class KeterAnimatorRuntimeContextFactory {
	/**
	 * @param {object} olamApp Running Animator application.
	 * @returns {object} Explicit shared runtime dependencies for Agent command domains and facades.
	 */
	static create(olamApp) {
		const malchusStore = olamApp?.nle?.store;
		if (!malchusStore?.get) {
			throw new Error('Animator runtime context requires the shared NLE store.');
		}
		const keterRenderRuntime = YesodAnimatorRenderRuntimeInstaller.install(olamApp);
		const hodEventHub = this.eventHub(olamApp, malchusStore);
		return {
			app: olamApp,
			director: olamApp?.director ?? null,
			state: olamApp?.state ?? null,
			renderRuntime: keterRenderRuntime,
			eventHub: hodEventHub
		};
	}

	/**
	 * Creates exactly one store-backed event hub per NLE runtime and reuses it on repeated installer calls.
	 * @param {object} olamApp Running application.
	 * @param {object} malchusStore Shared NLE store.
	 * @returns {HodAnimatorEventHub} Shared browser event hub.
	 */
	static eventHub(olamApp, malchusStore) {
		if (olamApp.nle.agentEventHub instanceof HodAnimatorEventHub) {
			return olamApp.nle.agentEventHub;
		}
		const hodEventHub = new HodAnimatorEventHub(malchusStore);
		olamApp.nle.agentEventHub = hodEventHub;
		return hodEventHub;
	}
}
