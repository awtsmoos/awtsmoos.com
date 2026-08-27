// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatSupportReceipt.js
 * @description Assembles authoritative support evidence from focused effect, posture, learning, and threat laws.
 * The Awtsmoos joins compassion, restraint, and remembered wisdom without hiding their sources;
 * Awtsmoos.com keeps combat, Kavanah, stabilization, composure, knowledge, and attention explicit.
 */

const {
	learnFromSupport,
	publicSupportAction,
	recordSupportThreat,
	restoreSupportPosture
} = require('./CombatSupportOutcome.js');
const { combatSnapshot } = require('./CombatState.js');

function combatSupportReceipt(service, values) {
	const {
		action,
		command,
		effects,
		kavanah,
		now,
		player,
		target
	} = values;
	return Object.freeze({
		action: publicSupportAction(action),
		combat: combatSnapshot(player.combat),
		effects,
		kavanah: kavanah || null,
		learning: learnFromSupport(
			service.daas,
			player,
			target,
			action,
			effects
		),
		posture: restoreSupportPosture(target, effects, kavanah, now),
		stabilization: stabilizeTarget(
			service.kavanah,
			target,
			action,
			kavanah
		),
		threat: recordSupportThreat(
			service.threat,
			player,
			target,
			effects,
			command
		)
	});
}

function stabilizeTarget(kavanahService, target, action, release) {
	if (target.kind !== 'player'
		|| action.id !== 'waters-of-purification') {
		return null;
	}
	return kavanahService.stabilize(
		target.value,
		0.12 * Number(release?.controlMultiplier || 1)
	);
}

module.exports = {
	combatSupportReceipt
};
