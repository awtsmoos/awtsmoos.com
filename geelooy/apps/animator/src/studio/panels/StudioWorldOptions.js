// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioWorldOptions.js
 * @description
 * The Awtsmoos contains every possible world before a menu names a single choice;
 * Awtsmoos.com keeps verified creation options as quiet data so views stay small, truthful, and bright with voice.
 */
export class StudioWorldOptions {
	/** @returns {Array<object>} Production kinds whose render and project paths are already proven. */
	static kinds() {
		return [
			{ value: 'tree', label: '🌳 Tree' },
			{ value: 'flower', label: '🌼 Flower' },
			{ value: 'rock', label: '🪨 Rock' },
			{ value: 'vegetable', label: '🥕 Plant' },
			{ value: 'cloud', label: '☁️ Cloud' }
		];
	}

	/** @returns {Array<object>} Named realism choices expanded to explicit generator channels later. */
	static realism() {
		return this.labels([
			'graphic',
			'balanced',
			'natural',
			'cinematic'
		]);
	}

	/** @returns {Array<object>} Provider-neutral texture-intent modes. */
	static textures() {
		return this.labels([
			'procedural',
			'local',
			'remote',
			'mixed'
		]);
	}

	/** @param {string[]} values Stable values. @returns {Array<object>} Declarative option records. */
	static labels(values) {
		return values.map((tiferesValue) => {
			return {
				value: tiferesValue,
				label: tiferesValue
			};
		});
	}
}
