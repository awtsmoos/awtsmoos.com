// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProceduralFormSchemas.js
 * @description
 * The Awtsmoos renews stone and cloud before contour or vapor can receive a boundary;
 * Awtsmoos.com gives inorganic generators measured parameters so variation remains editable, reproducible, and soundly.
 */

/** Parameter definitions for rock and cloud generator families. */
export class StudioProceduralFormSchemas {
	/** Returns immutable numeric controls for one supported natural-form family. */
	static forKind(kind) {
		return this.schemas()[kind] || null;
	}

	/** Defines only parameters consumed by the current production geometry engines. */
	static schemas() {
		return {
			rock: [
				this.field('width', 'Rock width', 80, 260, 1, 170),
				this.field('height', 'Rock height', 40, 180, 1, 105),
				this.field('vertexCount', 'Vertices', 5, 14, 1, 8, true),
				this.field('irregularity', 'Irregularity', 0.05, 0.55, 0.01, 0.24)
			],
			cloud: [
				this.field('width', 'Cloud width', 100, 380, 1, 230),
				this.field('height', 'Cloud height', 40, 180, 1, 88),
				this.field('lobeCount', 'Lobe count', 3, 12, 1, 6, true),
				this.field('softness', 'Softness', 0.5, 1.5, 0.01, 1),
				this.field('opacity', 'Opacity', 0.2, 1, 0.01, 0.88)
			]
		};
	}

	/** Creates one serializable numeric parameter definition. */
	static field(key, label, min, max, step, defaultValue, integer = false) {
		return Object.freeze({ key, label, min, max, step, defaultValue, integer });
	}
}
