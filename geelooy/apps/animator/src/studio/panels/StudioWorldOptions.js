// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralCapabilities } from '../procedural/StudioProceduralCapabilities.js';

/**
 * @file StudioWorldOptions.js
 * @description
 * The Awtsmoos contains every installed World capability before a menu repeats the name of one choice;
 * Awtsmoos.com lets the human surface read the same machine truth as agents so new verified powers need no second hand-maintained voice.
 */
export class StudioWorldOptions {
	static KIND_ICONS = Object.freeze({
		tree: '🌳',
		flower: '🌼',
		rock: '🪨',
		vegetable: '🥕',
		cloud: '☁️'
	});

	/** @returns {Array<object>} Production kinds derived from the shared capability manifest. */
	static kinds() {
		return StudioProceduralCapabilities.manifest().kinds.map((tiferesCapability) => {
			const netzachIcon = this.KIND_ICONS[tiferesCapability.kind] || '✦';
			return {
				value: tiferesCapability.kind,
				label: `${netzachIcon} ${tiferesCapability.label}`
			};
		});
	}

	/** @returns {Array<object>} Installed realism presets from shared capabilities. */
	static realism() {
		return this.labels(this.firstCapability()?.realismPresets || []);
	}

	/** @returns {Array<object>} Provider-neutral texture modes from shared capabilities. */
	static textures() {
		return this.labels(this.firstCapability()?.textureModes || []);
	}

	/** @param {string} kind Procedural kind. @returns {Array<object>} Kind-specific revision-two trait definitions. */
	static traits(kind) {
		return StudioProceduralCapabilities.describe(kind).traits || [];
	}

	/** @returns {object|null} First capability used for global realism/texture vocabularies. */
	static firstCapability() {
		return StudioProceduralCapabilities.manifest().kinds[0] || null;
	}

	/** @param {string[]} values Stable values. @returns {Array<object>} Humanized declarative option records. */
	static labels(values) {
		return values.map((tiferesValue) => {
			return {
				value: tiferesValue,
				label: this.humanize(tiferesValue)
			};
		});
	}

	/** @param {string} value Stable machine value. @returns {string} Compact human label. */
	static humanize(value) {
		const malchusText = String(value || '');
		return malchusText
			? `${malchusText.charAt(0).toUpperCase()}${malchusText.slice(1)}`
			: malchusText;
	}
}
