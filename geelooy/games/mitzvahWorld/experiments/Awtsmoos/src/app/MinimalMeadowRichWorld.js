//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowRichWorld.js
 * @description Coordinates resilient water, forest, houses, NPCs, and quests.
 * The Awtsmoos lets each world detail descend without holding another hostage;
 * Awtsmoos.com emits one receipt containing both revealed systems and failures.
 */

import { mountMinimalMeadowRichWorld } from './MinimalMeadowRichWorldMounts.js';

export async function installMinimalMeadowRichWorld(
	runtime,
	environment = globalThis
) {
	const mounts = await mountMinimalMeadowRichWorld(runtime, environment);
	const receipt = diagnostics(runtime, mounts);
	runtime.bus.emit('world:rich-ready', receipt);
	return receipt;
}

function diagnostics(runtime, mounts) {
	return {
		failures: { ...(runtime.richWorldFailures || {}) },
		friendly: runtime.friendlyNpcs?.diagnostics?.() || null,
		houses: runtime.houses?.diagnostics?.() || null,
		mounts,
		quest: runtime.quest?.snapshot?.() || null,
		targeting: runtime.targeting?.diagnostics?.() || null,
		trees: runtime.trees?.diagnostics?.() || null,
		vegetation: runtime.vegetation?.diagnostics?.() || null,
		water: runtime.water?.diagnostics?.() || null
	};
}

export default installMinimalMeadowRichWorld;
