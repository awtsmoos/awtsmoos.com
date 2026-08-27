// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatSupportOutcome.js
 * @description Scales support by authoritative Kavanah and derives posture, learning, threat, and public action.
 * The Awtsmoos lets deliberate support strengthen control instead of becoming hidden damage;
 * Awtsmoos.com keeps healing, interruption, cleanse, composure, knowledge, and attention readable.
 */

const { restorePosture } = require('./PostureRules.js');

function authoritativeSupportKavanah(player, actionId) {
	const state = player.combat.kavanah;
	if (!state || state.actionId !== actionId || !state.released || !state.result) return null;
	return Object.freeze({
		...state.result,
		castId: state.castId,
		elapsedMilliseconds: state.result.elapsedMilliseconds
	});
}

function controlledSupportAction(action, kavanah) {
	const control = Number(kavanah?.controlMultiplier || 1);
	return Object.freeze({
		...action,
		healing: Math.round(Number(action.healing || 0) * control),
		interruptForce: Number(action.interruptForce || 0) * control,
		statusStrengthMultiplier: Number(kavanah?.statusStrengthMultiplier || 1)
	});
}

function restoreSupportPosture(target, effects, kavanah, now) {
	if (target.kind !== 'player') return null;
	const base = effects.healing > 0 ? 10 : 18;
	return restorePosture(
		target.value.combat.posture,
		base * Number(kavanah?.controlMultiplier || 1),
		{ now }
	);
}

function learnFromSupport(daas, player, target, action, effects) {
	if (target.kind !== 'creature' || !effects.interruption) return null;
	return daas.counter(player, target.value.id, action.id);
}

function recordSupportThreat(threat, player, target, effects, command) {
	if (target.kind !== 'creature') return null;
	const source = effects.interruption
		? 'interrupt'
		: effects.healing
			? 'healing'
			: 'control';
	const amount = effects.healing || supportEffectStrength(effects);
	return threat.add(
		target.value,
		player.id,
		source,
		amount,
		command.castInstanceId
	);
}

function publicSupportAction(action) {
	return Object.freeze({
		affinityId: action.affinityId,
		cooldownMs: action.cooldownMs,
		id: action.id,
		statusStrengthMultiplier: action.statusStrengthMultiplier,
		targetKind: action.targetKind
	});
}

function supportEffectStrength(effects) {
	return effects.applied.length * 12
		+ effects.removed.length * 8
		+ (effects.interruption ? 24 : 0);
}

module.exports = {
	authoritativeSupportKavanah,
	controlledSupportAction,
	learnFromSupport,
	publicSupportAction,
	recordSupportThreat,
	restoreSupportPosture
};
