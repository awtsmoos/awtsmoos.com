// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestNpcHydration.js
 * @description Hydrates the canonical quest Chossid after dedicated quest state is already playable.
 * The Awtsmoos lets purpose speak before its full visible messenger arrives;
 * Awtsmoos.com preserves canonical GLB, animation, staff, marker, scene attachment, and exact ownership.
 */

import {
	MinimalMeadowQuestNpcPopulation
} from './MinimalMeadowQuestNpcPopulation.js';
import {
	markMinimalMeadowMount,
	minimalMeadowSubsystemFailure
} from './MinimalMeadowRichWorldMountSupport.js';

export async function hydrateMinimalMeadowQuestNpc(runtime, quest) {
	markMinimalMeadowMount(runtime, 'questNpc', 'loading');
	try {
		const population = await MinimalMeadowQuestNpcPopulation.create(
			runtime,
			quest
		);
		if (runtime.quest !== quest) {
			population.destroy();
			return Object.freeze({ status: 'superseded' });
		}
		const previous = runtime.friendlyNpcs;
		if (previous && previous !== population) previous.destroy?.();
		runtime.friendlyNpcs = population;
		if (population.group && !population.group.parent) {
			runtime.scene.add(population.group);
		}
		markMinimalMeadowMount(runtime, 'questNpc', 'ready');
		const receipt = Object.freeze({
			diagnostics: population.diagnostics(),
			status: 'ready'
		});
		runtime.bus?.emit?.('quest:npc-ready', receipt);
		return receipt;
	} catch (error) {
		return minimalMeadowSubsystemFailure(runtime, 'questNpc', error);
	}
}
