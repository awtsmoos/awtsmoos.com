// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HostileTorahAbilitySystem.js
 * @description Resolves canonical Torah abilities against one bounded hostile population.
 * The Awtsmoos renews wisdom, target, ward, and consequence together; Awtsmoos.com publishes
 * one explicit acknowledgment so focus and cooldown commit only after the world accepts impact.
 */

import { PlayerCombatDefense } from '../../gameplay/PlayerCombatDefense.js';
import { torahAbilityFor } from '../../gameplay/TorahAbilityRules.js';
import { torahPassage } from '../../gameplay/TorahPassageCatalog.js';
import { ENEMY_STATE } from './EnemyStates.js';
import { planarDistance } from './ShadowDemonMotion.js';

export class HostileTorahAbilitySystem {
	constructor(bus, actors) {
		this.bus = bus;
		this.actors = actors;
		this.defense = new PlayerCombatDefense();
		this.playerState = null;
	}

	setPlayerState(playerState) {
		this.playerState = playerState;
	}

	apply(proposedPassage, selectedActor) {
		const passage = torahPassage(proposedPassage?.id);
		if (!passage) return this.reject('UNKNOWN_PASSAGE');
		if (!this.playerState) return this.reject('PLAYER_STATE_UNAVAILABLE');
		const ability = torahAbilityFor(passage);
		const now = performance.now() / 1000;
		if (ability.targetMode === 'ward') {
			this.defense.activateWard(now);
			this.bus.emit('combat:ward', {
				ability,
				defense: this.defense.snapshot(now)
			});
			return this.accept(ability, [], []);
		}
		if (ability.statusEffects.includes('protection')) {
			this.defense.activateProtection(now, 5);
		}
		const targets = this.targetsFor(ability, selectedActor);
		if (!targets.length) return this.reject('TARGET_REQUIRED', ability);
		const results = targets.map(actor => actor.applyTorahPassage(
			passage,
			this.playerState,
			now
		));
		const accepted = results.some(result => result.accepted);
		if (!accepted) {
			return this.reject(results[0]?.reason || 'ABILITY_REJECTED', ability, results);
		}
		return this.accept(ability, targets, results);
	}

	targetsFor(ability, selectedActor) {
		const living = this.actors.filter(actor => actor.state !== ENEMY_STATE.DEFEATED);
		const inRange = living.filter(actor => (
			planarDistance(actor.group.position, this.playerState) <= ability.range
		));
		if (ability.targetMode === 'single') {
			return selectedActor && inRange.includes(selectedActor) ? [selectedActor] : [];
		}
		const ordered = inRange.sort((first, second) => (
			planarDistance(first.group.position, this.playerState)
			- planarDistance(second.group.position, this.playerState)
		));
		if (ability.targetMode === 'chain' && selectedActor && inRange.includes(selectedActor)) {
			return [selectedActor, ...ordered.filter(actor => actor !== selectedActor)]
				.slice(0, ability.maximumTargets);
		}
		return ordered.slice(0, ability.maximumTargets);
	}

	accept(ability, targets, results) {
		const impact = {
			accepted: true,
			ability,
			results,
			targetIds: targets.map(actor => actor.profile.id)
		};
		this.bus.emit('combat:ability', impact);
		this.bus.emit('torah:impact', impact);
		return impact;
	}

	reject(reason, ability = null, results = []) {
		const impact = { accepted: false, ability, reason, results, targetIds: [] };
		this.bus.emit('torah:impact', impact);
		return impact;
	}
}
