// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestCoreMount.js
 * @description Mounts canonical quest truth for every runtime while letting direct play omit the heavy parchment and tracker chrome.
 * The Awtsmoos keeps the mission whole even when its visible scroll folds from sight;
 * Awtsmoos.com preserves catalog, dedicated quest, and unified store exactly, revealing extra UI only in the vessel that asks for that light.
 */

import { AdventureStore } from '../gameplay/AdventureStore.js';
import { UnifiedQuestStore } from '../gameplay/UnifiedQuestStore.js';
import { MinimalMeadowQuestParchment } from '../ui/MinimalMeadowQuestParchment.js';
import {
	installUnifiedQuestHudStyle,
	UnifiedQuestHud
} from '../ui/UnifiedQuestHud.js';
import { MinimalMeadowQuestState } from './MinimalMeadowQuestState.js';

/**
 * Commits dedicated quest state and catalog truth, then selects presentation by runtime contract.
 * @param {object} runtime Mitzvah World runtime.
 * @param {object} environment Browser-like environment.
 * @returns {object} Immutable mount receipt including previous truth handles.
 */
export function mountMinimalMeadowQuestCore(runtime, environment = globalThis) {
	const previousQuest = runtime.quest;
	const previousQuestStore = runtime.questStore;
	const quest = new MinimalMeadowQuestState(runtime);
	const catalog = catalogStore(runtime.catalogAdventures || runtime.adventures);
	const questStore = new UnifiedQuestStore({
		catalog,
		dedicated: quest
	});
	clearQuestPresentation(runtime);
	Object.assign(runtime, {
		adventures: questStore,
		catalogAdventures: catalog,
		quest,
		questStore
	});
	if (environment.document && runtime.options?.presentation !== 'direct') {
		mountQuestUi(runtime, environment.document);
	}
	return Object.freeze({
		previousQuest,
		previousQuestStore,
		quest,
		questStore
	});
}

/** Reuses an existing catalog or creates the exact catalog type expected by UnifiedQuestStore. */
function catalogStore(existing) {
	return existing instanceof UnifiedQuestStore
		? existing.catalog
		: existing || new AdventureStore();
}

/** Removes only old presentation vessels before a new presentation contract is selected. */
function clearQuestPresentation(runtime) {
	runtime.questUi?.destroy?.();
	runtime.questHud?.destroy?.();
	runtime.questUi = null;
	runtime.questHud = null;
}

/** Preserves the project's canonical full quest parchment + unified tracker composition. */
function mountQuestUi(runtime, documentValue) {
	runtime.questUi = new MinimalMeadowQuestParchment(
		runtime.quest,
		runtime.bus,
		documentValue
	);
	installUnifiedQuestHudStyle(documentValue);
	runtime.questHud = new UnifiedQuestHud(runtime.questStore, {
		dedicatedTracker: runtime.questUi.tracker,
		documentValue
	});
}
