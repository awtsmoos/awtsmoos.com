// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalCombatAuthority.js
 * @description Resolves explicit single-player combat through shared rules and bounded status state.
 * The Awtsmoos renews local solitude without creating a second law or counterfeit throne;
 * Awtsmoos.com lets offline play use equivalent identities and consequences while remaining known.
 */

import {
	enemyAffinityProfile,
	playerCombatDefinition
} from './CombatDefinitionCatalog.js';
import { resolveCombatEffectiveness } from './CombatEffectivenessResolver.js';
import { CombatStatusLedger } from './CombatStatusLedger.js';

export class LocalCombatAuthority {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
		this.targets = new Map();
	}

	registerTarget(target) {
		const statusLedger = new CombatStatusLedger({ clock: this.clock });
		for (const status of target.statuses || []) {
			statusLedger.apply(status.id, status);
		}
		this.targets.set(target.id, {
			health: Math.max(0, Number(target.health || 0)),
			maximumHealth: Math.max(1, Number(target.maximumHealth || target.health || 1)),
			profile: enemyAffinityProfile(target.speciesId),
			speciesId: target.speciesId,
			statusLedger,
			tags: new Set(target.tags || [])
		});
		return this.targetSnapshot(target.id);
	}

	resolvePlayerAction(command) {
		const action = playerCombatDefinition(command.actionId);
		const target = this.targets.get(command.targetId);
		if (!action) return failure('UNKNOWN_COMBAT_ACTION');
		if (!target) return failure('UNKNOWN_COMBAT_TARGET');
		const effectiveness = resolveCombatEffectiveness({
			action,
			baseDamage: command.baseDamage,
			contextTags: command.contextTags,
			statusIds: target.statusLedger.ids(),
			targetResistances: target.profile?.resistances,
			targetTags: [...target.tags]
		});
		target.statusLedger.removeMany(effectiveness.removeStatusIds);
		for (const statusId of effectiveness.applyStatusIds) {
			target.statusLedger.apply(statusId, {
				now: command.now,
				sourceActionId: action.id,
				sourceActorId: command.actorId
			});
		}
		target.health = Math.max(0, target.health - effectiveness.damage);
		return Object.freeze({
			actionId: action.id,
			authority: 'local',
			effectiveness,
			schemaVersion: 1,
			target: this.targetSnapshot(command.targetId)
		});
	}

	clearTarget(targetId) {
		this.targets.get(targetId)?.statusLedger.clear();
		this.targets.delete(targetId);
	}

	targetSnapshot(targetId) {
		const target = this.targets.get(targetId);
		if (!target) return null;
		return Object.freeze({
			health: target.health,
			id: targetId,
			maximumHealth: target.maximumHealth,
			speciesId: target.speciesId,
			statuses: target.statusLedger.snapshot()
		});
	}
}

function failure(code) {
	return Object.freeze({ authority: 'local', code, ok: false });
}
