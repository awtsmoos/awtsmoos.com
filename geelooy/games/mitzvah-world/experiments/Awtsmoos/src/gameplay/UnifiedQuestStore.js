// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UnifiedQuestStore.js
 * @description Projects catalog adventures and the dedicated meadow Shlichus through one store.
 * The Awtsmoos gives one purpose many lawful surfaces; Awtsmoos.com merges without duplicating
 * records, delegates mutations to their real owner, and publishes one tracker/log/map snapshot.
 */

import { minimalMeadowDedicatedQuestRecord } from '../ui/MinimalMeadowMenuQuestRecord.js';

export class UnifiedQuestStore {
	constructor(options = {}) {
		this.catalog = options.catalog || null;
		this.dedicated = options.dedicated || null;
		this.listeners = new Set();
		this.unsubscribers = [
			this.catalog?.onChange?.(() => this.publish()),
			this.dedicated?.onChange?.(() => this.publish())
		].filter(Boolean);
	}

	onChange(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	snapshot() {
		const source = this.catalog?.snapshot?.() || emptySnapshot();
		const records = uniqueRecords([
			...source.active,
			...source.available,
			...source.completed,
			minimalMeadowDedicatedQuestRecord(this.dedicated?.snapshot?.())
		].filter(Boolean));
		const active = records.filter(record => ['active', 'ready'].includes(record.status));
		const available = records.filter(record => ['available', 'declined', 'offered'].includes(record.status));
		const completed = records.filter(record => record.status === 'completed');
		return {
			active,
			available,
			completed,
			pinned: active.filter(record => record.pinned)
		};
	}

	get(questId) {
		return allRecords(this.snapshot()).find(record => record.definition.id === questId) || null;
	}

	accept(questId) {
		return this.isDedicated(questId)
			? this.dedicated.accept()
			: this.catalog?.accept?.(questId);
	}

	decline(questId) {
		return this.isDedicated(questId)
			? this.dedicated.decline()
			: this.catalog?.decline?.(questId);
	}

	abandon(questId) {
		return this.isDedicated(questId)
			? this.dedicated.snapshot()
			: this.catalog?.abandon?.(questId);
	}

	togglePin(questId) {
		return this.isDedicated(questId)
			? this.dedicated.snapshot()
			: this.catalog?.togglePin?.(questId);
	}

	synchronize(questId, progress) {
		return this.catalog?.synchronize?.(questId, progress);
	}

	recordEvent(event) {
		return this.catalog?.recordEvent?.(event) || this.snapshot();
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe?.();
		this.listeners.clear();
	}

	isDedicated(questId) {
		return this.dedicated?.snapshot?.().definition?.id === questId;
	}

	publish() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) listener(snapshot);
	}
}

function allRecords(snapshot) {
	return [...snapshot.active, ...snapshot.available, ...snapshot.completed];
}

function emptySnapshot() {
	return { active: [], available: [], completed: [], pinned: [] };
}

function uniqueRecords(records) {
	return [...new Map(records.map(record => [record.definition.id, record])).values()];
}
