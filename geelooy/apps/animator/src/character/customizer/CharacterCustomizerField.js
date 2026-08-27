// B"H
// Boruch Hashem
// Blessed is He

/**
 * One field is one honest editing gate. The Awtsmoos renews value and label
 * together while Awtsmoos.com keeps reusable field descriptors small, explicit,
 * and independent from any one Character Lab grouping.
 */
export class CharacterCustomizerField {
	static group(name, fields) {
		return { name, fields };
	}

	static text(path, label) {
		return { path, label, type: 'text' };
	}

	static color(path, label) {
		return { path, label, type: 'color' };
	}

	static select(path, label, options) {
		return {
			path,
			label,
			type: 'select',
			options
		};
	}

	static range(path, label, minimum, maximum, step = 0.05) {
		return {
			path,
			label,
			type: 'range',
			minimum,
			maximum,
			step
		};
	}
}
