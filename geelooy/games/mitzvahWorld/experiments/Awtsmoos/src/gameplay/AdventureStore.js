// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdventureStore.js
 * @description Coordinates quest offers, progress, pins, completion, serialization, and restoration.
 * The Awtsmoos renews each mission while memory crosses reloads; Awtsmoos.com persists only
 * mutable record state, then reunites it with the canonical catalog instead of duplicating truth.
 */

import { ADVENTURE_CATALOG } from './AdventureCatalog.js';
import {
	adventureSnapshot,
	applyAdventureEvent,
	createAdventureRecord,
	resetAdventureRecord
} from './AdventureStoreRules.js';

const MAX_PINNED = 3;

export class AdventureStore {
	constructor(options = {}) {
		this.catalog = options.catalog || ADVENTURE_CATALOG;
		this.listeners = new Set();
		this.records = new Map(this.catalog.map(definition => [
			definition.id,
			createAdventureRecord(definition)
		]));
	}

	onChange(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	offer(questId) {
		return this.change(questId, record => {
			if (['available', 'declined'].includes(record.status)) record.status = 'offered';
		});
	}

	accept(questId) {
		return this.change(questId, record => {
			if (!['offered', 'available', 'declined'].includes(record.status)) return;
			record.status = 'active';
			record.acceptedAt = Date.now();
		});
	}

	decline(questId) {
		return this.change(questId, record => {
			if (record.status === 'offered') record.status = 'declined';
		});
	}

	abandon(questId) {
		return this.change(questId, record => {
			if (record.status === 'active') this.records.set(questId, resetAdventureRecord(record));
		});
	}

	togglePin(questId) {
		return this.change(questId, record => {
			if (record.status !== 'active') return;
			if (record.pinned) {
				record.pinned = false;
				return;
			}
			const pinned = [...this.records.values()].filter(item => item.pinned).length;
			if (pinned >= MAX_PINNED) throw new Error(`Only ${MAX_PINNED} quests may be pinned.`);
			record.pinned = true;
		});
	}

	recordEvent(event) {
		let changed = false;
		for (const record of this.records.values()) {
			changed = applyAdventureEvent(record, event) || changed;
		}
		if (changed) this.publish();
		return this.snapshot();
	}

	synchronize(questId, progress) {
		return this.change(questId, record => {
			record.status = progress?.status === 'complete' ? 'completed' : progress?.status || 'available';
			record.objectiveIndex = Number(progress?.objectiveIndex || 0);
			const objective = record.objectives[record.objectiveIndex];
			if (objective) objective.progress = Number(progress?.count || 0);
		});
	}

	serialize() {
		return [...this.records.values()].map(record => ({
			acceptedAt: record.acceptedAt || null,
			completedAt: record.completedAt || null,
			id: record.definition.id,
			objectiveIndex: record.objectiveIndex,
			objectives: record.objectives.map(objective => ({ progress: objective.progress })),
			pinned: Boolean(record.pinned),
			status: record.status
		}));
	}

	restore(records) {
		for (const saved of records || []) {
			const record = this.records.get(saved.id);
			if (!record) continue;
			record.acceptedAt = saved.acceptedAt || null;
			record.completedAt = saved.completedAt || null;
			record.objectiveIndex = Number(saved.objectiveIndex || 0);
			record.pinned = Boolean(saved.pinned);
			record.status = saved.status || 'available';
			for (let index = 0; index < record.objectives.length; index += 1) {
				record.objectives[index].progress = Number(saved.objectives?.[index]?.progress || 0);
			}
		}
		this.publish();
		return this.snapshot();
	}

	get(questId) {
		const record = this.records.get(questId);
		return record ? structuredClone(record) : null;
	}

	snapshot() {
		return adventureSnapshot(this.records);
	}

	change(questId, operation) {
		const record = this.records.get(questId);
		if (!record) throw new Error(`Unknown adventure: ${questId}`);
		operation(record);
		this.publish();
		return this.get(questId);
	}

	publish() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) listener(snapshot);
	}
}
