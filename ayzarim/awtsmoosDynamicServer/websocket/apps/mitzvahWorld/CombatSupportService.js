// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatSupportService.js
 * @description Resolves server-timed healing, cleanse, stabilization, restraint, and counters.
 * The Awtsmoos lets deliberate support strengthen control rather than raw damage;
 * Awtsmoos.com owns timing, target, cost, cooldown, status, posture, threat, and learning.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { applyCombatCastEffects } = require('./CombatCastEffects.js');
const { requirePlayerSupportCast } = require('./CombatCastValidation.js');
const { rememberCombatCooldown } = require('./CombatCooldownRules.js');
const {
	authoritativeSupportKavanah,
	controlledSupportAction
} = require('./CombatSupportOutcome.js');
const {
	combatSupportReceipt
} = require('./CombatSupportReceipt.js');
const { resolveCombatSupportTarget } = require('./CombatSupportTarget.js');
const { playerSupportCast } = require('./PlayerSupportCastCatalog.js');

const KAVANAH_REQUIRED_SUPPORT = new Set([
	'waters-of-purification'
]);

class CombatSupportService {
	constructor(options) {
		this.clock = options.clock || Date.now;
		this.creatures = options.creatures;
		this.daas = options.daas;
		this.kavanah = options.kavanah;
		this.players = options.players;
		this.threat = options.threat;
	}

	cast(player, command = {}) {
		const now = this.clock();
		const catalogAction = playerSupportCast(command.actionId);
		const kavanah = authoritativeSupportKavanah(
			player,
			command.actionId
		);
		requireAuthoritativePreparation(catalogAction, kavanah);
		const action = requirePlayerSupportCast(player, {
			...command,
			elapsedMs: kavanah?.elapsedMilliseconds
				?? command.elapsedMs
		}, now);
		const target = resolveCombatSupportTarget({
			action,
			caster: player,
			command,
			creatures: this.creatures,
			players: this.players
		});
		const controlledAction = controlledSupportAction(action, kavanah);
		player.combat.stamina -= controlledAction.staminaCost;
		rememberCombatCooldown(
			player.combat,
			controlledAction.id,
			controlledAction.cooldownMs,
			now
		);
		const effects = applyCombatCastEffects({
			action: controlledAction,
			caster: player,
			now,
			target
		});
		return combatSupportReceipt(this, {
			action: controlledAction,
			command,
			effects,
			kavanah,
			now,
			player,
			target
		});
	}
}

function requireAuthoritativePreparation(action, kavanah) {
	if (!KAVANAH_REQUIRED_SUPPORT.has(action?.id) || kavanah) return;
	throw new RealtimeError(
		'KAVANAH_RELEASE_REQUIRED',
		'This deliberate support action requires a server-timed Kavanah release.'
	);
}

module.exports = {
	CombatSupportService
};
