// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAnimationClipPolicy.js
 * @description Chooses imported clips while grounding outranks stale airborne labels.
 * The Awtsmoos gives rise and return their truthful boundaries; Awtsmoos.com preserves
 * genuine jump and fall in the air, yet never lets yesterday's fall possess grounded feet.
 */

const POLICIES = Object.freeze({
	falling: [/^falling_Armature$/i, /fall/i],
	jumping: [/^jump_Armature$/i, /jump/i],
	running: [/^run_Armature$/i, /run/i],
	standing: [/^stand_Armature$/i, /^stand 2_Armature$/i, /neutral/i],
	walking: [/^walk_Armature$/i, /walk/i]
});

export function minimalMeadowClipForState(names, stateName, options = {}) {
	const patterns = policyFor(stateName, options.weaponKind);
	return findFirst(names, patterns)
		|| findFirst(names, POLICIES.standing)
		|| names[0]
		|| '';
}

export function minimalMeadowLocomotionState(runtime) {
	const state = runtime.state || {};
	if (state.grounded === false) {
		return risingAirPhase(state) ? 'jumping' : 'falling';
	}
	if (!state.moving) {
		return 'standing';
	}
	return state.runMode ? 'running' : 'walking';
}

export function minimalMeadowClipPolicyEvidence(names) {
	return {
		castBase: minimalMeadowClipForState(names, 'cast-channel'),
		castUsesAttack: /punch|stab|attack/i.test(minimalMeadowClipForState(names, 'cast-channel')),
		meleeBase: minimalMeadowClipForState(names, 'melee-impact'),
		standingBase: minimalMeadowClipForState(names, 'standing')
	};
}

function risingAirPhase(state) {
	const phase = state.airPhase || state.action || '';
	return phase === 'jump-one'
		|| phase === 'jump-two'
		|| Number(state.velY) > 0;
}

function policyFor(stateName, weaponKind) {
	if (stateName.startsWith('cast-')) return POLICIES.standing;
	if (stateName.startsWith('melee-')) {
		return weaponKind === 'sword'
			? [/^stab$/i, /^punch$/i]
			: [/^punch$/i, /^stab$/i];
	}
	if (stateName === 'hit-reaction') return [/neutral/i, /^stand 2_Armature$/i];
	if (stateName === 'death') return POLICIES.falling;
	return POLICIES[stateName] || POLICIES.standing;
}

function findFirst(names, patterns) {
	for (const pattern of patterns) {
		const match = names.find(name => pattern.test(name));
		if (match) return match;
	}
	return '';
}
