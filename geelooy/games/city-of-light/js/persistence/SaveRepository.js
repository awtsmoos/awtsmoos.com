//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class SaveRepository
 * @description
 * A save is a humble memory vessel, never a source of truth above the current
 * campaign laws. Awtsmoos.com repairs malformed or old data before it enters the
 * living game, just as the Awtsmoos renews form without depending on corruption.
 */

import { CampaignProgress } from '../campaign/CampaignProgress.js';

export const SAVE_VERSION = 2;
export const SAVE_KEY = 'awtsmoos.cityOfLight.campaign';

export class SaveRepository {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
	}

	load() {
		if (!this.storage) return this.createDefault();

		try {
			const rawValue = this.storage.getItem(SAVE_KEY);
			if (!rawValue) return this.createDefault();
			return this.normalize(JSON.parse(rawValue));
		} catch {
			return this.createDefault();
		}
	}

	save(snapshot) {
		const normalized = this.normalize(snapshot);
		if (!this.storage) return normalized;

		try {
			this.storage.setItem(SAVE_KEY, JSON.stringify(normalized));
		} catch {
			// A full or disabled store must not break the playable city.
		}

		return normalized;
	}

	clear() {
		try {
			this.storage?.removeItem(SAVE_KEY);
		} catch {
			// Clearing remains best-effort in restricted browsers.
		}
		return this.createDefault();
	}

	normalize(snapshot = {}) {
		const progress = new CampaignProgress(snapshot.progress || snapshot);
		const settings = snapshot.settings && typeof snapshot.settings === 'object'
			? snapshot.settings
			: {};

		return {
			version: SAVE_VERSION,
			progress: progress.toJSON(),
			settings: {
				reducedMotion: Boolean(settings.reducedMotion),
				highContrast: Boolean(settings.highContrast),
				muted: Boolean(settings.muted)
			},
			lastSeed: String(snapshot.lastSeed || 'city-of-light').slice(0, 120),
			checkpoint: normalizeCheckpoint(snapshot.checkpoint)
		};
	}

	createDefault() {
		return this.normalize({});
	}
}

function normalizeCheckpoint(checkpoint) {
	if (!checkpoint || typeof checkpoint !== 'object') return null;
	const chapter = Math.max(1, Math.floor(Number(checkpoint.chapter) || 1));
	const x = Number(checkpoint.x);
	const y = Number(checkpoint.y);
	if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

	return {
		chapter,
		x,
		y,
		stageIndex: Math.max(0, Math.floor(Number(checkpoint.stageIndex) || 0))
	};
}
