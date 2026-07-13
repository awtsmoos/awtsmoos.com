// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReturnLostWickConsequences.js
 * @description Resolves exploration-order approaches into durable world effects.
 *
 * One first step changes the shape of later kindness. The Awtsmoos recreates
 * every path without confusion; this vessel lets compassion, resolve, and song
 * leave distinct truthful consequences throughout Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { RETURN_LOST_WICK, approachById, approachByTraceId } from '../../content/companions/ReturnLostWick.js';
import { grantBond } from '../../yesod/party/PartyRuntime.js';
import { ensureReturnLostWickState } from './CompanionShlichusState.js';

export function resolveReturnLostWickApproach(lead) {
	if (lead?.approachId) {
		return approachById(lead.approachId);
	}
	const firstTraceId = lead?.traceOrder?.[0];
	return approachByTraceId(firstTraceId);
}

export function applyReturnLostWickConsequences(lead) {
	const approach = resolveReturnLostWickApproach(lead);
	if (lead.consequences?.applied) {
		return { approach, bonusBond: null, repeated: true };
	}
	lead.approachId = approach.id;
	lead.consequences = {
		applied: true,
		tradeMultiplier: approach.tradeMultiplier,
		veilMultiplier: approach.veilMultiplier,
		bonusBondReason: approach.bonusBondReason,
		line: approach.line
	};
	State.WorldState.flags[RETURN_LOST_WICK.flags.approach] = approach.id;
	const bonusBond = approach.bonusBondReason
		? grantBond('nerel', approach.bonusBondReason)
		: null;
	return { approach, bonusBond, repeated: false };
}

export function returnLostWickEffects() {
	const lead = ensureReturnLostWickState();
	if (!lead?.consequences?.applied) {
		return {
			approach: approachById('compassion'),
			tradeMultiplier: 1,
			veilMultiplier: 1,
			applied: false
		};
	}
	return {
		approach: approachById(lead.approachId),
		tradeMultiplier: lead.consequences.tradeMultiplier,
		veilMultiplier: lead.consequences.veilMultiplier,
		applied: true
	};
}
