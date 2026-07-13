//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the combat pose vessel in this instant, revealing
 * its focused js skeleton combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Combat pose router with anticipation and recovery.
 *
 * The Awtsmoos creates the strike before it lands and the recovery after it
 * fails. This file reads attack phase only for visual posture; timing remains
 * in the gameplay attack system.
 */
import { attackPhase } from './attackPhase.js';
import { punchPose } from './punchPose.js';
import { kickPose } from './kickPose.js';
import { uppercutPose } from './uppercutPose.js';
import { meteorKickPose } from './meteorKickPose.js';
import { grabPose } from './grabPose.js';
import { shieldPose } from './shieldPose.js';
import { chargePose } from './chargePose.js';
import { attackAnticipation } from './attackAnticipation.js';
import { attackRecovery } from './attackRecovery.js';
import { whiffRecoveryPose } from './whiffRecoveryPose.js';

/**
 * Reveals the combat pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} m The m value entering this behavior.
 * @param {*} body The body value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function combatPose(p, f, m, body, intent) {
	const id = f.blocking ? 'shield' : f.attack?.id || '';
	const phase = attackPhase(f);
	attackAnticipation(p, f, m, body, intent, phase);
	routeAttack(id, p, f, m, body, intent, phase);
	attackRecovery(p, f, m, body, intent, phase);
	whiffRecoveryPose(p, f, m, body, intent, phase);
	return p;
}

function routeAttack(id, p, f, m, body, intent, phase) {
	if (id === 'shield') return shieldPose(p, f, m, body, intent, phase);
	if (id === 'grab') return grabPose(p, f, m, body, intent, phase);
	if (id === 'uppercut') return uppercutPose(p, f, m, body, intent, phase);
	if (id === 'meteorKick') return meteorKickPose(p, f, m, body, intent, phase);
	if (isKick(id)) return kickPose(p, f, m, body, intent, phase);
	if (isPunch(id)) return punchPose(p, f, m, body, intent, phase);
	return chargePose(p, f, m, body, intent, phase);
}

function isPunch(id) {
	return id.includes('jab') || id.includes('Punch') || id === 'special';
}

function isKick(id) {
	return id.includes('Kick') || id === 'roundhouse' || id === 'sweep';
}
