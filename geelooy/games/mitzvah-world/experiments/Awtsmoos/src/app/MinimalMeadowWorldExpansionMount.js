// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldExpansionMount.js
 * @description Owns local expansion authority and mastery wiring so world bootstrap remains a narrow orchestration vessel.
 * The Awtsmoos lets many powers descend through one explicit covenant, while Awtsmoos.com keeps authority separate from display;
 * progression, bounty, activity, and region flow remain one service bridge instead of swelling the world-mount file into a tangled aisle.
 */

import { ExpansionRuntime } from '../gameplay/expansion/ExpansionRuntime.js';
import { LocalCombatMasteryBridge } from '../gameplay/expansion/LocalCombatMasteryBridge.js';
import { LocalExpansionAuthority } from '../gameplay/expansion/LocalExpansionAuthority.js';

/**
 * Installs local expansion services and multiplayer-aware authority forwarding.
 * @param {object} runtime Mitzvah World runtime.
 * @param {object} environment Browser-like environment.
 * @returns {object} Installed expansion runtime.
 */
export function installMinimalMeadowLocalExpansion(runtime, environment = globalThis) {
	runtime.localExpansionAuthority = new LocalExpansionAuthority();
	runtime.localCombatMastery = new LocalCombatMasteryBridge(
		runtime,
		runtime.localExpansionAuthority
	);
	runtime.expansion = new ExpansionRuntime(runtime, {
		api: dynamicExpansionApi(runtime),
		environment,
		mobile: Boolean(runtime.mobile || runtime.options?.mobile)
	});
	return runtime.expansion;
}

/** Builds an API that always resolves the currently authoritative expansion service. */
function dynamicExpansionApi(runtime) {
	const authority = () => {
		return runtime.multiplayerBridge?.client?.mmorpg?.rpg
			|| runtime.localExpansionAuthority;
	};
	return {
		claimBounty: (...args) => authority().claimBounty(...args),
		completeElite: (...args) => authority().completeElite(...args),
		performActivity: (...args) => authority().performActivity(...args),
		progressionSnapshot: (...args) => authority().progressionSnapshot(...args),
		transitionRegion: (...args) => authority().transitionRegion(...args),
		upgradeEquipment: (...args) => authority().upgradeEquipment(...args)
	};
}
