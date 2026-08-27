// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestMount.js
 * @description Mounts dedicated story, catalog missions, NPCs, and one unified quest HUD.
 * The Awtsmoos joins neighbor, mission, log, tracker, and map through one remembered purpose;
 * Awtsmoos.com preserves story parchment while every persistent surface drinks from one store.
 */

import { AdventureStore } from '../gameplay/AdventureStore.js';
import { UnifiedQuestStore } from '../gameplay/UnifiedQuestStore.js';
import { MinimalMeadowQuestParchment } from '../ui/MinimalMeadowQuestParchment.js';
import {
	installUnifiedQuestHudStyle,
	UnifiedQuestHud
} from '../ui/UnifiedQuestHud.js';
import { MinimalMeadowQuestNpcPopulation } from './MinimalMeadowQuestNpcPopulation.js';
import { MinimalMeadowQuestState } from './MinimalMeadowQuestState.js';
import {
	markMinimalMeadowMount,
	minimalMeadowSubsystemFailure
} from './MinimalMeadowRichWorldMountSupport.js';

export async function mountMinimalMeadowQuest(
	runtime,
	environment = globalThis
) {
	markMinimalMeadowMount(runtime, 'quest', 'loading');
	try {
		runtime.quest = new MinimalMeadowQuestState(runtime);
		runtime.catalogAdventures = runtime.catalogAdventures
			|| catalogStore(runtime.adventures);
		runtime.questStore = new UnifiedQuestStore({
			catalog: runtime.catalogAdventures,
			dedicated: runtime.quest
		});
		runtime.adventures = runtime.questStore;
		runtime.friendlyNpcs = await MinimalMeadowQuestNpcPopulation.create(
			runtime,
			runtime.quest
		);
		if (runtime.friendlyNpcs.group && !runtime.friendlyNpcs.group.parent) {
			runtime.scene.add(runtime.friendlyNpcs.group);
		}
		if (environment.document) mountQuestUi(runtime, environment.document);
		markMinimalMeadowMount(runtime, 'quest', 'ready');
		return {
			diagnostics: {
				...runtime.friendlyNpcs.diagnostics(),
				unifiedHud: runtime.questHud?.diagnostics?.() || null
			},
			status: 'ready'
		};
	} catch (error) {
		return minimalMeadowSubsystemFailure(runtime, 'quest', error);
	}
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

export default mountMinimalMeadowQuest;
