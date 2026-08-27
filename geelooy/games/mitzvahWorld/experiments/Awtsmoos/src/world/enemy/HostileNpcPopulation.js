// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HostileNpcPopulation.js
 * @description Owns hostile actors, indexed Torah targeting, melee, and quest evidence.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { enemyDefeatAdventureEvent } from './EnemyAdventureEvent.js';
import { ENEMY_STATE } from './EnemyStates.js';
import { HostileTorahAbilitySystem } from './HostileTorahAbilitySystem.js?v=20260721-spatial-targeting-01';
import { ShadowDemonActor } from './ShadowDemonActor.js';
import { shadowDemonProfiles } from './ShadowDemonProfiles.js';

export class HostileNpcPopulation {
	constructor(options) {
		this.bus = options.bus;
		this.camera = options.camera;
		this.group = new Group();
		this.group.name = 'Awtsmoos_hostile_shadow_population';
		this.abilitySystem = new HostileTorahAbilitySystem(options.bus, []);
		this.actors = shadowDemonProfiles(options.quality).map(profile => new ShadowDemonActor({
			bus: options.bus,
			camera: options.camera,
			canvas: options.canvas,
			defense: this.abilitySystem.defense,
			ground: options.ground,
			profile
		}));
		this.abilitySystem.setActors(this.actors);
		for (const actor of this.actors) this.group.add(actor.group);
		this.selected = null;
		this.playerState = null;
		this.unsubscribers = [
			this.bus.on('torah:use', passage => this.applyTorahPassage(passage)),
			this.bus.on('combat:melee', request => this.applyMelee(request)),
			this.bus.on('target:cycle', () => this.cycleTarget()),
			this.bus.on('npc:target', payload => this.clearDifferentTarget(payload)),
			this.bus.on('enemy:defeated', payload => this.publishAdventureEvent(payload))
		];
	}

	update(deltaTime, playerState) {
		this.playerState = playerState;
		this.abilitySystem.setPlayerState(playerState);
		const now = performance.now() / 1000;
		for (const actor of this.actors) {
			actor.update(deltaTime, playerState, now);
			this.abilitySystem.updateActor(actor);
		}
		if (this.selected?.state === ENEMY_STATE.DEFEATED) this.selected = null;
	}

	applyTorahPassage(passage) {
		return this.abilitySystem.apply(passage, this.selected?.profile?.id || null);
	}

	applyMelee(request) {
		const result = this.selected
			? this.selected.applyMelee(request, this.playerState)
			: rejection(request, 'TARGET_REQUIRED');
		this.bus.emit('combat:melee-result', result);
		return result;
	}

	candidateFromPointer(event) {
		const hits = this.actors
			.filter(actor => actor.hitPointer(event))
			.map(actor => ({
				actor,
				distance: distanceFromCamera(actor, this.camera),
				population: this
			}));
		return hits.sort((first, second) => first.distance - second.distance)[0] || null;
	}

	activateCandidate(candidate) {
		this.selectActor(candidate.actor);
	}

	cycleTarget() {
		const living = this.actors.filter(actor => actor.state !== ENEMY_STATE.DEFEATED);
		if (!living.length) return false;
		const index = Math.max(-1, living.indexOf(this.selected));
		this.selectActor(living[(index + 1) % living.length]);
		return true;
	}

	selectActor(actor) {
		if (this.selected && this.selected !== actor) this.selected.clear(true);
		this.selected = actor;
		actor.target();
	}

	clearAll() {
		if (!this.selected) return;
		this.selected.clear();
		this.selected = null;
	}

	clearDifferentTarget(payload) {
		if (!this.selected || payload?.id === this.selected.profile.id) return;
		this.selected.clear(true);
		this.selected = null;
	}

	publishAdventureEvent(payload) {
		this.abilitySystem.removeActor(payload?.id);
		if (payload?.id === this.selected?.profile.id) this.selected = null;
		const event = enemyDefeatAdventureEvent(payload);
		if (event) this.bus.emit('quest:event', event);
	}

	diagnostics() {
		const actors = this.actors.map(actor => actor.payload());
		return {
			active: actors.filter(actor => actor.state !== ENEMY_STATE.DEFEATED).length,
			actors,
			playerContextReady: Boolean(this.playerState),
			selectedId: this.selected?.profile.id || null,
			torahTargeting: this.abilitySystem.diagnostics().targeting
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.abilitySystem.spatialIndex.clear();
		this.group.parent?.remove(this.group);
	}
}

function rejection(request, reason) {
	return { accepted: false, attackId: request?.attack?.id || null, reason, targetId: null };
}

function distanceFromCamera(actor, camera) {
	const hint = actor.targetHint();
	const position = camera?.position || { x: 0, y: 0, z: 0 };
	return Math.hypot(hint.x - position.x, hint.y - position.y, hint.z - position.z);
}
