// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HostileTorahAbilitySystem.js
 * @description Resolves canonical Torah abilities through direct IDs and bounded spatial queries.
 */

import { PlayerCombatDefense } from '../../gameplay/PlayerCombatDefense.js';
import { torahAbilityFor } from '../../gameplay/TorahAbilityRules.js';
import { torahPassage } from '../../gameplay/TorahPassageCatalog.js';
import { ENEMY_STATE } from './EnemyStates.js';
import { HostileActorSpatialIndex } from './HostileActorSpatialIndex.js';
import { planarDistance } from './ShadowDemonMotion.js';

export class HostileTorahAbilitySystem {
	constructor(bus, actors, spatialIndex = new HostileActorSpatialIndex()) {
		this.bus = bus;
		this.spatialIndex = spatialIndex;
		this.defense = new PlayerCombatDefense();
		this.playerState = null;
		this._actors = [];
		this.setActors(actors);
	}

	get actors() {
		return this._actors;
	}

	set actors(actors) {
		this._actors = Array.isArray(actors) ? actors : [];
		this.spatialIndex.replace(this._actors);
	}

	setActors(actors = []) {
		this.actors = actors;
		return this._actors.length;
	}

	setPlayerState(playerState) {
		this.playerState = playerState;
	}

	updateActor(actor) {
		if (actor?.state === ENEMY_STATE.DEFEATED) return this.spatialIndex.remove(actor);
		return this.spatialIndex.update(actor);
	}

	removeActor(actorOrId) {
		return this.spatialIndex.remove(actorOrId);
	}

	apply(proposedPassage, selectedTarget) {
		const passage = torahPassage(proposedPassage?.id);
		if (!passage) return this.reject('UNKNOWN_PASSAGE');
		if (!this.playerState) return this.reject('PLAYER_STATE_UNAVAILABLE');
		const ability = torahAbilityFor(passage);
		const now = performance.now() / 1000;
		if (ability.targetMode === 'ward') return this.applyWard(ability, now);
		if (ability.statusEffects.includes('protection')) this.defense.activateProtection(now, 5);
		const targets = this.targetsFor(ability, selectedTarget);
		if (!targets.length) return this.reject('TARGET_REQUIRED', ability);
		const results = targets.map(actor => actor.applyTorahPassage(passage, this.playerState, now));
		if (!results.some(result => result.accepted)) {
			return this.reject(results[0]?.reason || 'ABILITY_REJECTED', ability, results);
		}
		return this.accept(ability, targets, results);
	}

	targetsFor(ability, selectedTarget) {
		if (ability.targetMode === 'single') {
			const selected = this.spatialIndex.resolve(selectedTarget);
			return this.isAvailable(selected, ability.range) ? [selected] : [];
		}
		const inRange = this.spatialIndex.queryRadius(this.playerState, ability.range)
			.filter(actor => this.isAvailable(actor, ability.range));
		inRange.sort((first, second) => this.distance(first) - this.distance(second));
		if (ability.targetMode !== 'chain') return inRange.slice(0, ability.maximumTargets);
		const selected = this.spatialIndex.resolve(selectedTarget);
		if (!this.isAvailable(selected, ability.range) || !inRange.includes(selected)) {
			return inRange.slice(0, ability.maximumTargets);
		}
		return [selected, ...inRange.filter(actor => actor !== selected)]
			.slice(0, ability.maximumTargets);
	}

	isAvailable(actor, range) {
		return Boolean(actor)
			&& actor.state !== ENEMY_STATE.DEFEATED
			&& this.distance(actor) <= range;
	}

	distance(actor) {
		return planarDistance(actor.group.position, this.playerState);
	}

	applyWard(ability, now) {
		this.defense.activateWard(now);
		this.bus.emit('combat:ward', { ability, defense: this.defense.snapshot(now) });
		return this.accept(ability, [], []);
	}

	accept(ability, targets, results) {
		const targetIds = targets.map(actor => actor.profile.id);
		const impact = { accepted: true, ability, results, targetIds };
		this.bus.emit('combat:ability', impact);
		this.bus.emit('torah:impact', impact);
		return impact;
	}

	reject(reason, ability = null, results = []) {
		const impact = { accepted: false, ability, reason, results, targetIds: [] };
		this.bus.emit('torah:impact', impact);
		return impact;
	}

	diagnostics() {
		return { targeting: this.spatialIndex.diagnostics() };
	}
}
