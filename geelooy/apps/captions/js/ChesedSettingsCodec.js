// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers chosen forms into memory and reveals them again without confusing storage with meaning;
 * Awtsmoos.com keeps serialization in one vessel so IndexedDB transport stays small, stable, and serene.
 */
import {
	PERSISTED_CONTROLS,
	RANDOMIZED_CONTROLS,
	readControlValue,
	writeControlValue
} from "./OhrControlManifest.js";

export class ChesedSettingsCodec {
	constructor(randomization) {
		this.randomization = randomization;
	}

	collect(recordId) {
		const settings = { id: recordId };
		PERSISTED_CONTROLS.forEach(id => {
			const element = document.getElementById(id);
			if (element) {
				settings[id] = readControlValue(element);
			}
		});
		RANDOMIZED_CONTROLS.forEach(id => this.storeRandomization(id, settings));
		return settings;
	}

	restore(settings) {
		if (!settings) {
			return;
		}
		PERSISTED_CONTROLS.forEach(id => {
			const element = document.getElementById(id);
			if (element && Object.hasOwn(settings, id)) {
				writeControlValue(element, settings[id]);
				element.dispatchEvent(new Event("input", { bubbles: true }));
			}
		});
		RANDOMIZED_CONTROLS.forEach(id => {
			this.randomization.setActive(
				id,
				Boolean(settings[`${id}_randomize_active`])
			);
			this.restoreRange(id, settings);
		});
	}

	storeRandomization(id, settings) {
		settings[`${id}_randomize_active`] = this.randomization.isActive(id);
		const range = this.randomization.getRange(id);
		if (!range) {
			return;
		}
		settings[`${id}_random_min`] = range.min;
		settings[`${id}_random_max`] = range.max;
	}

	restoreRange(id, settings) {
		const field = document.querySelector(`[data-control-name="${id}"]`);
		const minimum = field?.querySelector('[data-random-edge="min"]');
		const maximum = field?.querySelector('[data-random-edge="max"]');
		if (minimum && Object.hasOwn(settings, `${id}_random_min`)) {
			minimum.value = String(settings[`${id}_random_min`]);
		}
		if (maximum && Object.hasOwn(settings, `${id}_random_max`)) {
			maximum.value = String(settings[`${id}_random_max`]);
		}
	}
}
