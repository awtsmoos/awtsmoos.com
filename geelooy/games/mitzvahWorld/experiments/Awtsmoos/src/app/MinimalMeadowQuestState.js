// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestState.js
 * @description Tracks three archetype defeats, three emptied corpses, and exact-once return.
 * The Awtsmoos remembers revealed forms rather than repeated names; Awtsmoos.com keeps battle
 * and recovery as two truthful gates before Reb Mendel may seal the Shlichus in light.
 */

import { completeMinimalMeadowQuest } from './MinimalMeadowQuestCompletion.js';
import { MINIMAL_MEADOW_DEMON_QUEST } from './MinimalMeadowQuestDefinition.js?v=20260728-vertical-slice';
import {
	minimalMeadowQuestDefeatIdentity,
	minimalMeadowQuestEncounterComplete,
	minimalMeadowQuestLootIdentity
} from './MinimalMeadowQuestEncounterContract.js';
import {
	MinimalMeadowQuestOptionalObjectives
} from './MinimalMeadowQuestOptionalObjectives.js';
import {
	createMinimalMeadowQuestSnapshot
} from './MinimalMeadowQuestSnapshot.js';

export class MinimalMeadowQuestState {
	constructor(runtime) {
		this.runtime = runtime;
		this.definition = MINIMAL_MEADOW_DEMON_QUEST;
		this.status = 'available';
		this.defeatedArchetypes = new Set();
		this.defeatedEnemyArchetypes = new Map();
		this.lootedArchetypes = new Set();
		this.listeners = new Set();
		this.completionReceipt = null;
		this.optionalObjectives = new MinimalMeadowQuestOptionalObjectives(
			runtime,
			() => this.status,
			() => this.publish('quest:optional-progress')
		);
		this.unsubscribers = [
			runtime.bus.on('enemy:defeated', event => this.recordDefeat(event)),
			runtime.bus.on('enemy:looted', event => this.recordLoot(event))
		];
	}

	offer() {
		this.runtime.bus.emit('quest:offer', this.snapshot());
		return this.snapshot();
	}
	accept() {
		if (this.status !== 'available') return this.snapshot();
		this.status = 'active';
		this.publish('quest:accepted');
		return this.snapshot();
	}
	decline() {
		this.runtime.bus.emit('quest:declined', this.snapshot());
		return this.snapshot();
	}
	recordDefeat(event = {}) {
		if (this.status !== 'active') return false;
		const identity = minimalMeadowQuestDefeatIdentity(event);
		if (!identity) return false;
		this.defeatedEnemyArchetypes.set(identity.enemyId, identity.archetype);
		const advanced = !this.defeatedArchetypes.has(identity.archetype);
		this.defeatedArchetypes.add(identity.archetype);
		if (advanced) this.publish('quest:progress');
		return advanced;
	}
	recordLoot(event = {}) {
		if (this.status !== 'active') return false;
		const identity = minimalMeadowQuestLootIdentity(
			event,
			this.defeatedEnemyArchetypes
		);
		if (!identity || this.lootedArchetypes.has(identity.archetype)) return false;
		this.lootedArchetypes.add(identity.archetype);
		if (minimalMeadowQuestEncounterComplete(
			this.defeatedArchetypes,
			this.lootedArchetypes
		)) {
			this.status = 'ready';
		}
		this.publish('quest:progress');
		return true;
	}
	complete() {
		if (this.status === 'completed') {
			return { accepted: false, reason: 'ALREADY_COMPLETED', ...this.snapshot() };
		}
		if (this.status !== 'ready') {
			return { accepted: false, reason: 'NOT_READY', ...this.snapshot() };
		}
		return completeMinimalMeadowQuest(this);
	}
	onChange(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}
	snapshot() {
		return createMinimalMeadowQuestSnapshot(this);
	}
	publish(eventName) {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) listener(snapshot);
		this.runtime.bus.emit(eventName, snapshot);
	}
	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.optionalObjectives.destroy();
		this.listeners.clear();
	}
}
