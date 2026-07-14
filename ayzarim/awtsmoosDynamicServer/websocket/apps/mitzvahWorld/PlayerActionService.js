// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionService.js
 * @description Applies bounded social actions, profiles, interaction, and full respawn.
 * The Awtsmoos renews expression without surrendering authority; Awtsmoos.com
 * restores position and combat through canonical state rather than client invention.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { reviveCombatState } = require('./CombatState.js');
const ALLOWED_ACTIONS = new Set(['jump', 'kneel', 'pray', 'wave']);
const ALLOWED_EMOTES = new Set(['bow', 'joy', 'pray', 'wave']);
const ALLOWED_STATUSES = new Set(['away', 'busy', 'online']);
const INTERACTION_RADIUS = 5;

class PlayerActionService {
	constructor(room) {
		this.room = room;
	}

	action(player, action) {
		if (!ALLOWED_ACTIONS.has(action)) {
			throw new RealtimeError('INVALID_ACTION', 'The requested player action is unavailable.');
		}
		player.lastAction = action;
		return this.publicState(player);
	}

	emote(player, emote) {
		if (!ALLOWED_EMOTES.has(emote)) {
			throw new RealtimeError('INVALID_EMOTE', 'The requested emote is unavailable.');
		}
		player.lastEmote = emote;
		return this.publicState(player);
	}

	profile(player, update = null) {
		if (update?.status) {
			if (!ALLOWED_STATUSES.has(update.status)) {
				throw new RealtimeError('INVALID_STATUS', 'The requested profile status is unavailable.');
			}
			player.profile.status = update.status;
		}
		return clone({
			displayName: player.displayName,
			id: player.id,
			profile: player.profile,
			progression: player.progression
		});
	}

	interact(player, targetId, action) {
		const target = this.room.entityById(targetId);
		if (!target) throw new RealtimeError('TARGET_NOT_FOUND', 'The interaction target does not exist.');
		if (!withinRadius(player.position, target.position, INTERACTION_RADIUS)) {
			throw new RealtimeError('TARGET_OUT_OF_RANGE', 'Move closer before interacting.');
		}
		return clone({ action, target });
	}

	respawn(player) {
		player.position = { ...player.safePosition };
		player.velocity = { x: 0, y: 0, z: 0 };
		player.lastAction = 'respawn';
		reviveCombatState(player.combat);
		return this.publicState(player);
	}

	publicState(player) {
		return clone({
			combat: player.combat,
			id: player.id,
			lastAction: player.lastAction,
			lastEmote: player.lastEmote,
			position: player.position,
			profile: player.profile
		});
	}
}

function withinRadius(origin, target, radius) {
	const x = Number(target?.x || 0) - Number(origin?.x || 0);
	const y = Number(target?.y || 0) - Number(origin?.y || 0);
	const z = Number(target?.z || 0) - Number(origin?.z || 0);
	return x * x + y * y + z * z <= radius * radius;
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	PlayerActionService
};
