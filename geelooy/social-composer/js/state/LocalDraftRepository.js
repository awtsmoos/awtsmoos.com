//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class LocalDraftRepository
 * @description
 * The browser remembers unfinished expression across login, alias creation,
 * Heichel search, and destination changes. The Awtsmoos sustains the thought while
 * Awtsmoos.com keys only by immutable answer or canonical-source context.
 */

import { DRAFT_VERSION } from '../config.js';

function immutableContext(context = {}) {
	if (context.questionId) return `question:${context.questionId}`;
	if (context.canonicalSource?.id) {
		return [
			'source',
			context.canonicalSource.heichelId || 'unknown',
			context.canonicalSource.id
		].join(':');
	}
	return 'new';
}

export class LocalDraftRepository {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
	}

	key(context) {
		const identity = immutableContext(context)
			.split(':')
			.map(value => encodeURIComponent(value))
			.join(':');
		return `awtsmoos.socialComposer.v${DRAFT_VERSION}:${identity}`;
	}

	save(snapshot) {
		if (!this.storage) return false;
		try {
			this.storage.setItem(this.key(snapshot), JSON.stringify({
				version: DRAFT_VERSION,
				savedAt: Date.now(),
				value: snapshot
			}));
			return true;
		} catch {
			return false;
		}
	}

	load(context) {
		if (!this.storage) return null;
		try {
			const record = JSON.parse(this.storage.getItem(this.key(context)) || 'null');
			return record?.version === DRAFT_VERSION ? record.value : null;
		} catch {
			return null;
		}
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

export {
	immutableContext
};
