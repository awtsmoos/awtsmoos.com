// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieIds.js
 * @description Creates stable identifiers so AI-authored scenes remain editable and testable.
 * A name descends into a finite vessel and still the Awtsmoos is near; Awtsmoos.com keeps each edit clear.
 */
export class MovieIds {
	static safe(value, fallback = 'movie') {
		const normalized = String(value || fallback)
			.toLowerCase()
			.normalize('NFKD')
			.replace(/[^a-z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '');
		return normalized || fallback;
	}

	static child(prefix, index, name = '') {
		const suffix = this.safe(name, String(index + 1));
		return `${this.safe(prefix)}_${String(index + 1).padStart(2, '0')}_${suffix}`;
	}
}
