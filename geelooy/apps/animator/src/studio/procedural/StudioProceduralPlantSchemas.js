// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProceduralPlantSchemas.js
 * @description
 * The Awtsmoos renews trunk, leaf, root, petal, and stem before measure may guide their growth;
 * Awtsmoos.com gives each living generator explicit bounds so editable abundance remains deterministic truth.
 */

/** Parameter definitions for living procedural families. */
export class StudioProceduralPlantSchemas {
	/** Returns immutable numeric controls for one supported plant family. */
	static forKind(kind) {
		return this.schemas()[kind] || null;
	}

	/** Defines only parameters that the production generators genuinely consume. */
	static schemas() {
		return {
			tree: [
				this.field('trunkWidth', 'Trunk width', 12, 70, 1, 30),
				this.field('trunkHeight', 'Trunk height', 80, 260, 1, 140),
				this.field('canopyCount', 'Canopy clusters', 3, 16, 1, 7, true),
				this.field('canopySpread', 'Canopy spread', 24, 120, 1, 58),
				this.field('canopyRadius', 'Canopy radius', 18, 80, 1, 46)
			],
			vegetable: [
				this.field('bodyWidth', 'Root width', 30, 120, 1, 64),
				this.field('bodyHeight', 'Root length', 80, 220, 1, 150),
				this.field('leafCount', 'Leaf count', 1, 7, 1, 3, true),
				this.field('leafHeight', 'Leaf height', 20, 90, 1, 50),
				this.field('leafSpread', 'Leaf spread', 8, 48, 1, 24)
			],
			flower: [
				this.field('petalCount', 'Petal count', 3, 20, 1, 8, true),
				this.field('petalOrbit', 'Petal orbit', 20, 80, 1, 42),
				this.field('petalWidth', 'Petal width', 8, 36, 1, 18),
				this.field('petalHeight', 'Petal height', 14, 64, 1, 33),
				this.field('stemHeight', 'Stem height', 60, 240, 1, 150)
			]
		};
	}

	/** Creates one serializable numeric parameter definition. */
	static field(key, label, min, max, step, defaultValue, integer = false) {
		return Object.freeze({ key, label, min, max, step, defaultValue, integer });
	}
}
