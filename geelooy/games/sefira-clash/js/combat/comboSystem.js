//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the combo system vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { COMBAT_TUNING } from '../data/combatTuning.js';

/**
 * B"H
 * Combo accounting without cages.
 *
 * Chapter 2: the Awtsmoos lets the attacker write fire across the air, but the
 * defender is not erased. A combo is measured, celebrated, decayed, escaped,
 * and remembered as match truth instead of invisible smoke.
 */
export function tickComboState(fighters) {
	for (const f of fighters) {
		tickAttackerCombo(f);
		tickDefenderCombo(f);
	}
}

/**
 * Reveals the record combo hit behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} attacker The attacker value entering this behavior.
 * @param {*} target The target value entering this behavior.
 * @param {*} damage The damage value entering this behavior.
 * @param {*} attack The attack value entering this behavior.
 */
export function recordComboHit(state, attacker, target, damage, attack) {
	const combo = COMBAT_TUNING.combo;
	const same = attacker.combo?.lastTarget === target.id && attacker.combo.timer > 0;
	attacker.combo = attacker.combo || { count: 0, timer: 0, lastTarget: null, score: 0 };
	attacker.combo.count = same ? attacker.combo.count + 1 : 1;
	attacker.combo.timer = combo.attackerWindow;
	attacker.combo.lastTarget = target.id;
	attacker.combo.score += combo.scoreBase + damage * combo.scorePerDamage;

	target.comboPressure = target.comboPressure || { count: 0, timer: 0, escape: 0 };
	target.comboPressure.count = same ? target.comboPressure.count + 1 : 1;
	target.comboPressure.timer = combo.defenderWindow;
	target.comboPressure.escape = escapeValue(target.comboPressure.count, attack);

	state.diagnostics ||= createCombatDiagnostics();
	state.diagnostics.maxCombo = Math.max(state.diagnostics.maxCombo, attacker.combo.count);
	state.diagnostics.comboScore += combo.scoreBase + damage * combo.scorePerDamage;
	return {
		count: attacker.combo.count,
		score: attacker.combo.score,
		escape: target.comboPressure.escape
	};
}

/**
 * Reveals the should announce combo behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} count The count value entering this behavior.
 */
export function shouldAnnounceCombo(count) {
	return COMBAT_TUNING.combo.announcementSteps.includes(count);
}

/**
 * Reveals the create combat diagnostics behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 */
export function createCombatDiagnostics() {
	return { hits: 0, rapidHits: 0, maxCombo: 0, comboScore: 0, killDangerHits: 0 };
}

function tickAttackerCombo(f) {
	if (!f.combo) return;
	f.combo.timer = Math.max(0, f.combo.timer - 1);
	if (!f.combo.timer) {
		f.combo.count = 0;
		f.combo.lastTarget = null;
	}
}

function tickDefenderCombo(f) {
	if (!f.comboPressure) return;
	f.comboPressure.timer = Math.max(0, f.comboPressure.timer - 1);
	f.comboPressure.escape = Math.max(0, f.comboPressure.escape - 1);
	if (!f.comboPressure.timer) f.comboPressure.count = 0;
}

function escapeValue(count, attack) {
	const stale = Math.max(0, count - COMBAT_TUNING.combo.escapeStaleAfter);
	const rapidBonus = attack?.rapid ? 8 : 0;
	return Math.min(COMBAT_TUNING.combo.escapeDecayFrames, stale * 3 + rapidBonus);
}
