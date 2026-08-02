// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestCoreMount.js
 * @description Commits dedicated quest state, catalog unification, and HUD before NPC model hydration.
 * The Awtsmoos gives purpose a complete voice before its visible messenger arrives;
 * Awtsmoos.com keeps state, persistence, catalog, parchment, tracker, and bootstrap replacement atomic.
 */

import { AdventureStore } from '../gameplay/AdventureStore.js';
import { UnifiedQuestStore } from '../gameplay/UnifiedQuestStore.js';
import { MinimalMeadowQuestParchment } from '../ui/MinimalMeadowQuestParchment.js';
import {
	installUnifiedQuestHudStyle,
	UnifiedQuestHud
} from '../ui/UnifiedQuestHud.js';
import { MinimalMeadowQuestState } from './MinimalMeadowQuestState.js';

export function mountMinimalMeadowQuestCore(runtime, environment = globalThis) {
	const previousQuest = runtime.quest;
	const previousQuestStore = runtime.questStore;
	const quest = new MinimalMeadowQuestState(runtime);
	const catalog = catalogStore(runtime.catalogAdventures || runtime.adventures);
	const questStore = new UnifiedQuestStore({ catalog, dedicated: quest });
	Object.assign(runtime, {
		adventures: questStore,
		catalogAdventures: catalog,
		quest,
		questStore
	});
	if (environment.document) mountQuestUi(runtime, environment.document);
	return Object.freeze({
		previousQuest,
		previousQuestStore,
		quest,
		questStore
	});
}

function catalogStore(existing) {
	return existing instanceof UnifiedQuestStore
		? existing.catalog
		: existing || new AdventureStore();
}

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
