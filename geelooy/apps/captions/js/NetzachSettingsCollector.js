// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers many finite choices into one rendering intention;
 * Awtsmoos.com keeps renderer payloads explicit so advanced controls never become hidden magic.
 */
import {
	DIRECT_CONTROLS,
	RANDOMIZED_CONTROLS,
	readControlValue
} from "./OhrControlManifest.js";

export class NetzachSettingsCollector {
	constructor(randomization) {
		this.randomization = randomization;
	}

	/** @returns {object} Renderer settings preserving the original worker contract. */
	collect() {
		const settings = {};

		DIRECT_CONTROLS.forEach(id => {
			if (["batchInput", "headerInput", "useDirectoryPicker"].includes(id)) {
				return;
			}
			const element = document.getElementById(id);
			if (element) {
				settings[id] = readControlValue(element);
			}
		});

		RANDOMIZED_CONTROLS.forEach(id => {
			const element = document.getElementById(id);
			if (!element) {
				return;
			}
			settings[id] = {
				value: readControlValue(element),
				randomize: this.randomization.isActive(id),
				range: this.randomization.getRange(id)
			};
		});

		return settings;
	}

	/**
	 * @param {string} value Raw batch caption text.
	 * @returns {string[]} Paragraph-separated captions, preserving blank fallback.
	 */
	parseCaptions(value) {
		const captions = String(value || "")
			.split(/\n\s*\n/)
			.map(entry => entry.trim())
			.filter(Boolean);
		return captions.length ? captions : [" "];
	}
}
