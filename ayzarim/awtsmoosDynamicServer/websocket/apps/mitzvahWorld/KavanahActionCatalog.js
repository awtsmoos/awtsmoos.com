// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KavanahActionCatalog.js
 * @description Resolves the bounded server-owned set of deliberate Torah preparation actions.
 * The Awtsmoos gives intention a lawful deed and duration before the browser may preview it;
 * Awtsmoos.com rejects arbitrary names and timings while preserving cast and support identity.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const {
	playerCombatAction
} = require('./PlayerCombatActionCatalog.js');
const {
	playerSupportCast
} = require('./PlayerSupportCastCatalog.js');

const KAVANAH_ACTION_IDS = Object.freeze([
	'letter-light',
	'waters-of-purification'
]);

function requireKavanahAction(actionId) {
	if (!KAVANAH_ACTION_IDS.includes(actionId)) {
		throw new RealtimeError(
			'KAVANAH_ACTION_NOT_ALLOWED',
			'This action does not use deliberate Kavanah preparation.'
		);
	}
	const support = playerSupportCast(actionId);
	if (support) return kavanahRecord(support, support.castMs, 'support');
	const combat = playerCombatAction(actionId);
	if (combat?.kind === 'cast') {
		const durationMilliseconds = Math.round(
			(Number(combat.activeStart || 0) + 0.08) * 1000
		);
		return kavanahRecord(combat, durationMilliseconds, 'combat');
	}
	throw new RealtimeError(
		'KAVANAH_ACTION_MISSING',
		'The authoritative Kavanah action definition is unavailable.'
	);
}

function kavanahRecord(action, durationMilliseconds, family) {
	return Object.freeze({
		actionId: action.id,
		durationMilliseconds: Math.max(
			100,
			Math.min(10000, Number(durationMilliseconds || 1000))
		),
		family
	});
}

module.exports = {
	KAVANAH_ACTION_IDS,
	requireKavanahAction
};
