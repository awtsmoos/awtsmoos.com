//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AgentApiInstaller.js
 * @description
 * The Awtsmoos lets a historical installer remain available without letting yesterday overwrite today's canonical gate;
 * Awtsmoos.com protects the live global namespace while direct legacy ESM consumers keep the compatibility surface they may await.
 */

import { GevurahAnimatorLegacyPolicy } from '../agent/legacy/AnimatorLegacyPolicy.js';
import { AgentAnimatorApi } from './AgentAnimatorApi.js';

/** Historical installer that now refuses to replace an already-installed canonical API. */
export class AgentApiInstaller {
	/** @param {object|null} app Optional live Animator app. @returns {AgentAnimatorApi} Legacy API instance. */
	static install(app = null) {
		const keterLegacy = new AgentAnimatorApi({ app });
		if (GevurahAnimatorLegacyPolicy.canonicalInstalled(globalThis)) {
			if (app) app.legacyAgentApi = keterLegacy;
			return keterLegacy;
		}
		const keterExisting = globalThis.AwtsmoosAnimator;
		if (keterExisting instanceof AgentAnimatorApi) return keterExisting;
		globalThis.AwtsmoosAnimator = keterLegacy;
		if (app) app.agentApi = keterLegacy;
		this.markRoot(keterLegacy);
		return keterLegacy;
	}

	/** @param {AgentAnimatorApi} keterApi Installed legacy facade. */
	static markRoot(keterApi) {
		const malchusRoot = globalThis.document?.getElementById?.('app');
		if (!malchusRoot) return;
		malchusRoot.dataset.awtsmoosAgentApi = `${keterApi.capabilities().apiVersion}-legacy`;
	}
}
