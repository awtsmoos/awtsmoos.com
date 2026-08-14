// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollPreferences
 * @description The Awtsmoos keeps one semantic pace preference synchronized,
 * migrated, recalibrated, and separate from every transient motion condition.
 */
import {
	autoScrollPreferencesFromStorageEvent,
	clearAutoScrollPreferences,
	readAutoScrollPreferences,
	writeAutoScrollPreferences
} from './AutoScrollStorage.js';
import {
	CUSTOM_PRESET,
	DEFAULT_SEMANTIC_PREFERENCES,
	LPM_UNIT,
	legacySpeedToPreferences,
	normalizeSemanticPreferences,
	preferencesForPreset
} from './SemanticPacePolicy.js';

function convertedValue(preferences, unit) {
	if (preferences.unit === unit) {
		return preferences.value;
	}
	return unit === LPM_UNIT ? preferences.value / 30 : preferences.value * 30;
}

export class AutoScrollPreferences {
	constructor(state, semanticEngine) {
		this.state = state;
		this.semanticEngine = semanticEngine;
		this.connected = false;
	}

	connect() {
		if (this.connected || typeof window === 'undefined') {
			return;
		}
		this.connected = true;
		window.addEventListener('storage', event => {
			const preferences = autoScrollPreferencesFromStorageEvent(event);
			if (preferences) {
				this.apply(preferences, { persist: false });
			}
		});
	}

	load() {
		this.connect();
		return this.apply(readAutoScrollPreferences(), { persist: false });
	}

	apply(value, options = {}) {
		const preferences = normalizeSemanticPreferences(value);
		if (options.persist !== false) {
			writeAutoScrollPreferences(preferences);
		}
		this.state.update({ preferences }, false);
		const progress = this.semanticEngine.progress();
		this.state.update({ preferences, ...progress });
		return this.state.snapshot();
	}

	setPace(value) {
		return this.apply({
			...this.state.value.preferences,
			value,
			preset: CUSTOM_PRESET
		});
	}

	setUnit(unit) {
		const current = this.state.value.preferences;
		if (current.preset !== CUSTOM_PRESET) {
			return this.apply(preferencesForPreset(current.preset, unit, current.eyeLine));
		}
		return this.apply({
			...current,
			unit,
			value: convertedValue(current, unit)
		});
	}

	setPreset(name) {
		const current = this.state.value.preferences;
		return this.apply(preferencesForPreset(name, current.unit, current.eyeLine));
	}

	setEyeLine(value) {
		return this.apply({ ...this.state.value.preferences, eyeLine: value });
	}

	setLegacySpeed(value) {
		return this.apply(legacySpeedToPreferences(value));
	}

	reset() {
		clearAutoScrollPreferences();
		return this.apply(DEFAULT_SEMANTIC_PREFERENCES, { persist: false });
	}
}
