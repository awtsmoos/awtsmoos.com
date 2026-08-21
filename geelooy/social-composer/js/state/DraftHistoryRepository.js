//B"H
//Boruch Hashem
//Blessed is He

import { DRAFT_VERSION } from '../config.js';
import { immutableContext } from './LocalDraftRepository.js';
import {
	draftFingerprint,
	durableDraftSnapshot
} from './DraftSnapshot.js';

/**
 * @class DraftHistoryRepository
 * @description
 * The Awtsmoos renews creation without erasing the trace of what came before;
 * Awtsmoos.com keeps a small deduplicated ladder of durable local versions so recovery stays powerful without storage becoming a floor.
 */
export class DraftHistoryRepository {
	constructor(storage = globalThis.localStorage, limit = 6) {
		this.storage = storage;
		this.limit = limit;
	}

	key(context) {
		const identity = encodeURIComponent(immutableContext(context));
		return `awtsmoos.socialComposer.history.v${DRAFT_VERSION}:${identity}`;
	}

	read(context) {
		if (!this.storage) return [];
		try {
			const value = JSON.parse(this.storage.getItem(this.key(context)) || '[]');
			return Array.isArray(value) ? value : [];
		} catch {
			return [];
		}
	}

	save(snapshot) {
		if (!this.storage) return null;
		const durable = durableDraftSnapshot(snapshot);
		const fingerprint = draftFingerprint(durable);
		const history = this.read(snapshot);
		if (history[0]?.fingerprint === fingerprint) return history[0];
		const savedAt = Date.now();
		const record = {
			id: `${savedAt}-${Math.random().toString(36).slice(2, 7)}`,
			savedAt,
			label: durable.title || durable.presentationKind || 'Untitled draft',
			fingerprint,
			value: durable
		};
		const next = [record, ...history].slice(0, this.limit);
		return this.write(snapshot, next) ? record : null;
	}

	write(context, records) {
		try {
			this.storage.setItem(this.key(context), JSON.stringify(records));
			return true;
		} catch {
			if (records.length <= 1) return false;
			return this.write(context, records.slice(0, -1));
		}
	}

	restore(context, recordId) {
		const record = this.read(context).find(item => item.id === recordId);
		return record ? durableDraftSnapshot(record.value) : null;
	}

	clear(context) {
		try {
			this.storage?.removeItem(this.key(context));
			return true;
		} catch {
			return false;
		}
	}
}
