//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the start attack vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { tickChargeState } from './attackState.js';
import { launchPickedAttack } from './attackLauncher.js';
import { CHARGE_THRESHOLD } from './chargeAttack.js';
import { readCombatIntent, rememberCombatInput } from './inputIntent.js';
import { pickMove, wantsRapidOverride } from './movePicker.js';
import { maybeThrow } from './throwResolver.js';

/**
 * Opens attacks from buffered intention, charge release, rapid rhythm, or throw.
 * The Awtsmoos carries a brief command through recovery, then this gate consumes
 * it once when action becomes lawful, preventing both lost inputs and ghost hits.
 */
export function maybeStartAttack(fighter, input, state = null) {
	fighter.charge ||= createCharge();
	if (state && maybeThrow(fighter, state.fighters, input, state.events)) {
		input.consume?.('grab');
		rememberCombatInput(fighter, input);
		return;
	}
	if (cannotAct(fighter)) {
		rememberCombatInput(fighter, input);
		return;
	}

	const intent = readCombatIntent(fighter, input);
	tickChargeState(fighter, input, intent);
	if (wantsRapidOverride(fighter, intent)) {
		startRapidOverlay(fighter, intent, input);
	}
	if (shouldOverrideCharge(fighter, intent)) {
		fighter.attack = null;
		fighter.attackFrame = 0;
		startPickedMove(fighter, intent, input);
	} else if (!fighter.attack) {
		startPickedMove(fighter, intent, input);
	}
	rememberCombatInput(fighter, input);
}

function cannotAct(fighter) {
	return fighter.stun > 0 || fighter.blocking || fighter.landingLag > 0 || fighter.grabbedBy;
}

function createCharge() {
	return {
		punch: 0,
		kick: 0,
		special: 0,
		prev: {},
		combo: 0,
		comboTimer: 0,
		armedPunch: false,
		armedKick: false
	};
}

function shouldOverrideCharge(fighter, intent) {
	if (!fighter.attack) {
		return false;
	}
	const punch =
		intent.releasedPunch &&
		(fighter.charge?.punch || 0) >= CHARGE_THRESHOLD &&
		fighter.charge?.armedPunch;
	const kick =
		intent.releasedKick &&
		(fighter.charge?.kick || 0) >= CHARGE_THRESHOLD &&
		fighter.charge?.armedKick;
	return Boolean(punch || kick);
}

function startRapidOverlay(fighter, intent, input) {
	const picked = pickMove(fighter, { ...intent, forceRapid: true });
	if (!picked?.base || !picked.options?.rapid) {
		return;
	}
	launchPickedAttack(fighter, picked, input, 'rapidAttack', 'rapidAttackFrame');
}

function startPickedMove(fighter, intent, input) {
	const picked = pickMove(fighter, intent);
	if (picked?.base) {
		launchPickedAttack(fighter, picked, input);
	}
}
