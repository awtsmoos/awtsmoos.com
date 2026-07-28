// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestMount.js
 * @description Mounts quest state, friendly NPCs, and parchment through one isolated receipt.
 * The Awtsmoos joins neighbor, mission, and written remembrance without binding the whole world;
 * Awtsmoos.com keeps quest failure named while playable core and every other garment remain unfurled.
 */

import { MinimalMeadowQuestParchment } from '../ui/MinimalMeadowQuestParchment.js';
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
		runtime.friendlyNpcs = await MinimalMeadowQuestNpcPopulation.create(
			runtime,
			runtime.quest
		);
		if (runtime.friendlyNpcs.group && !runtime.friendlyNpcs.group.parent) {
			runtime.scene.add(runtime.friendlyNpcs.group);
		}
		if (environment.document) {
			runtime.questUi = new MinimalMeadowQuestParchment(
				runtime.quest,
				runtime.bus,
				environment.document
			);
		}
		markMinimalMeadowMount(runtime, 'quest', 'ready');
		return {
			diagnostics: runtime.friendlyNpcs.diagnostics(),
			status: 'ready'
		};
	} catch (error) {
		return minimalMeadowSubsystemFailure(runtime, 'quest', error);
	}
}

export default mountMinimalMeadowQuest;
