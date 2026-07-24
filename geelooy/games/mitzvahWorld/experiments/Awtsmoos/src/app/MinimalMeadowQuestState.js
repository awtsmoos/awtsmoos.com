// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestState.js
 * @description Tracks offer, acceptance, three unique defeats, readiness, reward, and completion.
 * The Awtsmoos renews every act beyond counting; Awtsmoos.com nevertheless records finite
 * mission truth once, rejects duplicate kills, grants canonical inventory, and publishes progress.
 */

import { rewardMinimalCombatPlayer } from './MinimalMeadowCombatSupport.js?v=20260723-meadow-11';
import { MINIMAL_MEADOW_DEMON_QUEST } from './MinimalMeadowQuestDefinition.js?v=20260724-meadow-17';

export class MinimalMeadowQuestState {
	constructor(runtime) {
		this.runtime = runtime;
		this.definition = MINIMAL_MEADOW_DEMON_QUEST;
		this.status = 'available';
		this.defeatedIds = new Set();
		this.listeners = new Set();
		this.unsubscribe = runtime.bus.on('enemy:defeated', event => this.recordDefeat(event));
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
		if (this.status !== 'active') return;
		const enemyId = event.id || event.targetId;
		if (!enemyId || this.defeatedIds.has(enemyId)) return;
		this.defeatedIds.add(enemyId);
		if (this.defeatedIds.size >= this.definition.objective.count) this.status = 'ready';
		this.publish('quest:progress');
	}

	complete() {
		if (this.status !== 'ready') return { accepted: false, ...this.snapshot() };
		this.status = 'completed';
		this.runtime.inventory.add('perutas', this.definition.reward.perutas);
		rewardMinimalCombatPlayer(this.runtime, this.definition.reward.xp);
		this.publish('quest:completed');
		return { accepted: true, ...this.snapshot() };
	}

	onChange(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	snapshot() {
		return {
			definition: this.definition,
			progress: Math.min(this.definition.objective.count, this.defeatedIds.size),
			remaining: Math.max(0, this.definition.objective.count - this.defeatedIds.size),
			status: this.status
		};
	}

	publish(eventName) {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) listener(snapshot);
		this.runtime.bus.emit(eventName, snapshot);
	}

	destroy() {
		this.unsubscribe();
		this.listeners.clear();
	}
}
