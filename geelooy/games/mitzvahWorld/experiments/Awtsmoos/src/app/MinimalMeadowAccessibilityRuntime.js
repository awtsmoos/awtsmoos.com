// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAccessibilityRuntime.js
 * @description Owns persisted accessibility settings while focused media helpers observe presentation.
 * The Awtsmoos reveals gameplay through many channels so no single sense becomes a gate;
 * Awtsmoos.com composes motion, contrast, text, flash, shake, timing, persistence, and authority safely.
 */

import {
	applyMinimalMeadowAccessibilityDocument,
	bindMinimalMeadowAccessibilityMedia,
	createMinimalMeadowAccessibilityMedia
} from './MinimalMeadowAccessibilityMedia.js';
import {
	effectiveMinimalMeadowTimingMultiplier,
	normalizeMinimalMeadowAccessibilitySettings,
	restoreMinimalMeadowAccessibilitySettings
} from './MinimalMeadowAccessibilitySettings.js';

const STORAGE_KEY = 'awtsmoos.mitzvah-world.accessibility.v1';

export class MinimalMeadowAccessibilityRuntime {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.documentValue = documentValue;
		this.environment = environment;
		this.media = createMinimalMeadowAccessibilityMedia(environment);
		this.settings = restoreMinimalMeadowAccessibilitySettings(
			environment.localStorage,
			STORAGE_KEY
		);
		this.unsubscribers = [
			runtime.bus.on('accessibility:set', patch => this.set(patch))
		];
		this.mediaListeners = bindMinimalMeadowAccessibilityMedia(
			this.media,
			() => this.apply()
		);
		this.apply();
	}

	set(patch = {}) {
		this.settings = normalizeMinimalMeadowAccessibilitySettings({
			...this.settings,
			...patch
		});
		this.save();
		this.apply();
		return this.snapshot();
	}

	apply() {
		const snapshot = this.snapshot();
		this.runtime.accessibility = {
			...(this.runtime.accessibility || {}),
			...snapshot
		};
		applyMinimalMeadowAccessibilityDocument(
			this.documentValue,
			snapshot
		);
		this.runtime.bus.emit('accessibility:changed', snapshot);
	}

	snapshot() {
		const rewardMultiplier = Number(
			this.runtime.accessibility?.rewardTimingWindowMultiplier || 1
		);
		return Object.freeze({
			cameraShakeMultiplier: this.settings.cameraShakeMultiplier,
			flashMultiplier: this.settings.flashMultiplier,
			forcedColors: Boolean(this.media.forcedColors?.matches),
			highContrast: Boolean(this.media.highContrast?.matches),
			reducedMotion: Boolean(this.media.reducedMotion?.matches),
			rewardTimingWindowMultiplier: rewardMultiplier,
			textScale: this.settings.textScale,
			timingWindowMultiplier: effectiveMinimalMeadowTimingMultiplier(
				this.settings.timingWindowMultiplier,
				rewardMultiplier
			),
			userTimingWindowMultiplier: this.settings.timingWindowMultiplier
		});
	}

	save() {
		try {
			this.environment.localStorage?.setItem?.(
				STORAGE_KEY,
				JSON.stringify(this.settings)
			);
		} catch {}
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		for (const unsubscribe of this.mediaListeners) unsubscribe();
		this.unsubscribers = [];
		this.mediaListeners = [];
	}
}
