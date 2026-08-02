// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestMount.js
 * @description Commits dedicated quest truth synchronously and hydrates its canonical NPC asynchronously.
 * The Awtsmoos lets purpose become playable before its full visible messenger arrives;
 * Awtsmoos.com keeps state, store, HUD, persistence, NPC quality, readiness, and failure receipts distinct.
 */

import {
	mountMinimalMeadowQuestCore
} from './MinimalMeadowQuestCoreMount.js';
import {
	hydrateMinimalMeadowQuestNpc
} from './MinimalMeadowQuestNpcHydration.js';
import {
	markMinimalMeadowMount,
	minimalMeadowSubsystemFailure
} from './MinimalMeadowRichWorldMountSupport.js';

export function mountMinimalMeadowQuest(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	markMinimalMeadowMount(runtime, 'quest', 'loading');
	try {
		const core = mountMinimalMeadowQuestCore(runtime, environment);
		const hydrateNpc = dependencies.hydrateMinimalMeadowQuestNpc
			|| hydrateMinimalMeadowQuestNpc;
		const hydrationPromise = Promise.resolve().then(() => {
			return hydrateNpc(runtime, core.quest);
		});
		runtime.questHydrationPromise = hydrationPromise;
		markMinimalMeadowMount(runtime, 'quest', 'ready');
		return Object.freeze({
			diagnostics: Object.freeze({
				bootstrapReplaced: Boolean(core.previousQuestStore),
				npcHydrating: true,
				unifiedHud: Boolean(runtime.questHud)
			}),
			hydrationPromise,
			status: 'ready'
		});
	} catch (error) {
		return minimalMeadowSubsystemFailure(runtime, 'quest', error);
	}
}
