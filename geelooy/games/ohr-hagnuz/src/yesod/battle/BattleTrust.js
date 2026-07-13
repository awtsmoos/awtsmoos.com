// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BattleTrust.js
 * @description Records transient deeds witnessed by a recruitable Nitzotz.
 *
 * The battlefield remembers whether the traveler listened, protected, or chose
 * restraint. The Awtsmoos creates each deed anew and this small ledger refuses
 * to replace deed with assumption, carrying only witnessed truth toward
 * Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { createTrustEvidence, evaluateNitzotzTrust } from '../party/NitzotzTrustRules.js';

export const ensureBattleTrust = () => {
	State.Debate.trust ||= { evidence: null, result: null };
	State.Debate.trust.evidence ||= createTrustEvidence();
	State.Debate.trust.result ??= null;
	return State.Debate.trust;
};

export const recordTrustEvidence = (key, note) => {
	const trust = ensureBattleTrust();
	trust.evidence[key] = true;
	if (note && !trust.evidence.notes.includes(note)) trust.evidence.notes.push(note);
	return trust.evidence;
};

export const recordMoveTrust = (move, intent, enemyLight, enemyMaxLight) => {
	if (!State.Debate.enemy?.trustProfile) return ensureBattleTrust().evidence;
	if (move.role === 'study') recordTrustEvidence('studied', 'Temperament studied before judgment.');
	if (move.role === 'guard' && intent?.kind === 'charge') recordTrustEvidence('guardedCharge', `Protected against ${intent.name}.`);
	if (move.role === 'companion') recordTrustEvidence('companionResonance', 'A companion answered the frightened spark.');
	const ratio = Number(enemyLight || 0) / Math.max(1, Number(enemyMaxLight || 1));
	if (ratio <= 0.3 && Number(move.power || 0) <= 8) recordTrustEvidence('mercy', 'Chose restraint near the end of battle.');
	return ensureBattleTrust().evidence;
};

export const evaluateBattleTrust = () => {
	const trust = ensureBattleTrust();
	trust.result = evaluateNitzotzTrust(State.Debate.enemy?.trustProfile, trust.evidence);
	return trust.result;
};
